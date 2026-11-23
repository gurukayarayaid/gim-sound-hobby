/* ============================================================
   DATA 11 CONTOH KALIMAT — satu untuk setiap hobi baru
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
  { en: 'living room',   idn: 'ruang tamu',       prep: 'in the' },
  { en: 'music room',    idn: 'ruang musik',      prep: 'in the' },
  { en: 'forest',        idn: 'hutan',            prep: 'in the' },
  { en: 'mall',          idn: 'mal',              prep: 'in the' },
  { en: 'garden',        idn: 'kebun',            prep: 'in the' },
  { en: 'gym',           idn: 'gim',              prep: 'in the' }
];

/* Tempat yang paling pas untuk tiap hobi (dipakai saat memilih/acak hobi). */
window.HOBBY_PLACES = {
  swimming: 'swimming pool',
  football: 'park',
  dancing: 'school hall',
  singing: 'classroom',
  reading: 'library',
  cycling: 'park',
  'watching-tv': 'living room',
  cooking: 'kitchen',
  drawing: 'notebook',
  shopping: 'mall',
  gardening: 'backyard'
};

window.SENTENCES = [
  { id: 's01', hobby: 'swimming',    en: 'I like swimming in the swimming pool.', idn: 'Saya suka berenang di kolam renang.' },
  { id: 's02', hobby: 'football',    en: 'I like playing football in the park.',  idn: 'Saya suka bermain sepak bola di taman.' },
  { id: 's03', hobby: 'dancing',     en: 'I like dancing in the school hall.',    idn: 'Saya suka menari di aula sekolah.' },
  { id: 's04', hobby: 'singing',     en: 'I like singing in the classroom.',      idn: 'Saya suka bernyanyi di kelas.' },
  { id: 's05', hobby: 'reading',     en: 'I like reading books in the library.',  idn: 'Saya suka membaca buku di perpustakaan.' },
  { id: 's06', hobby: 'cycling',     en: 'I like riding a bike in the park.',     idn: 'Saya suka bersepeda di taman.' },
  { id: 's07', hobby: 'watching-tv', en: 'I like watching TV in the living room.', idn: 'Saya suka menonton TV di ruang tamu.' },
  { id: 's08', hobby: 'cooking',     en: 'I like cooking in the kitchen.',        idn: 'Saya suka memasak di dapur.' },
  { id: 's09', hobby: 'drawing',     en: 'I like drawing in my notebook.',        idn: 'Saya suka menggambar di buku catatan saya.' },
  { id: 's10', hobby: 'shopping',    en: 'I like shopping in the mall.',          idn: 'Saya suka belanja di mal.' },
  { id: 's11', hobby: 'gardening',   en: 'I like gardening in the backyard.',     idn: 'Saya suka berkebun di halaman belakang.' }
];
