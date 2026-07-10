"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { SUBJECTS } from "@/lib/constants";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Floating Particles Background - client-only to avoid hydration mismatch */}
      <FloatingParticles />

      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-20 sm:pt-24 sm:pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="text-center lg:text-left"
            >
              {/* Animated Badge */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex items-center gap-2 clay-sm px-4 py-2 mb-6"
              >
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="text-lg"
                >
                  🧩
                </motion.span>
                <span className="text-sm font-semibold clay-text">
                  Game Edukasi Interaktif
                </span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight clay-text mb-6">
                TTS{" "}<span className="bg-gradient-to-r from-emerald-600 via-violet-600 to-rose-600 dark:from-emerald-400 dark:via-violet-400 dark:to-rose-400 bg-clip-text text-transparent">
                    Anak Pintar
                  </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-900 dark:text-gray-100 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed font-semibold">
                Belajar sambil bermain Teka-Teki Silang interaktif!
                Cocok untuk siswa SD kelas 1-6 dengan berbagai mata pelajaran seru.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/play"
                    className="clay-lg px-8 py-4 text-lg font-bold clay-text flex items-center gap-2 transition-shadow duration-200 hover:shadow-xl border border-white/40"
                  >
                    <motion.span
                      animate={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 2 }}
                    >
                      🎮
                    </motion.span>
                    Main Sekarang
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/register"
                    className="clay-lg px-8 py-4 text-lg font-bold clay-text flex items-center gap-2 bg-gradient-to-br from-[#a8e6cf]/20 to-[#d4c5f9]/20 transition-shadow duration-200 hover:shadow-xl border border-white/40"
                  >
                    <span>🚀</span>
                    Daftar Gratis
                  </Link>
                </motion.div>
              </div>

              <AnimatedStats />
            </motion.div>

            {/* Right Column */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              className="relative"
            >
              <div className="clay-lg p-8 relative">
                <motion.div
                  className="grid grid-cols-5 gap-2"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  {Array.from({ length: 25 }).map((_, i) => {
                    const letter = String.fromCharCode(65 + ((i * 7 + 3) % 26));
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.03, type: "spring", stiffness: 200 }}
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold cursor-default select-none ${
                          i % 2 === 0
                            ? "bg-gradient-to-br from-[#a8e6cf] to-[#7ed5b0] text-white shadow-lg shadow-[#a8e6cf]/30"
                            : i % 3 === 0
                            ? "bg-gradient-to-br from-[#d4c5f9] to-[#b8a4e8] text-white shadow-lg shadow-[#d4c5f9]/30"
                            : "bg-gradient-to-br from-[#f8b4c8] to-[#ff9eb5] text-white shadow-lg shadow-[#f8b4c8]/30"
                        }`}
                      >
                        {letter}
                      </motion.div>
                    );
                  })}
                </motion.div>

                <motion.div
                  animate={{ y: [-10, -20, -10], rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-5 -right-5 text-4xl drop-shadow-lg"
                >
                  ✨
                </motion.div>
                <motion.div
                  animate={{ y: [0, -12, 0], rotate: [0, 360] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-5 -left-5 text-3xl drop-shadow-lg"
                >
                  🧩
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute top-1/2 -right-8 text-2xl"
                >
                  ⭐
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-[#a8e6cf]/15 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-gradient-to-l from-[#d4c5f9]/15 to-transparent blur-3xl pointer-events-none" />
      </section>

      <section className="px-4 py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#a8e6cf]/5 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <SectionHeader title="Kenapa TTS Anak Pintar?" subtitle="Dirancang khusus untuk membuat belajar menjadi menyenangkan" icon="💡" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <SectionHeader title="Pilih Mata Pelajaran" subtitle="Berbagai mata pelajaran seru untuk dipelajari" icon="📚" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(SUBJECTS).map(([key, subject], i) => (
              <SubjectCard key={key} subjectKey={key} subject={subject} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#d4c5f9]/5 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <SectionHeader title="Cara Bermain" subtitle="Mudah dan menyenangkan!" icon="🎮" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <StepCard key={step.title} step={step} index={i} />
            ))}
          </div>
          <div className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[#a8e6cf] via-[#d4c5f9] to-[#f8b4c8] -z-10 opacity-30" />
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <SectionHeader title="Apa Kata Mereka?" subtitle="Dari siswa, guru, dan orang tua yang sudah menggunakan TTS Anak Pintar" icon="💬" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <TestimonialCard key={i} testimonial={testimonial} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="clay-lg p-10 sm:p-14 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#a8e6cf]/10 to-[#d4c5f9]/10 pointer-events-none" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-20 -right-20 w-40 h-40 rounded-full border-2 border-[#a8e6cf]/20 pointer-events-none"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full border-2 border-[#d4c5f9]/20 pointer-events-none"
            />
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl mb-6"
              >
                🧩
              </motion.div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold clay-text mb-4">Siap Bermain?</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto text-lg">
                Mulai petualangan belajarmu sekarang. Gratis!
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/register"
                  className="clay-lg px-12 py-5 text-xl font-bold clay-text inline-flex items-center gap-3 hover:shadow-2xl transition-shadow duration-200"
                >
                  <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                    🚀
                  </motion.span>
                  Mulai Sekarang
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

/**
 * Floating particles - only rendered on client to avoid hydration mismatch from Math.random()
 */
function FloatingParticles() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() > 0.5 ? 20 : -20, 0],
            rotate: [0, 360],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{
            duration: 6 + Math.random() * 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 3,
          }}
        >
          {["🧩", "✨", "⭐", "📚", "✏️", "🎯", "🏆", "🌟", "🖋️", "🔤"][i % 10]}
        </motion.div>
      ))}
    </div>
  );
}

function AnimatedStats() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const stats = [
    { value: 6, suffix: "", label: "Kelas", icon: "📚" },
    { value: 6, suffix: "", label: "Mata Pelajaran", icon: "🎯" },
    { value: 999, suffix: "+", label: "Soal Tersedia", icon: "🧩" },
  ];

  return (
    <div ref={ref} className="flex gap-6 sm:gap-8 mt-10 justify-center lg:justify-start">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
          className="text-center"
        >
          <div className="text-2xl mb-1">{stat.icon}</div>
          <div className="text-2xl sm:text-3xl font-bold clay-text">
            <AnimatedCounter from={0} to={stat.value} play={isInView} />
            {stat.suffix}
          </div>
          <div className="text-xs sm:text-sm text-gray-500">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

function AnimatedCounter({ from, to, play }: { from: number; to: number; play: boolean }) {
  const [count, setCount] = useState(from);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!play) return;
    const duration = 1500;
    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(from + (to - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [play, from, to]);

  return <>{count}</>;
}

function SectionHeader({ title, subtitle, icon }: { title: string; subtitle: string; icon: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="text-center mb-14"
    >
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="text-5xl mb-4">
        {icon}
      </motion.div>
      <h2 className="text-3xl sm:text-4xl font-bold clay-text mb-4">{title}</h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: 80 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="h-1 bg-gradient-to-r from-[#a8e6cf] to-[#d4c5f9] rounded-full mx-auto mt-4"
      />
    </motion.div>
  );
}

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="clay p-6 transition-all duration-300 group cursor-default"
    >
      <motion.div
        whileHover={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.5 }}
        className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300"
      >
        {feature.icon}
      </motion.div>
      <h3 className="text-xl font-bold clay-text mb-2 group-hover:text-[#a8e6cf] transition-colors duration-300">{feature.title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p>
    </motion.div>
  );
}

function SubjectCard({ subjectKey, subject, index }: { subjectKey: string; subject: { label: string; description: string; icon: string; color: string }; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="clay p-6 transition-all duration-300 group cursor-default relative overflow-hidden"
    >
      <motion.div
        className="absolute -top-10 -right-10 w-20 h-20 rounded-full opacity-20 transition-all duration-500 group-hover:scale-[3] group-hover:opacity-10"
        style={{ backgroundColor: subject.color }}
      />
      <div className="text-4xl mb-4 relative">{subject.icon}</div>
      <h3 className="text-xl font-bold clay-text mb-2 relative">{subject.label}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed relative">{subject.description}</p>
    </motion.div>
  );
}

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className="text-center group"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="clay-lg w-24 h-24 flex items-center justify-center text-4xl mx-auto mb-4 relative"
      >
        {step.icon}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-[#a8e6cf] to-[#7ed5b0] flex items-center justify-center text-white text-sm font-bold shadow-lg"
        >
          {index + 1}
        </motion.div>
      </motion.div>
      <h3 className="font-bold clay-text mb-2 text-lg">{step.title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px] mx-auto">{step.description}</p>
    </motion.div>
  );
}

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="clay p-6 transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full clay-colored flex items-center justify-center text-xl text-2xl">{testimonial.avatar}</div>
        <div>
          <div className="font-bold clay-text text-sm">{testimonial.name}</div>
          <div className="text-xs text-gray-500">{testimonial.role}</div>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic">"{testimonial.quote}"</p>
      <div className="flex gap-1 mt-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="text-sm">⭐</span>
        ))}
      </div>
    </motion.div>
  );
}

const features = [
  { icon: "🤖", title: "AI Generator", description: "TTS dibuat otomatis oleh AI. Soal selalu baru dan tidak pernah habis!" },
  { icon: "📚", title: "6 Mata Pelajaran", description: "Agama Islam, Al-Qur'an, Hadits, Bahasa Arab, Bahasa Inggris, dan Pengetahuan Umum" },
  { icon: "🎯", title: "Sesuai Kelas", description: "Soal disesuaikan dengan tingkat kelas 1-6 SD. Belajar jadi lebih tepat sasaran." },
  { icon: "🏆", title: "Skor & Peringkat", description: "Kumpulkan XP, naikkan level, dan bersaing di papan peringkat!" },
  { icon: "🎮", title: "4 Mode Game", description: "Daily Puzzle, Random, Practice, dan Challenge Mode. Pilih sesuai keinginan!" },
  { icon: "⭐", title: "Prestasi & Hadiah", description: "Buka achievement, dapatkan koin, dan buktikan kemampuanmu!" },
];

const steps = [
  { icon: "📝", title: "Pilih Mode", description: "Pilih mode bermain yang kamu suka" },
  { icon: "📚", title: "Pilih Pelajaran", description: "Pilih mata pelajaran dan tingkat kesulitan" },
  { icon: "✏️", title: "Isi TTS", description: "Isi kotak-kotak kosong dengan jawaban yang benar" },
  { icon: "🏆", title: "Dapatkan Skor", description: "Kumpulkan poin dan naikkan peringkatmu!" },
];

const testimonials = [
  { name: "Budi Santoso", role: "Siswa Kelas 4 SD", avatar: "👦", quote: "Seru banget! Aku jadi suka belajar Agama Islam karena TTS-nya asik." },
  { name: "Ibu Rina", role: "Guru SD", avatar: "👩‍🏫", quote: "Media pembelajaran yang inovatif. Murid-murid saya jadi lebih semangat belajar." },
  { name: "Pak Ahmad", role: "Orang Tua", avatar: "👨", quote: "Anak saya jadi ketagihan belajar. Nilai Bahasa Inggrisnya meningkat drastis!" },
];
