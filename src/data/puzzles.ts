/**
 * Pre-built puzzle data — multiple crossword puzzle sets across different subjects
 * Users can browse and select these puzzles on the play page.
 */

export interface PuzzleData {
  id: string;
  title: string;
  theme: string;
  subject: string;
  difficulty: string;
  grade: number;
  description: string;
  icon: string;
  shape: PuzzleShape;
  words: Array<{
    answer: string;
    clue: string;
    explanation: string;
  }>;
}

export type PuzzleShape = "classic" | "diamond" | "cross" | "crossCompact" | "compact";

interface ShapeInfo {
  label: string;
  description: string;
  icon: string;
}

export const PUZZLE_SHAPES: Record<PuzzleShape, ShapeInfo> = {
  classic: {
    label: "Klasik",
    description: "Teka-teki dengan banyak persimpangan kata",
    icon: "🧩",
  },
  diamond: {
    label: "Belah Ketupat",
    description: "Bentuk menyamping dengan pola berlapis",
    icon: "🔶",
  },
  cross: {
    label: "Palang",
    description: "Dua kata panjang saling bersilangan di tengah",
    icon: "✚",
  },
  crossCompact: {
    label: "Palang Padat",
    description: "Silang besar dengan isian kata pendek",
    icon: "✖️",
  },
  compact: {
    label: "Padat",
    description: "Grid kecil dan padat untuk teka-teki cepat",
    icon: "📦",
  },
};

export const PREBUILT_PUZZLES: PuzzleData[] = [
  {
    id: "rukun-iman-islam",
    title: "Rukun Iman & Islam",
    theme: "6 Rukun Iman & 5 Rukun Islam",
    subject: "islam",
    difficulty: "easy",
    grade: 3,
    description: "Pelajari 6 rukun iman dan 5 rukun Islam dasar",
    icon: "🕌",
    shape: "classic",
    words: [
      {
        answer: "SYAHADAT",
        clue: "Dua kalimat yang menjadi rukun Islam pertama",
        explanation: "Syahadat adalah kalimat 'Asyhadu alla ilaha illallah wa asyhadu anna Muhammadar Rasulullah'",
      },
      {
        answer: "SHALAT",
        clue: "Ibadah wajib yang dilakukan 5 waktu sehari semalam",
        explanation: "Shalat adalah ibadah yang terdiri dari gerakan dan doa tertentu",
      },
      {
        answer: "ZAKAT",
        clue: "Mengeluarkan sebagian harta yang wajib diberikan kepada yang berhak",
        explanation: "Zakat adalah rukun Islam keempat, membersihkan harta",
      },
      {
        answer: "PUASA",
        clue: "Menahan diri dari makan dan minum dari terbit fajar hingga maghrib",
        explanation: "Puasa di bulan Ramadan adalah rukun Islam keempat",
      },
      {
        answer: "HAJI",
        clue: "Ibadah ke Baitullah di Mekkah bagi yang mampu",
        explanation: "Haji adalah rukun Islam kelima",
      },
      {
        answer: "ALLAH",
        clue: "Rukun iman pertama, percaya kepada ...",
        explanation: "Rukun iman pertama adalah iman kepada Allah SWT",
      },
      {
        answer: "MALAIKAT",
        clue: "Makhluk Allah yang diciptakan dari cahaya",
        explanation: "Malaikat selalu taat beribadah kepada Allah",
      },
      {
        answer: "JIBRIL",
        clue: "Malaikat yang bertugas menyampaikan wahyu",
        explanation: "Malaikat Jibril adalah penghulu para malaikat",
      },
      {
        answer: "WUDHU",
        clue: "Bersuci dengan air sebelum melaksanakan shalat",
        explanation: "Wudhu adalah cara bersuci dari hadas kecil",
      },
      {
        answer: "MASJID",
        clue: "Tempat ibadah umat Islam",
        explanation: "Masjid adalah tempat suci untuk beribadah",
      },
    ],
  },
  {
    id: "nabi-rasul",
    title: "Nabi & Rasul",
    theme: "25 Nabi dan Kisah Teladan",
    subject: "islam",
    difficulty: "medium",
    grade: 4,
    description: "Kenali nabi-nabi dan kisah teladannya",
    icon: "👳",
    shape: "classic",
    words: [
      {
        answer: "ADAM",
        clue: "Manusia pertama yang diciptakan Allah",
        explanation: "Nabi Adam adalah manusia pertama dan nabi pertama",
      },
      {
        answer: "NUH",
        clue: "Nabi yang membuat bahtera besar",
        explanation: "Nabi Nuh membuat kapal untuk menyelamatkan umatnya dari banjir",
      },
      {
        answer: "IBRAHIM",
        clue: "Bapak para nabi, dikenal dengan gelar Khalilullah",
        explanation: "Nabi Ibrahim adalah nenek moyang bangsa Arab dan Israel",
      },
      {
        answer: "ISMAIL",
        clue: "Nabi yang dikorbankan oleh ayahnya karena perintah Allah",
        explanation: "Nabi Ismail adalah putra Nabi Ibrahim yang saleh",
      },
      {
        answer: "MUSA",
        clue: "Nabi yang menerima kitab Taurat",
        explanation: "Nabi Musa menerima wahyu di Bukit Sinai",
      },
      {
        answer: "ISA",
        clue: "Nabi yang lahir tanpa ayah",
        explanation: "Nabi Isa lahir dari Maryam tanpa ayah",
      },
      {
        answer: "MUHAMMAD",
        clue: "Nabi terakhir penutup para nabi",
        explanation: "Nabi Muhammad adalah rasul terakhir",
      },
      {
        answer: "YUSUF",
        clue: "Nabi yang terkenal dengan ketampanannya",
        explanation: "Nabi Yusuf adalah putra Nabi Yaqub",
      },
      {
        answer: "SULAIMAN",
        clue: "Nabi yang bisa berbicara dengan hewan",
        explanation: "Nabi Sulaiman diberi keistimewaan memahami bahasa hewan",
      },
      {
        answer: "YUNUS",
        clue: "Nabi yang ditelan ikan paus",
        explanation: "Nabi Yunus berada di dalam perut ikan selama beberapa hari",
      },
    ],
  },
  {
    id: "wudhu-shalat",
    title: "Wudhu & Shalat",
    theme: "Tata cara bersuci dan ibadah shalat",
    subject: "islam",
    difficulty: "easy",
    grade: 2,
    description: "Pelajari tata cara wudhu dan shalat",
    icon: "🧴",
    shape: "compact",
    words: [
      {
        answer: "NIAT",
        clue: "Syarat sah pertama dalam wudhu dan shalat",
        explanation: "Niat adalah keinginan dalam hati untuk beribadah",
      },
      {
        answer: "BASUH",
        clue: "Membasuh muka dan tangan saat wudhu",
        explanation: "Membasuh muka dan tangan termasuk rukun wudhu",
      },
      {
        answer: "USAP",
        clue: "Mengusap kepala saat berwudhu",
        explanation: "Mengusap kepala adalah rukun wudhu",
      },
      {
        answer: "KAKI",
        clue: "Anggota tubuh terakhir yang dibasuh saat wudhu",
        explanation: "Membasuh kaki sampai mata kaki adalah rukun wudhu",
      },
      {
        answer: "TAYAMMUM",
        clue: "Cara bersuci menggunakan debu jika tidak ada air",
        explanation: "Tayammum adalah pengganti wudhu dengan debu suci",
      },
      {
        answer: "QIBLAT",
        clue: "Arah yang dihadapi saat shalat",
        explanation: "Qiblat umat Islam adalah Ka'bah di Mekkah",
      },
      {
        answer: "SUJUD",
        clue: "Gerakan shalat dengan dahi menyentuh lantai",
        explanation: "Sujud adalah salah satu rukun shalat",
      },
      {
        answer: "TAKBIR",
        clue: "Ucapan 'Allahu Akbar' saat memulai shalat",
        explanation: "Takbiratul ihram adalah pembuka shalat",
      },
      {
        answer: "SALAM",
        clue: "Ucapan yang mengakhiri shalat",
        explanation: "Salam adalah penutup shalat dengan menoleh ke kanan dan kiri",
      },
      {
        answer: "WUDHU",
        clue: "Cara bersuci sebelum shalat",
        explanation: "Wudhu adalah syarat sah shalat",
      },
    ],
  },
  {
    id: "alphabet-animals",
    title: "Alphabet Animals",
    theme: "Animals from A to Z in English",
    subject: "english",
    difficulty: "easy",
    grade: 1,
    description: "Learn animal names in English!",
    icon: "🐾",
    shape: "compact",
    words: [
      {
        answer: "ANT",
        clue: "A small insect that lives in colonies",
        explanation: "Ant is a small insect that works together in groups",
      },
      {
        answer: "BIRD",
        clue: "An animal with wings that can fly",
        explanation: "Birds have feathers and can fly in the sky",
      },
      {
        answer: "CAT",
        clue: "A furry pet that says meow",
        explanation: "Cats are popular pets that are clean and independent",
      },
      {
        answer: "DOG",
        clue: "A loyal pet that says woof",
        explanation: "Dogs are known as man's best friend",
      },
      {
        answer: "FISH",
        clue: "An animal that lives in water",
        explanation: "Fish live in water and use fins to swim",
      },
      {
        answer: "HORSE",
        clue: "A big animal that people can ride",
        explanation: "Horses are strong animals that can run fast",
      },
      {
        answer: "LION",
        clue: "The king of the jungle",
        explanation: "Lions are big cats that live in Africa",
      },
      {
        answer: "MONKEY",
        clue: "A clever animal that likes bananas",
        explanation: "Monkeys are smart animals that live in trees",
      },
      {
        answer: "TIGER",
        clue: "A big cat with orange and black stripes",
        explanation: "Tigers are the largest cat species",
      },
      {
        answer: "ZEBRA",
        clue: "A black and white animal that looks like a horse",
        explanation: "Zebras have unique black and white stripes",
      },
    ],
  },
  {
    id: "anggota-tubuh",
    title: "Anggota Tubuh",
    theme: "Bahasa Arab - Anggota Tubuh Manusia",
    subject: "arabic",
    difficulty: "easy",
    grade: 2,
    description: "Belajar kosakata anggota tubuh dalam Bahasa Arab",
    icon: "🖐️",
    shape: "compact",
    words: [
      {
        answer: "ROSUL",
        clue: "Kepala dalam bahasa Arab",
        explanation: "Ra'sun artinya kepala, anggota tubuh paling atas",
      },
      {
        answer: "YAIDUN",
        clue: "Tangan dalam bahasa Arab",
        explanation: "Yadun artinya tangan, digunakan untuk memegang",
      },
      {
        answer: "RIJULUN",
        clue: "Kaki dalam bahasa Arab",
        explanation: "Rijlun artinya kaki, digunakan untuk berjalan",
      },
      {
        answer: "AINUN",
        clue: "Mata dalam bahasa Arab",
        explanation: "Ainun artinya mata, digunakan untuk melihat",
      },
      {
        answer: "UDZUNUN",
        clue: "Telinga dalam bahasa Arab",
        explanation: "Udzunun artinya telinga, digunakan untuk mendengar",
      },
      {
        answer: "ANFUN",
        clue: "Hidung dalam bahasa Arab",
        explanation: "Anfun artinya hidung, digunakan untuk mencium",
      },
      {
        answer: "FAMMUN",
        clue: "Mulut dalam bahasa Arab",
        explanation: "Fammun artinya mulut, digunakan untuk makan dan bicara",
      },
      {
        answer: "SYARUN",
        clue: "Rambut dalam bahasa Arab",
        explanation: "Sya'run artinya rambut yang tumbuh di kepala",
      },
      {
        answer: "QOLBUN",
        clue: "Hati dalam bahasa Arab",
        explanation: "Qalbun artinya hati, organ penting dalam tubuh",
      },
      {
        answer: "DZIRAAUN",
        clue: "Lengan dalam bahasa Arab",
        explanation: "Dziraa'un artinya lengan antara bahu dan siku",
      },
    ],
  },
  {
    id: "planets-space",
    title: "Planet & Ruang Angkasa",
    theme: "Tata Surya dan Penjelajahan Luar Angkasa",
    subject: "general",
    difficulty: "medium",
    grade: 5,
    description: "Jelajahi planet-planet dan benda langit",
    icon: "🚀",
    shape: "cross",
    words: [
      {
        answer: "MATAHARI",
        clue: "Bintang terbesar di tata surya kita",
        explanation: "Matahari adalah pusat tata surya",
      },
      {
        answer: "BUMI",
        clue: "Planet tempat tinggal manusia",
        explanation: "Bumi adalah planet ketiga dari matahari",
      },
      {
        answer: "BULAN",
        clue: "Satelit alami bumi yang bersinar di malam hari",
        explanation: "Bulan mengelilingi bumi setiap 28 hari",
      },
      {
        answer: "MARS",
        clue: "Planet merah yang namanya diambil dari dewa perang Romawi",
        explanation: "Mars disebut planet merah karena warna permukaannya",
      },
      {
        answer: "JUPITER",
        clue: "Planet terbesar dalam tata surya",
        explanation: "Jupiter adalah planet terbesar dengan diameter 142.984 km",
      },
      {
        answer: "SATURNUS",
        clue: "Planet dengan cincin yang indah",
        explanation: "Saturnus terkenal dengan cincinnya yang terbuat dari es dan debu",
      },
      {
        answer: "VENUS",
        clue: "Planet terpanas dan paling terang di langit",
        explanation: "Venus disebut bintang fajar atau bintang senja",
      },
      {
        answer: "KOMET",
        clue: "Benda langit berekor yang mengelilingi matahari",
        explanation: "Komet terdiri dari es dan debu, memiliki ekor panjang",
      },
      {
        answer: "ASTRONOT",
        clue: "Orang yang pergi ke luar angkasa",
        explanation: "Astronot adalah penjelajah ruang angkasa",
      },
      {
        answer: "ROKET",
        clue: "Kendaraan yang digunakan untuk pergi ke luar angkasa",
        explanation: "Roket menggunakan bahan bakar untuk melawan gravitasi",
      },
    ],
  },
  {
    id: "alquran-surat",
    title: "Surat-Surat Al-Qur'an",
    theme: "Nama-nama surat dalam Al-Qur'an",
    subject: "quran",
    difficulty: "medium",
    grade: 4,
    description: "Kenali nama-nama surat dalam Al-Qur'an",
    icon: "📖",
    shape: "classic",
    words: [
      {
        answer: "ALFATIHAH",
        clue: "Surat pembuka dalam Al-Qur'an",
        explanation: "Al-Fatihah adalah surat pertama dalam Al-Qur'an, disebut Ummul Kitab",
      },
      {
        answer: "ALIKHLAS",
        clue: "Surat yang menjelaskan keesaan Allah",
        explanation: "Qul huwallahu ahad... surat tentang tauhid",
      },
      {
        answer: "ALFALAQ",
        clue: "Surat yang berisi permohonan perlindungan dari kejahatan",
        explanation: "Qul a'udzu birabbil falaq... surat perlindungan",
      },
      {
        answer: "ANNAS",
        clue: "Surat terakhir dalam Al-Qur'an",
        explanation: "Qul a'udzu birabbin nas... surat perlindungan dari godaan setan",
      },
      {
        answer: "ALKAHFI",
        clue: "Surat yang sangat dianjurkan dibaca pada hari Jumat",
        explanation: "Surat Al-Kahfi berisi kisah Ashabul Kahfi",
      },
      {
        answer: "YASIN",
        clue: "Jantung Al-Qur'an",
        explanation: "Surat Yasin disebut juga jantung Al-Qur'an",
      },
      {
        answer: "ARRAHMAN",
        clue: "Surat yang didahului dengan 'Ar-Rahman'",
        explanation: "Surat Ar-Rahman berisi tentang nikmat Allah",
      },
      {
        answer: "ALBAQARAH",
        clue: "Surat terpanjang dalam Al-Qur'an",
        explanation: "Al-Baqarah adalah surat kedua dan terpanjang",
      },
      {
        answer: "ALANAM",
        clue: "Surat yang berarti binatang ternak",
        explanation: "Surat Al-An'am berisi tentang petunjuk Allah",
      },
      {
        answer: "ANNAHL",
        clue: "Surat yang berarti lebah",
        explanation: "Surat An-Nahl berisi tentang nikmat Allah pada alam",
      },
    ],
  },
  {
    id: "akhlak-terpuji",
    title: "Akhlak Terpuji",
    theme: "Sifat-sifat baik yang harus dimiliki muslim",
    subject: "islam",
    difficulty: "easy",
    grade: 2,
    description: "Belajar sifat-sifat terpuji dalam Islam",
    icon: "🌟",
    shape: "compact",
    words: [
      {
        answer: "JUJUR",
        clue: "Berkata sesuai dengan kebenaran",
        explanation: "Jujur adalah sifat mengatakan apa adanya",
      },
      {
        answer: "SABAR",
        clue: "Menahan diri ketika menghadapi kesulitan",
        explanation: "Sabar adalah menerima cobaan dengan ikhlas",
      },
      {
        answer: "DERMAWAN",
        clue: "Suka memberi dan membantu sesama",
        explanation: "Dermawan adalah sifat suka bersedekah",
      },
      {
        answer: "SOPAN",
        clue: "Bersikap hormat dan santun kepada orang lain",
        explanation: "Sopan adalah berperilaku baik dan menghormati",
      },
      {
        answer: "RAJIN",
        clue: "Tekun dan bersungguh-sungguh dalam belajar",
        explanation: "Rajin adalah tidak malas dalam berbuat kebaikan",
      },
      {
        answer: "TAAT",
        clue: "Patuh kepada perintah Allah dan orang tua",
        explanation: "Taat berarti melaksanakan perintah dan menjauhi larangan",
      },
      {
        answer: "IKHLAS",
        clue: "Melakukan sesuatu semata-mata karena Allah",
        explanation: "Ikhlas adalah niat yang tulus hanya untuk Allah",
      },
      {
        answer: "MAAF",
        clue: "Memberi ... kepada orang yang bersalah",
        explanation: "Memaafkan adalah sifat terpuji",
      },
      {
        answer: "SALING",
        clue: "Kata yang melengkapi 'tolong-...' dan 'hormat-...'",
        explanation: "Saling tolong dan saling hormat sesama manusia",
      },
      {
        answer: "BERBAGI",
        clue: "Memberikan sebagian rezeki kepada yang membutuhkan",
        explanation: "Berbagi membuat hidup lebih bermakna",
      },
    ],
  },
];
