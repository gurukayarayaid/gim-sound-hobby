/* ============================================================
   DATA 20 CONTOH KALIMAT + daftar tempat untuk membuat kalimat
   Setiap kalimat terhubung ke hobi di data.js
   ============================================================ */

/* Tempat dipakai oleh "Buat Kalimat". prep = kata depan bahasa Inggris. */
window.PLACES = [
  { en: 'library',       idn: 'perpustakaan',     prep: 'in the' },
  { en: 'swimming pool', idn: 'kolam renang',     prep: 'in the' },
  { en: 'art room',      idn: 'ruang seni',       prep: 'in the' },
  { en: 'kitchen',       idn: 'dapur',            prep: 'in the' },
  { en: 'park',          idn: 'taman',            prep: 'in the' },
  { en: 'school hall',   idn: 'aula sekolah',     prep: 'in the' },
  { en: 'classroom',     idn: 'kelas',            prep: 'in the' },
  { en: 'backyard',      idn: 'halaman belakang', prep: 'in the' },
  { en: 'river',         idn: 'sungai',           prep: 'in the' },
  { en: 'mountains',     idn: 'pegunungan',       prep: 'in the' },
  { en: 'notebook',      idn: 'buku catatan',     prep: 'in my' },
  { en: 'sewing class',  idn: 'kelas menjahit',   prep: 'in the' },
  { en: 'living room',   idn: 'ruang tamu',       prep: 'in the' },
  { en: 'chess club',    idn: 'klub catur',       prep: 'in the' },
  { en: 'tennis court',  idn: 'lapangan tenis',   prep: 'on the' },
  { en: 'music room',    idn: 'ruang musik',      prep: 'in the' },
  { en: 'forest',        idn: 'hutan',            prep: 'in the' },
  { en: 'garden',        idn: 'kebun',            prep: 'in the' },
  { en: 'bedroom',       idn: 'kamar tidur',      prep: 'in the' },
  { en: 'gym',           idn: 'gim',              prep: 'in the' }
];

/* Tempat yang paling pas untuk tiap hobi (dipakai saat memilih/acak hobi). */
window.HOBBY_PLACES = {
  reading: 'library', swimming: 'swimming pool', painting: 'art room', cooking: 'kitchen',
  football: 'park', cycling: 'park', dancing: 'school hall', singing: 'classroom',
  gardening: 'backyard', fishing: 'river', hiking: 'mountains', drawing: 'notebook',
  sewing: 'sewing class', jogging: 'park', yoga: 'living room', chess: 'chess club',
  tennis: 'tennis court', guitar: 'music room', drums: 'music room', camping: 'forest'
};

window.SENTENCES = [
  { id: 's01', hobby: 'reading',   en: 'I like reading a book in the library.',        idn: 'Saya suka membaca buku di perpustakaan.' },
  { id: 's02', hobby: 'swimming',  en: 'I like swimming in the swimming pool.',        idn: 'Saya suka berenang di kolam renang.' },
  { id: 's03', hobby: 'painting',  en: 'I like painting in the art room.',             idn: 'Saya suka melukis di ruang seni.' },
  { id: 's04', hobby: 'cooking',   en: 'I like cooking in the kitchen.',               idn: 'Saya suka memasak di dapur.' },
  { id: 's05', hobby: 'football',  en: 'I like playing football in the park.',         idn: 'Saya suka bermain sepak bola di taman.' },
  { id: 's06', hobby: 'cycling',   en: 'I like riding a bike in the park.',            idn: 'Saya suka bersepeda di taman.' },
  { id: 's07', hobby: 'dancing',   en: 'I like dancing in the school hall.',           idn: 'Saya suka menari di aula sekolah.' },
  { id: 's08', hobby: 'singing',   en: 'I like singing in the classroom.',             idn: 'Saya suka menyanyi di kelas.' },
  { id: 's09', hobby: 'gardening', en: 'I like gardening in the backyard.',            idn: 'Saya suka berkebun di halaman belakang.' },
  { id: 's10', hobby: 'fishing',   en: 'I like fishing in the river.',                 idn: 'Saya suka memancing di sungai.' },
  { id: 's11', hobby: 'hiking',    en: 'I like hiking in the mountains.',              idn: 'Saya suka mendaki gunung di pegunungan.' },
  { id: 's12', hobby: 'drawing',   en: 'I like drawing in my notebook.',               idn: 'Saya suka menggambar di buku catatan saya.' },
  { id: 's13', hobby: 'sewing',    en: 'I like sewing in the sewing class.',           idn: 'Saya suka menjahit di kelas menjahit.' },
  { id: 's14', hobby: 'jogging',   en: 'I like jogging in the park.',                  idn: 'Saya suka berlari santai di taman.' },
  { id: 's15', hobby: 'yoga',      en: 'I like doing yoga in the living room.',        idn: 'Saya suka berlatih yoga di ruang tamu.' },
  { id: 's16', hobby: 'chess',     en: 'I like playing chess in the chess club.',      idn: 'Saya suka bermain catur di klub catur.' },
  { id: 's17', hobby: 'tennis',    en: 'I like playing tennis on the tennis court.',   idn: 'Saya suka bermain tenis di lapangan tenis.' },
  { id: 's18', hobby: 'guitar',    en: 'I like playing guitar in the music room.',     idn: 'Saya suka bermain gitar di ruang musik.' },
  { id: 's19', hobby: 'drums',     en: 'I like playing drums in the music room.',      idn: 'Saya suka bermain drum di ruang musik.' },
  { id: 's20', hobby: 'camping',   en: 'I like camping in the forest.',                idn: 'Saya suka berkemah di hutan.' }
];
