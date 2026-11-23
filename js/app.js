/* ============================================================
   SOUND HOBBY — logika kartu + pengucapan (Web Speech API)
   ============================================================ */

(function () {
  'use strict';

  const HOBBIES = window.HOBBIES || [];
  const $ = (selector) => document.querySelector(selector);

  const el = {
    grid: $('#grid'),
    chips: $('#chips'),
    search: $('#search'),
    searchClear: $('#search-clear'),
    lang: $('#seg-lang'),
    playAll: $('#btn-playall'),
    playIcon: $('#playall-icon'),
    playLabel: $('#playall-label'),
    shuffle: $('#btn-shuffle'),
    full: $('#btn-full'),
    status: $('#status'),
    statusText: $('#status-text'),
    count: $('#count'),
    empty: $('#empty'),
    toast: $('#toast')
  };

  const state = {
    order: HOBBIES.slice(),
    category: 'Semua',
    query: '',
    lang: 'en',
    voices: [],
    speakingId: null,
    playAll: false,
    playIndex: 0,
    speakToken: 0,
    safetyTimer: null,
    kickTimer: null,
    nextTimer: null,
    toastTimer: null
  };

  const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const CONTEXT = 'Maaf, browser ini belum mendukung fitur suara. Coba Chrome, Edge, atau Safari terbaru.';

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

  function langTag() {
    return state.lang === 'en' ? 'en-US' : 'id-ID';
  }

  function findHobby(id) {
    return HOBBIES.find((h) => h.id === id) || null;
  }

  function visibleCards() {
    const q = normalize(state.query.trim());
    return state.order.filter((h) => {
      const inCategory = state.category === 'Semua' || h.category === state.category;
      const inSearch = !q || normalize(`${h.word} ${h.idn} ${h.category}`).includes(q);
      return inCategory && inSearch;
    });
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

  function buildChips() {
    const categories = ['Semua', ...new Set(HOBBIES.map((h) => h.category))];
    el.chips.innerHTML = categories.map((category) => {
      const total = category === 'Semua' ? HOBBIES.length : HOBBIES.filter((h) => h.category === category).length;
      const active = category === state.category;
      return `<button type="button" class="chip${active ? ' on' : ''}" data-cat="${esc(category)}" aria-pressed="${active}">${esc(category)} <b>${total}</b></button>`;
    }).join('');
  }

  function updateSpeakLabels() {
    document.querySelectorAll('[data-speak]').forEach((button) => {
      const hobby = findHobby(button.dataset.speak);
      if (!hobby) return;
      const prefix = button.classList.contains('spk-btn') ? 'Dengarkan pengucapan: ' : 'Dengarkan: ';
      button.setAttribute('aria-label', prefix + labelOf(hobby));
    });
  }

  function render() {
    const list = visibleCards();
    el.count.textContent = `${list.length} dari ${HOBBIES.length} hobi`;
    el.empty.hidden = list.length > 0;
    el.grid.innerHTML = list.map(cardHTML).join('');
    updateSpeakLabels();
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

  function setSpeaking(id, text) {
    state.speakingId = id;
    document.querySelectorAll('.card.is-speaking').forEach((card) => card.classList.remove('is-speaking'));
    if (id) {
      const card = document.querySelector(`.card[data-id="${id}"]`);
      if (card) card.classList.add('is-speaking');
    }
    el.status.classList.toggle('is-on', Boolean(id));
    el.statusText.textContent = id
      ? `Memutarkan: “${text}”`
      : (state.playAll ? 'Bersiap untuk kartu berikutnya…' : 'Ketuk ikon speaker untuk mendengarkan kembali.');
  }

  function updatePlayAllButton() {
    el.playAll.classList.toggle('playing', state.playAll);
    el.playLabel.textContent = state.playAll ? 'Berhenti' : 'Putar Semua';
    el.playIcon.setAttribute('href', state.playAll ? '#ico-stop' : '#ico-play');
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
    updatePlayAllButton();
    if (message) el.statusText.textContent = message;
  }

  function speak(hobby, fromPlayAll) {
    if (!supported) {
      showToast(CONTEXT, 6000);
      return;
    }

    // Kartu yang diketuk manual menghentikan mode "Putar Semua".
    if (state.playAll && !fromPlayAll) stopPlayAll();

    cancelSpeech();
    const token = state.speakToken;
    const text = labelOf(hobby);
    const tag = langTag();

    setSpeaking(hobby.id, text);

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
      if (state.playAll) state.nextTimer = setTimeout(playNext, 700);
    }

    utterance.onend = finish;
    utterance.onerror = finish;
    // Pengaman untuk browser yang kadang tidak memicu onend.
    state.safetyTimer = setTimeout(finish, Math.max(2800, text.length * 150));

    // Jedak kecil menghindari race condition cancel() -> speak() di Chrome.
    state.kickTimer = setTimeout(() => {
      if (token === state.speakToken) window.speechSynthesis.speak(utterance);
    }, 90);
  }

  function playNext() {
    if (!state.playAll) return;
    const list = visibleCards();
    if (!list.length) {
      stopPlayAll('Tidak ada kartu untuk dibacakan.');
      return;
    }
    if (state.playIndex >= list.length) {
      state.playAll = false;
      updatePlayAllButton();
      setSpeaking(null);
      el.statusText.textContent = 'Selesai membacakan semua kartu. 🎉';
      return;
    }

    const hobby = list[state.playIndex];
    const card = document.querySelector(`.card[data-id="${hobby.id}"]`);
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    speak(hobby, true);
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
    if (!visibleCards().length) return;
    state.playAll = true;
    state.playIndex = 0;
    updatePlayAllButton();
    playNext();
  }

  function shuffleCards() {
    if (state.playAll) stopPlayAll();
    for (let i = state.order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [state.order[i], state.order[j]] = [state.order[j], state.order[i]];
    }
    render();
    el.statusText.textContent = 'Urutan kartu sudah diacak. 🔀';
  }

  /* --------------------------------- events -------------------------------- */

  function bindEvents() {
    el.grid.addEventListener('click', (event) => {
      const button = event.target.closest('[data-speak]');
      if (!button) return;
      const hobby = findHobby(button.dataset.speak);
      if (hobby) speak(hobby);
    });

    el.chips.addEventListener('click', (event) => {
      const chip = event.target.closest('[data-cat]');
      if (!chip) return;
      if (state.playAll) stopPlayAll();
      state.category = chip.dataset.cat;
      el.chips.querySelectorAll('.chip').forEach((item) => {
        const active = item === chip;
        item.classList.toggle('on', active);
        item.setAttribute('aria-pressed', String(active));
      });
      render();
      el.statusText.textContent = `Kategori: ${state.category}. ${visibleCards().length} kartu ditampilkan.`;
    });

    el.search.addEventListener('input', (event) => {
      state.query = event.target.value;
      el.searchClear.hidden = !state.query;
      if (state.playAll) stopPlayAll();
      render();
      el.statusText.textContent = state.query
        ? `Hasil pencarian untuk “${state.query}”: ${visibleCards().length} kartu.`
        : 'Menampilkan semua hobi.';
    });

    function clearSearch() {
      state.query = '';
      el.search.value = '';
      el.searchClear.hidden = true;
      render();
      el.search.focus();
    }
    el.searchClear.addEventListener('click', clearSearch);
    el.searchClear.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        clearSearch();
      }
    });

    el.lang.addEventListener('click', (event) => {
      const button = event.target.closest('[data-lang]');
      if (!button || button.dataset.lang === state.lang) return;
      if (state.playAll) stopPlayAll();
      cancelSpeech();
      state.lang = button.dataset.lang;
      el.lang.querySelectorAll('button').forEach((item) => {
        const active = item === button;
        item.classList.toggle('on', active);
        item.setAttribute('aria-pressed', String(active));
      });
      updateSpeakLabels();
      el.statusText.textContent = state.lang === 'en'
        ? 'Sekarang dibacakan dalam bahasa Inggris. 🇬🇧'
        : 'Sekarang dibacakan dalam bahasa Indonesia. 🇮🇩';
    });

    el.playAll.addEventListener('click', togglePlayAll);
    el.shuffle.addEventListener('click', shuffleCards);
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
    render();
    bindEvents();
    if (!supported) {
      el.statusText.textContent = 'Fitur suara tidak tersedia di browser ini.';
      setTimeout(() => showToast(CONTEXT, 7000), 700);
    }
  }

  init();
})();
