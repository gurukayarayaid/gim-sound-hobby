/* ============================================================
   SOUND HOBBY — kartu hobi + pembuat kalimat (Web Speech API)
   ============================================================ */

(function () {
  'use strict';

  const HOBBIES = window.HOBBIES || [];
  const SENTENCES = window.SENTENCES || [];
  const PLACES = window.PLACES || [];
  const PLACE_BY_HOBBY = window.HOBBY_PLACES || {};

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.prototype.slice.call(document.querySelectorAll(selector));

  const el = {
    tabs: $('#main-tabs'),
    viewCards: $('#view-cards'),
    viewSentences: $('#view-sentences'),

    grid: $('#grid'),
    chips: $('#chips'),
    search: $('#search'),
    searchClear: $('#search-clear'),
    status: $('#status'),
    statusText: $('#status-text'),
    count: $('#count'),
    empty: $('#empty'),

    sentenceGrid: $('#sentence-grid'),
    sentenceSearch: $('#sentence-search'),
    sentenceSearchClear: $('#sentence-search-clear'),
    sentenceStatus: $('#sentence-status'),
    sentenceStatusText: $('#sentence-status-text'),
    sentenceCount: $('#sentence-count'),
    sentenceEmpty: $('#sentence-empty'),

    builderHobby: $('#builder-hobby'),
    builderPlace: $('#builder-place'),
    builderResult: $('.builder-result'),
    builderEmoji: $('#builder-emoji'),
    builderEn: $('#builder-en'),
    builderIdn: $('#builder-idn'),
    builderSpeak: $('#btn-builder-speak'),
    builderRandom: $('#btn-builder-random'),
    builderTip: $('#builder-tip'),

    lang: $('#seg-lang'),
    shuffle: $('#btn-shuffle'),
    sentenceShuffle: $('#btn-sentences-shuffle'),
    full: $('#btn-full'),
    toast: $('#toast')
  };

  const state = {
    screen: 'cards',
    order: HOBBIES.slice(),
    sentenceOrder: SENTENCES.slice(),
    category: 'Semua',
    cardQuery: '',
    sentenceQuery: '',
    lang: 'en',
    voices: [],
    speakingId: null,
    playAll: false,
    playList: [],
    playIndex: 0,
    speakToken: 0,
    safetyTimer: null,
    kickTimer: null,
    nextTimer: null,
    toastTimer: null
  };

  const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const CONTEXT = 'Maaf, browser ini belum mendukung fitur suara. Coba Chrome, Edge, atau Safari terbaru.';
  const DEFAULT_STATUS = {
    cards: 'Siap! Ketuk ikon speaker pada kartu untuk mendengarkan.',
    sentences: 'Pilih contoh kalimat, lalu ketuk speakernya untuk mendengarkan.'
  };

  /* ---------------------------------- util --------------------------------- */

  function esc(value) {
    return String(value).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  }

  function normalize(value) {
    return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function labelOf(hobby) {
    return state.lang === 'en' ? hobby.word : hobby.idn;
  }

  function sentenceTextOf(sentence) {
    return state.lang === 'en' ? sentence.en : sentence.idn;
  }

  function langTag(lang) {
    return lang === 'en' ? 'en-US' : 'id-ID';
  }

  function findHobby(id) {
    return HOBBIES.find((h) => h.id === id) || null;
  }

  function activeGrid() {
    return state.screen === 'cards' ? el.grid : el.sentenceGrid;
  }

  function activeStatus() {
    return state.screen === 'cards' ? el.status : el.sentenceStatus;
  }

  function activeStatusText() {
    return state.screen === 'cards' ? el.statusText : el.sentenceStatusText;
  }

  function idleMessage() {
    return state.screen === 'cards'
      ? 'Ketuk ikon speaker untuk mendengarkan kembali.'
      : 'Ketuk speaker pada kalimat untuk mendengarkan kembali.';
  }

  function visibleCards() {
    const q = normalize(state.cardQuery.trim());
    return state.order.filter((h) => {
      const inCategory = state.category === 'Semua' || h.category === state.category;
      const inSearch = !q || normalize(`${h.word} ${h.idn} ${h.category}`).includes(q);
      return inCategory && inSearch;
    });
  }

  function visibleSentences() {
    const q = normalize(state.sentenceQuery.trim());
    return state.sentenceOrder.filter((s) => {
      const hobby = findHobby(s.hobby);
      const haystack = `${s.en} ${s.idn} ${hobby ? hobby.word + ' ' + hobby.idn : ''}`;
      return !q || normalize(haystack).includes(q);
    });
  }

  function currentItems() {
    if (state.screen === 'cards') {
      return visibleCards().map((h) => ({ id: h.id, text: labelOf(h), lang: state.lang }));
    }
    return visibleSentences().map((s) => ({ id: s.id, text: sentenceTextOf(s), lang: state.lang }));
  }

  function showToast(message, duration) {
    el.toast.textContent = message;
    el.toast.hidden = false;
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => { el.toast.hidden = true; }, duration || 4200);
  }

  /* --------------------------------- render -------------------------------- */

  function cardHTML(hobby, index) {
    const label = labelOf(hobby);
    return `
      <article class="card${state.speakingId === hobby.id ? ' is-speaking' : ''}" data-id="${hobby.id}" style="--i:${index}">
        <button type="button" class="card-hit" data-speak="${hobby.id}" aria-label="Dengarkan: ${esc(label)}">
          <span class="thumb">
            <img src="${hobby.img}" alt="${esc(hobby.word)}" decoding="async">
            <span class="num">${String(index + 1).padStart(2, '0')}</span>
            <span class="cat">${hobby.emoji} ${esc(hobby.category)}</span>
          </span>
          <span class="card-body">
            <span class="word">${esc(hobby.word)}</span>
            <span class="meaning">${esc(hobby.idn)}</span>
          </span>
        </button>
        <button type="button" class="spk-btn" data-speak="${hobby.id}"
                aria-label="Dengarkan pengucapan: ${esc(label)}" title="Dengarkan pengucapan">
          <svg class="ic" aria-hidden="true"><use href="#ico-speaker"></use></svg>
        </button>
      </article>`;
  }

  function sentenceCardHTML(sentence, index) {
    const hobby = findHobby(sentence.hobby) || {};
    const label = sentenceTextOf(sentence);
    return `
      <article class="card sentence-card${state.speakingId === sentence.id ? ' is-speaking' : ''}" data-id="${sentence.id}" style="--i:${index}">
        <button type="button" class="card-hit" data-speak-sentence="${sentence.id}" aria-label="Dengarkan kalimat: ${esc(label)}">
          <span class="sentence-head">
            <img src="${hobby.img}" alt="" decoding="async">
            <span class="sentence-meta">
              <b>${hobby.emoji || '⭐'} ${esc(hobby.word || '')}</b>
              <small>Kalimat ${String(index + 1).padStart(2, '0')}</small>
            </span>
          </span>
          <span class="sentence-body">
            <span class="sentence-en${state.lang === 'en' ? ' is-active' : ''}">${esc(sentence.en)}</span>
            <span class="sentence-idn${state.lang === 'id' ? ' is-active' : ''}">${esc(sentence.idn)}</span>
          </span>
        </button>
        <button type="button" class="spk-btn" data-speak-sentence="${sentence.id}"
                aria-label="Dengarkan kalimat: ${esc(label)}" title="Dengarkan kalimat">
          <svg class="ic" aria-hidden="true"><use href="#ico-speaker"></use></svg>
        </button>
      </article>`;
  }

  function buildChips() {
    const categories = ['Semua', ...new Set(HOBBIES.map((h) => h.category))];
    el.chips.innerHTML = categories.map((category) => {
      const total = category === 'Semua' ? HOBBIES.length : HOBBIES.filter((h) => h.category === category).length;
      const active = category === state.category;
      return `<button type="button" class="chip${active ? ' on' : ''}" data-cat="${esc(category)}" aria-pressed="${active}">${esc(category)} <b>${total}</b></button>`;
    }).join('');
  }

  function renderCards() {
    const list = visibleCards();
    el.count.textContent = `${list.length} dari ${HOBBIES.length} hobi`;
    el.empty.hidden = list.length > 0;
    el.grid.innerHTML = list.map(cardHTML).join('');
  }

  function renderSentences() {
    const list = visibleSentences();
    el.sentenceCount.textContent = `${list.length} dari ${SENTENCES.length} kalimat`;
    el.sentenceEmpty.hidden = list.length > 0;
    el.sentenceGrid.innerHTML = list.map(sentenceCardHTML).join('');
  }

  /* --------------------------------- builder ------------------------------- */

  function populateBuilder() {
    el.builderHobby.innerHTML = HOBBIES.map((h) => `<option value="${h.id}">${h.emoji} ${esc(h.word)}</option>`).join('');
    el.builderPlace.innerHTML = PLACES.map((p) => `<option value="${esc(p.en)}">${esc(p.en)} — ${esc(p.idn)}</option>`).join('');
    el.builderHobby.value = 'reading';
    el.builderPlace.value = PLACE_BY_HOBBY.reading || PLACES[0].en;
    updateBuilder();
  }

  function draft() {
    const hobby = findHobby(el.builderHobby.value) || HOBBIES[0];
    const place = PLACES.find((p) => p.en === el.builderPlace.value) || PLACES[0];
    // Kata pada kartu diawali huruf kapital; di tengah kalimat huruf pertamanya direndahkan.
    const phrase = hobby.word.charAt(0).toLowerCase() + hobby.word.slice(1);
    return {
      hobby: hobby,
      en: `I like ${phrase} ${place.prep} ${place.en}.`,
      idn: `Saya suka ${hobby.idn} di ${place.idn}.`
    };
  }

  function updateBuilder() {
    const text = draft();
    el.builderEmoji.textContent = text.hobby.emoji;
    el.builderEn.textContent = text.en;
    el.builderIdn.textContent = text.idn;
    el.builderEn.classList.toggle('is-active', state.lang === 'en');
    el.builderIdn.classList.toggle('is-active', state.lang === 'id');
    el.builderSpeak.setAttribute('aria-label', `Dengarkan kalimat: ${text.en}`);
    el.builderTip.innerHTML = state.lang === 'en'
      ? 'Kalimat akan dibacakan dalam bahasa <b>Inggris</b>. Ubah bahasa di menu <b>Kartu Hobi</b> untuk bahasa Indonesia.'
      : 'Kalimat akan dibacakan dalam bahasa <b>Indonesia</b>. Ubah bahasa di menu <b>Kartu Hobi</b> untuk bahasa Inggris.';
  }

  /* --------------------------------- speech -------------------------------- */

  function loadVoices() {
    if (!supported) return;
    state.voices = window.speechSynthesis.getVoices() || [];
  }

  function pickVoice(tag) {
    if (!state.voices.length) loadVoices();
    const wanted = tag.toLowerCase();
    const base = wanted.split('-')[0];
    const clean = (voice) => voice.lang.toLowerCase().replace('_', '-');
    return state.voices.find((v) => clean(v) === wanted)
      || state.voices.find((v) => clean(v).startsWith(base + '-'))
      || state.voices.find((v) => clean(v).startsWith(base))
      || null;
  }

  function setSpeaking(id, text, idleText) {
    state.speakingId = id;
    $$('.card.is-speaking').forEach((card) => card.classList.remove('is-speaking'));
    el.builderResult.classList.toggle('is-speaking', id === 'builder');

    if (id && id !== 'builder') {
      const node = activeGrid().querySelector(`[data-id="${id}"]`);
      if (node) node.classList.add('is-speaking');
    }

    activeStatus().classList.toggle('is-on', Boolean(id));
    activeStatusText().textContent = id
      ? `Memutarkan: “${text}”`
      : (idleText || idleMessage());
  }

  function resetStatuses() {
    [el.status, el.sentenceStatus].forEach((node) => node.classList.remove('is-on'));
    el.statusText.textContent = DEFAULT_STATUS.cards;
    el.sentenceStatusText.textContent = DEFAULT_STATUS.sentences;
  }

  function updatePlayAllButtons() {
    $$('[data-playall]').forEach((button) => {
      button.classList.toggle('playing', state.playAll);
      button.querySelector('.js-play-label').textContent = state.playAll ? 'Berhenti' : 'Putar Semua';
      button.querySelector('.js-play-icon').setAttribute('href', state.playAll ? '#ico-stop' : '#ico-play');
    });
  }

  function cancelSpeech() {
    state.speakToken++;
    clearTimeout(state.safetyTimer);
    clearTimeout(state.kickTimer);
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(null);
  }

  function stopPlayAll(message) {
    state.playAll = false;
    state.playIndex = 0;
    clearTimeout(state.nextTimer);
    cancelSpeech();
    updatePlayAllButtons();
    if (message) activeStatusText().textContent = message;
  }

  function speakText(text, options) {
    if (!supported) {
      showToast(CONTEXT, 6000);
      return;
    }
    const opts = options || {};
    const id = opts.id || null;
    const fromPlayAll = Boolean(opts.fromPlayAll);
    const lang = opts.lang || state.lang;

    // Kartu yang diketuk manual menghentikan mode "Putar Semua".
    if (state.playAll && !fromPlayAll) stopPlayAll();

    cancelSpeech();
    const token = state.speakToken;
    const tag = langTag(lang);

    setSpeaking(id, text);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = tag;
    utterance.rate = 0.88;
    utterance.pitch = 1.05;
    utterance.volume = 1;
    const voice = pickVoice(tag);
    if (voice) utterance.voice = voice;

    let finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      clearTimeout(state.safetyTimer);
      if (token !== state.speakToken) return;
      setSpeaking(null);
      if (state.playAll) {
        state.playIndex++;
        state.nextTimer = setTimeout(playNext, 700);
      }
    }

    utterance.onend = finish;
    utterance.onerror = finish;
    // Pengaman untuk browser yang kadang tidak memicu onend.
    state.safetyTimer = setTimeout(finish, Math.max(3200, text.length * 150));

    // Jeda kecil menghindari race condition cancel() -> speak() di Chrome.
    state.kickTimer = setTimeout(() => {
      if (token === state.speakToken) window.speechSynthesis.speak(utterance);
    }, 90);
  }

  function playNext() {
    if (!state.playAll) return;
    if (state.playIndex >= state.playList.length) {
      state.playAll = false;
      updatePlayAllButtons();
      setSpeaking(null, null, 'Selesai membacakan semuanya. 🎉');
      return;
    }
    const item = state.playList[state.playIndex];
    const node = activeGrid().querySelector(`[data-id="${item.id}"]`);
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    speakText(item.text, { id: item.id, fromPlayAll: true, lang: item.lang });
  }

  function togglePlayAll() {
    if (!supported) {
      showToast(CONTEXT, 6000);
      return;
    }
    if (state.playAll) {
      stopPlayAll('Pembacaan dihentikan.');
      return;
    }
    state.playList = currentItems();
    if (!state.playList.length) return;
    state.playAll = true;
    state.playIndex = 0;
    updatePlayAllButtons();
    playNext();
  }

  /* -------------------------------- navigation ----------------------------- */

  function switchScreen(name) {
    if (name === state.screen) return;
    stopPlayAll();
    resetStatuses();
    state.screen = name;
    el.viewCards.hidden = name !== 'cards';
    el.viewSentences.hidden = name !== 'sentences';
    el.viewCards.classList.toggle('is-active', name === 'cards');
    el.viewSentences.classList.toggle('is-active', name === 'sentences');
    $$('#main-tabs .tab').forEach((tab) => {
      const active = tab.dataset.screen === name;
      tab.classList.toggle('on', active);
      tab.setAttribute('aria-selected', String(active));
    });
    activeStatusText().textContent = DEFAULT_STATUS[name];
  }

  /* --------------------------------- events -------------------------------- */

  function clearInput(input, clearButton, key) {
    state[key] = '';
    input.value = '';
    clearButton.hidden = true;
    if (key === 'cardQuery') renderCards(); else renderSentences();
    input.focus();
  }

  function bindEvents() {
    el.tabs.addEventListener('click', (event) => {
      const tab = event.target.closest('[data-screen]');
      if (tab) switchScreen(tab.dataset.screen);
    });

    el.grid.addEventListener('click', (event) => {
      const button = event.target.closest('[data-speak]');
      if (!button) return;
      const hobby = findHobby(button.dataset.speak);
      if (hobby) speakText(labelOf(hobby), { id: hobby.id });
    });

    el.sentenceGrid.addEventListener('click', (event) => {
      const button = event.target.closest('[data-speak-sentence]');
      if (!button) return;
      const sentence = SENTENCES.find((s) => s.id === button.dataset.speakSentence);
      if (sentence) speakText(sentenceTextOf(sentence), { id: sentence.id });
    });

    el.builderSpeak.addEventListener('click', () => {
      const text = draft();
      speakText(state.lang === 'en' ? text.en : text.idn, { id: 'builder' });
    });

    el.builderRandom.addEventListener('click', () => {
      const hobby = HOBBIES[Math.floor(Math.random() * HOBBIES.length)];
      el.builderHobby.value = hobby.id;
      el.builderPlace.value = PLACE_BY_HOBBY[hobby.id] || PLACES[0].en;
      updateBuilder();
    });

    el.builderHobby.addEventListener('change', () => {
      el.builderPlace.value = PLACE_BY_HOBBY[el.builderHobby.value] || PLACES[0].en;
      updateBuilder();
    });
    el.builderPlace.addEventListener('change', updateBuilder);

    el.chips.addEventListener('click', (event) => {
      const chip = event.target.closest('[data-cat]');
      if (!chip) return;
      if (state.playAll) stopPlayAll();
      state.category = chip.dataset.cat;
      $$('#chips .chip').forEach((item) => {
        const active = item === chip;
        item.classList.toggle('on', active);
        item.setAttribute('aria-pressed', String(active));
      });
      renderCards();
      el.statusText.textContent = `Kategori: ${state.category}. ${visibleCards().length} kartu ditampilkan.`;
    });

    el.search.addEventListener('input', (event) => {
      state.cardQuery = event.target.value;
      el.searchClear.hidden = !state.cardQuery;
      if (state.playAll) stopPlayAll();
      renderCards();
      el.statusText.textContent = state.cardQuery
        ? `Hasil pencarian untuk “${state.cardQuery}”: ${visibleCards().length} kartu.`
        : 'Menampilkan semua hobi.';
    });

    el.sentenceSearch.addEventListener('input', (event) => {
      state.sentenceQuery = event.target.value;
      el.sentenceSearchClear.hidden = !state.sentenceQuery;
      if (state.playAll) stopPlayAll();
      renderSentences();
      el.sentenceStatusText.textContent = state.sentenceQuery
        ? `Hasil pencarian untuk “${state.sentenceQuery}”: ${visibleSentences().length} kalimat.`
        : 'Menampilkan semua kalimat.';
    });

    el.searchClear.addEventListener('click', () => clearInput(el.search, el.searchClear, 'cardQuery'));
    el.sentenceSearchClear.addEventListener('click', () => clearInput(el.sentenceSearch, el.sentenceSearchClear, 'sentenceQuery'));

    [el.searchClear, el.sentenceSearchClear].forEach((button) => {
      button.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          button.click();
        }
      });
    });

    el.lang.addEventListener('click', (event) => {
      const button = event.target.closest('[data-lang]');
      if (!button || button.dataset.lang === state.lang) return;
      if (state.playAll) stopPlayAll();
      cancelSpeech();
      state.lang = button.dataset.lang;
      $$('#seg-lang button').forEach((item) => {
        const active = item === button;
        item.classList.toggle('on', active);
        item.setAttribute('aria-pressed', String(active));
      });
      renderCards();
      renderSentences();
      updateBuilder();
      el.statusText.textContent = state.lang === 'en'
        ? 'Sekarang dibacakan dalam bahasa Inggris. 🇬🇧'
        : 'Sekarang dibacakan dalam bahasa Indonesia. 🇮🇩';
    });

    $$('[data-playall]').forEach((button) => button.addEventListener('click', togglePlayAll));

    el.shuffle.addEventListener('click', () => {
      if (state.playAll) stopPlayAll();
      for (let i = state.order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.order[i], state.order[j]] = [state.order[j], state.order[i]];
      }
      renderCards();
      el.statusText.textContent = 'Urutan kartu sudah diacak. 🔀';
    });

    el.sentenceShuffle.addEventListener('click', () => {
      if (state.playAll) stopPlayAll();
      for (let i = state.sentenceOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.sentenceOrder[i], state.sentenceOrder[j]] = [state.sentenceOrder[j], state.sentenceOrder[i]];
      }
      renderSentences();
      el.sentenceStatusText.textContent = 'Urutan kalimat sudah diacak. 🔀';
    });

    el.full.addEventListener('click', () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen()
          .catch(() => showToast('Layar penuh tidak dapat diaktifkan di browser ini.'));
      } else {
        showToast('Layar penuh tidak didukung di browser ini.');
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && (state.playAll || state.speakingId)) {
        stopPlayAll('Pembacaan dihentikan.');
      }
    });

    if (supported && speechSynthesis.addEventListener) {
      speechSynthesis.addEventListener('voiceschanged', loadVoices);
    } else if (supported) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  /* ---------------------------------- init --------------------------------- */

  function init() {
    loadVoices();
    buildChips();
    renderCards();
    renderSentences();
    populateBuilder();
    bindEvents();
    if (!supported) {
      el.statusText.textContent = 'Fitur suara tidak tersedia di browser ini.';
      setTimeout(() => showToast(CONTEXT, 7000), 700);
    }
  }

  init();
})();
