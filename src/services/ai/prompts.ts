/**
 * AI Prompt Templates for TTS Anak Pintar
 *
 * These prompts are carefully designed to generate age-appropriate,
 * educationally sound, and factually correct crossword puzzles.
 *
 * IMPORTANT: For Islamic content, the AI must only generate questions
 * based on trusted references. If unsure, DO NOT generate.
 */

import type { Subject, Difficulty } from "@/types/game";

interface PromptParams {
  subject: Subject;
  grade: number;
  difficulty: Difficulty;
  wordCount: number;
  language: "id" | "en";
  theme?: string;
}

/**
 * Get the appropriate prompt template
 */
export function getPromptTemplate(params: PromptParams): string {
  const { subject, grade, difficulty, wordCount, language, theme } = params;
  const lang = language || "id";

  const baseInstructions = getBaseInstructions(lang);
  const educationalGuidelines = getEducationalGuidelines(grade, lang);
  const subjectSpecific = getSubjectPrompt(subject, lang);
  const safetyGuidelines = getSafetyGuidelines(subject, lang);
  const formatInstructions = getFormatInstructions(lang);

  return `
${baseInstructions}

${educationalGuidelines}

${subjectSpecific}

${safetyGuidelines}

## DIFFICULTY LEVEL: ${difficulty.toUpperCase()}
## NUMBER OF WORDS: ${wordCount}
${theme ? `## THEME: ${theme}` : ""}

${formatInstructions}
`.trim();
}

/**
 * Base system instructions
 */
function getBaseInstructions(lang: string): string {
  if (lang === "en") {
    return `You are an expert educational content creator for elementary school children.
Your task is to create a crossword puzzle for students.
Each word must have a clear, unambiguous answer.`;
  }

  return `Kamu adalah pembuat konten pendidikan untuk anak Sekolah Dasar (SD).
Tugasmu adalah membuat teka-teki silang (TTS) yang menyenangkan dan mendidik.

PENTING:
- Setiap pertanyaan harus memiliki SATU jawaban yang jelas dan tidak ambigu
- Gunakan bahasa yang sesuai dengan usia anak
- Jawaban harus dalam HURUF KAPITAL tanpa spasi
- Pertanyaan harus mudah dipahami anak SD
- JANGAN membuat pertanyaan yang memiliki lebih dari satu kemungkinan jawaban`;
}

/**
 * Educational guidelines based on grade level
 */
function getEducationalGuidelines(grade: number, lang: string): string {
  const guidelines: Record<number, { id: string; en: string }> = {
    1: {
      id: "Kelas 1 SD (usia 6-7 tahun):\n- Gunakan kata-kata sangat sederhana (3-5 huruf)\n- Kosakata dasar yang dikenal anak\n- Pertanyaan pendek dan langsung\n- Contoh: nama hewan, buah, warna, anggota tubuh",
      en: "Grade 1 (age 6-7):\n- Use very simple words (3-5 letters)\n- Basic vocabulary children know\n- Short, direct questions\n- Examples: animals, fruits, colors, body parts",
    },
    2: {
      id: "Kelas 2 SD (usia 7-8 tahun):\n- Kata 4-6 huruf\n- Kosakata sehari-hari\n- Pertanyaan sederhana\n- Mulai perkenalkan konsep agama dasar",
      en: "Grade 2 (age 7-8):\n- 4-6 letter words\n- Daily vocabulary\n- Simple questions\n- Basic religious concepts",
    },
    3: {
      id: "Kelas 3 SD (usia 8-9 tahun):\n- Kata 5-7 huruf\n- Kosakata lebih bervariasi\n- Konsep mulai berkembang\n- Pertanyaan membutuhkan pemikiran ringan",
      en: "Grade 3 (age 8-9):\n- 5-7 letter words\n- More varied vocabulary\n- Developing concepts\n- Questions requiring light thinking",
    },
    4: {
      id: "Kelas 4 SD (usia 9-10 tahun):\n- Kata 5-9 huruf\n- Istilah pelajaran\n- Konsep lebih abstrak\n- Pertanyaan membutuhkan pemahaman",
      en: "Grade 4 (age 9-10):\n- 5-9 letter words\n- Academic terms\n- More abstract concepts\n- Questions requiring comprehension",
    },
    5: {
      id: "Kelas 5 SD (usia 10-11 tahun):\n- Kata 6-10 huruf\n- Istilah spesifik\n- Analisis sederhana\n- Koneksi antar konsep",
      en: "Grade 5 (age 10-11):\n- 6-10 letter words\n- Specific terminology\n- Simple analysis\n- Connections between concepts",
    },
    6: {
      id: "Kelas 6 SD (usia 11-12 tahun):\n- Kata 7-12 huruf\n- Kosakata akademik\n- Penalaran lebih tinggi\n- Persiapan ke jenjang selanjutnya",
      en: "Grade 6 (age 11-12):\n- 7-12 letter words\n- Academic vocabulary\n- Higher reasoning\n- Preparation for next level",
    },
  };

  return guidelines[grade]?.[lang === "en" ? "en" : "id"] ||
    guidelines[4]?.[lang === "en" ? "en" : "id"] ||
    "";
}

/**
 * Subject-specific content guidelines
 */
function getSubjectPrompt(subject: Subject, lang: string): string {
  const subjects: Record<Subject, string> = {
    islam: lang === "en"
      ? `## SUBJECT: Islamic Studies
Create questions about:
- The 5 Pillars of Islam (Shahada, Salah, Zakat, Sawm, Hajj)
- The 6 Pillars of Iman (Faith in Allah, Angels, Books, Prophets, Day of Judgment, Destiny)
- Prophets mentioned in Quran
- Angels and their duties
- Daily prayers (names, times, rak'ah)
- Fasting (Ramadan, sunnah fasts)
- Charity (Zakat, Sadaqah)
- Good morals (honesty, kindness, respect to parents)
- Islamic manners (saying Bismillah, Assalamu'alaikum, etc.)
- Short stories of prophets

IMPORTANT: Only use facts from authentic Islamic sources.`
      : `## SUBJECT: Agama Islam
Buat pertanyaan tentang (HANYA dari sumber terpercaya):
- Rukun Islam (Syahadat, Shalat, Zakat, Puasa, Haji)
- Rukun Iman (Iman kepada Allah, Malaikat, Kitab, Rasul, Hari Kiamat, Qada dan Qadar)
- Nama-nama Nabi dan Rasul
- Malaikat dan tugasnya
- Shalat wajib (nama, waktu, rakaat)
- Puasa (Ramadan, puasa sunnah)
- Zakat dan sedekah
- Akhlak terpuji (jujur, sopan, hormat pada orang tua)
- Adab sehari-hari (membaca basmalah, mengucap salam)
- Kisah nabi secara sederhana

PENTING: HANYA gunakan fakta dari sumber Islam terpercaya. JANGAN membuat-buat informasi.`,
    quran: lang === "en"
      ? `## SUBJECT: Al-Quran
Create questions about:
- Names of surahs (short surahs from Juz 30)
- Meaning of surah names
- Number of verses in short surahs
- Stories mentioned in Quran
- Basic tajweed rules (idgham, ikhfa, ghunnah)
- Hijaiyah letters and their properties
- Selected verses and their simple meanings`
      : `## SUBJECT: Al-Quran
Buat pertanyaan tentang:
- Nama-nama surat pendek (Juz 30/Amma)
- Arti nama surat
- Jumlah ayat surat-surat pendek
- Kisah dalam Al-Quran
- Hukum tajwid dasar (idgham, ikhfa, ghunnah)
- Huruf hijaiyah dan sifatnya
- Ayat pilihan dan artinya

PENTING: Rujuk pada Al-Quran dan terjemahan resmi.`,
    hadith: lang === "en"
      ? `## SUBJECT: Hadith
Create questions about:
- Short authentic hadith about daily life
- Hadith about manners and ethics
- Hadith about honesty
- Hadith about cleanliness
- Hadith about seeking knowledge
- Hadith about kindness to parents
- Hadith about neighbors`
      : `## SUBJECT: Hadits
Buat pertanyaan tentang:
- Hadits pendek tentang kehidupan sehari-hari
- Hadits tentang adab dan akhlak
- Hadits tentang kejujuran
- Hadits tentang kebersihan
- Hadits tentang menuntut ilmu
- Hadits tentang berbakti pada orang tua
- Hadits tentang tetangga

PENTING: HANYA gunakan hadits shahih/hasan yang masyhur. Sebutkan sumbernya.`,
    arabic: lang === "en"
      ? `## SUBJECT: Arabic Language
Create questions about:
- Basic Arabic vocabulary for kids
- Body parts in Arabic
- Animals in Arabic
- Fruits in Arabic
- Colors in Arabic
- Numbers 1-10 in Arabic
- Days of the week in Arabic
- Months in Arabic (Islamic/Hijri months)
- Professions in Arabic
- School items in Arabic`
      : `## SUBJECT: Bahasa Arab
Buat pertanyaan tentang kosakata bahasa Arab untuk anak SD:
- Anggota tubuh (mata, telinga, hidung, mulut, tangan, kaki)
- Hewan (kucing, ayam, sapi, kambing, unta, ikan)
- Buah-buahan (apel, pisang, anggur, semangka, jeruk)
- Warna (merah, biru, kuning, hijau, putih, hitam)
- Angka 1-10 dalam bahasa Arab
- Hari dalam seminggu
- Nama bulan Hijriyah
- Profesi (guru, dokter, petani, pilot)
- Peralatan sekolah

Jawaban dalam BAHASA ARAB (tulisan latin/transliterasi). Contoh: KITABUN (buku)`,
    english: lang === "en"
      ? `## SUBJECT: English Language
Create questions about basic English vocabulary:
- Animals (cat, dog, bird, fish, elephant, tiger)
- Fruits (apple, banana, orange, grape, mango)
- Colors (red, blue, green, yellow, white, black)
- Family members (father, mother, sister, brother)
- School items (book, pen, desk, bag, ruler)
- Numbers 1-10
- Greetings (hello, goodbye, good morning)
- Food and drinks (rice, bread, milk, water)
- Professions (teacher, doctor, nurse, pilot)`
      : `## SUBJECT: Bahasa Inggris
Buat pertanyaan tentang kosakata bahasa Inggris dasar:
- Hewan (cat, dog, bird, fish, elephant, tiger)
- Buah (apple, banana, orange, grape, mango)
- Warna (red, blue, green, yellow, white, black)
- Keluarga (father, mother, sister, brother)
- Perlengkapan sekolah (book, pen, desk, bag, ruler)
- Angka 1-10
- Sapaan (hello, goodbye, good morning)
- Makanan (rice, bread, milk, water)
- Profesi (teacher, doctor, nurse, pilot)

Jawaban dalam BAHASA INGGRIS (huruf kapital)`,
    general: lang === "en"
      ? `## SUBJECT: General Knowledge
Create questions about:
- Indonesia (capital city, islands, national symbols, regions)
- Science (solar system, water cycle, states of matter)
- Mathematics (shapes, basic operations, measurements)
- Plants (parts of plants, types of plants)
- Animals (classification, habitats, characteristics)
- Transportation (types of vehicles)
- Space (planets, sun, moon, stars)
- Weather and seasons
- Human body (organs, senses)`
      : `## SUBJECT: Pengetahuan Umum
Buat pertanyaan tentang:
- Indonesia (ibu kota, pulau, lambang negara, daerah)
- Sains (tata surya, daur air, wujud benda)
- Matematika (bangun datar, operasi hitung, pengukuran)
- Tumbuhan (bagian tumbuhan, jenis tumbuhan)
- Hewan (klasifikasi, habitat, ciri-ciri)
- Transportasi (jenis kendaraan)
- Luar angkasa (planet, matahari, bulan, bintang)
- Cuaca dan musim
- Tubuh manusia (organ, panca indera)`,
  };

  return subjects[subject] || subjects.general;
}

/**
 * Safety guidelines — especially important for Islamic content
 */
function getSafetyGuidelines(subject: Subject, lang: string): string {
  if (lang === "en") {
    return `
## SAFETY & QUALITY GUIDELINES
1. NEVER fabricate Islamic knowledge
2. For Quran: refer to actual surah names and meanings
3. For Hadith: only use well-known authentic hadith
4. For Aqidah: stick to the 6 Pillars of Iman
5. For Fiqh: refer to the 5 Pillars of Islam
6. All answers must be a SINGLE WORD (no spaces)
7. Questions must be age-appropriate
8. No ambiguous or misleading questions
9. Each question must have exactly one correct answer
10. No duplicate answers
11. Include explanation that teaches something new
12. Answers should be common words children would know`;
  }

  return `
## PANDUAN KEAMANAN & KUALITAS
1. JANGAN PERNAH membuat-buat informasi tentang Islam
2. Untuk Al-Quran: rujuk pada nama surat dan arti yang sebenarnya
3. Untuk Hadits: HANYA gunakan hadits shahih yang terkenal
4. Untuk Aqidah: patuhi 6 Rukun Iman
5. Untuk Fiqh: rujuk pada 5 Rukun Islam
6. Semua jawaban harus SATU KATA (tanpa spasi)
7. Pertanyaan harus sesuai usia anak
8. Tidak boleh ada pertanyaan ambigu
9. Setiap pertanyaan harus punya TEPAT SATU jawaban benar
10. Tidak boleh ada jawaban duplikat
11. Sertakan penjelasan yang mendidik
12. Jawaban harus kata yang umum dikenal anak`;
}

/**
 * Format instructions for JSON output
 */
function getFormatInstructions(lang: string): string {
  return `Respond with ONLY valid JSON in this exact format:

{
  "title": "Judul TTS",
  "theme": "Tema spesifik",
  "words": [
    {
      "answer": "JAWABAN",
      "clue": "Pertanyaan/petunjuk",
      "explanation": "Penjelasan singkat jawaban",
      "direction": "horizontal",
      "start": [0, 0]
    }
  ],
  "sourceMetadata": [
    {
      "word": "JAWABAN",
      "type": "general",
      "reference": ""
    }
  ]
}

IMPORTANT:
- "answer" must be ONE WORD only, in UPPERCASE, no spaces
- "direction" is either "horizontal" or "vertical"
- "start" is [row, column] - will be auto-calculated later, use [0, 0]
- "clue" must be clear and age-appropriate
- "explanation" should teach something educational (1-2 sentences)
- For Islamic topics: type must be "quran", "hadith_shahih", "sirah", or "fiqh"
- For Arabic: type must be "arabic_vocab"
- For other topics: type must be "general"`;
}
