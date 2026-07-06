"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { signUp } from "@/services/supabase/auth";
import { GRADES } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher" | "parent">("student");
  const [grade, setGrade] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signUp(email, password, name, role, grade);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/play");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="clay-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🚀</div>
            <h1 className="text-3xl font-bold clay-text mb-2">Daftar Gratis</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Mulai petualangan belajarmu!
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  s <= step
                    ? "bg-gradient-to-r from-[#a8e6cf] to-[#7ed5b0]"
                    : "clay-inset"
                }`}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="clay-sm bg-red-50 dark:bg-red-900/20 p-4 mb-6 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Profile Info */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-semibold clay-text mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="clay-inset w-full px-4 py-3 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#a8e6cf]"
                    placeholder="Nama kamu"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold clay-text mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="clay-inset w-full px-4 py-3 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#a8e6cf]"
                    placeholder="nama@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold clay-text mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="clay-inset w-full px-4 py-3 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#a8e6cf]"
                    placeholder="Minimal 6 karakter"
                    minLength={6}
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="clay-lg w-full py-3 font-bold clay-text hover:scale-[1.02] transition-all"
                >
                  Lanjut
                </button>
              </motion.div>
            )}

            {/* Step 2: Role */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <label className="block text-sm font-semibold clay-text mb-4">
                  Saya adalah...
                </label>

                <div className="grid gap-3">
                  {[
                    { value: "student", label: "🎒 Siswa", desc: "Belajar dan bermain TTS" },
                    { value: "teacher", label: "👨‍🏫 Guru", desc: "Membuat TTS untuk murid" },
                    { value: "parent", label: "👨‍👩‍👧‍👦 Orang Tua", desc: "Pantau progress anak" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setRole(option.value as typeof role);
                        setStep(3);
                      }}
                      className={`clay-sm p-4 text-left hover:scale-[1.02] transition-all ${
                        role === option.value
                          ? "ring-2 ring-[#a8e6cf]"
                          : ""
                      }`}
                    >
                      <div className="font-bold clay-text">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.desc}</div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-gray-500 hover:underline"
                >
                  ← Kembali
                </button>
              </motion.div>
            )}

            {/* Step 3: Grade */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <label className="block text-sm font-semibold clay-text mb-4">
                  {role === "student"
                    ? "Kamu kelas berapa?"
                    : role === "teacher"
                    ? "Kamu mengajar kelas berapa?"
                    : "Anakmu kelas berapa?"}
                </label>

                <div className="grid grid-cols-3 gap-3">
                  {GRADES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrade(g)}
                      className={`clay-sm p-4 text-center hover:scale-[1.02] transition-all ${
                        grade === g ? "ring-2 ring-[#a8e6cf]" : ""
                      }`}
                    >
                      <div className="text-2xl mb-1">
                        {["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣"][g - 1]}
                      </div>
                      <div className="font-bold clay-text text-sm">
                        Kelas {g}
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="clay-lg w-full py-3 font-bold clay-text hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {loading ? "Memproses..." : "Daftar!"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-sm text-gray-500 hover:underline block text-center w-full"
                >
                  ← Kembali
                </button>
              </motion.div>
            )}
          </form>

          {/* Login link */}
          <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-bold text-[#a8e6cf] hover:underline"
            >
              Masuk
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
