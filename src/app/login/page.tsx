"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { signIn, resetPassword } from "@/services/supabase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn(email, password);
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

  const handleResetPassword = async () => {
    if (!forgotEmail) return;
    setForgotLoading(true);
    const err = await resetPassword(forgotEmail);
    setForgotLoading(false);
    if (err) {
      toast.error("Gagal", { description: err });
    } else {
      toast.success("Email Terkirim!", {
        description: "Cek email kamu untuk tautan reset password",
      });
      setShowForgot(false);
      setForgotEmail("");
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
            <div className="text-5xl mb-4">🧩</div>
            <h1 className="text-3xl font-bold clay-text mb-2">Selamat Datang!</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Masuk untuk melanjutkan belajar
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="clay-sm bg-red-50 dark:bg-red-900/20 p-4 mb-6 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold clay-text mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="clay-inset w-full px-4 py-3 text-gray-800 dark:text-gray-200 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#a8e6cf]"
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
                className="clay-inset w-full px-4 py-3 text-gray-800 dark:text-gray-200 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#a8e6cf]"
                placeholder="Masukkan password"
                required
              />
              <div className="text-right mt-1">
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-sm text-[#a8e6cf] hover:underline font-semibold"
                >
                  Lupa Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="clay-lg w-full py-4 text-lg font-bold clay-text hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#f0f2f5] dark:bg-[#0f1419] text-gray-500">
                atau
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button
              onClick={async () => {
                const { signInWithGoogle } = await import("@/services/supabase/auth");
                await signInWithGoogle();
              }}
              className="clay-sm w-full py-3 font-semibold clay-text hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>🔵</span>
              Masuk dengan Google
            </button>

            <button
              onClick={async () => {
                const { signInWithGitHub } = await import("@/services/supabase/auth");
                await signInWithGitHub();
              }}
              className="clay-sm w-full py-3 font-semibold clay-text hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Masuk dengan GitHub
            </button>
          </div>

          {/* Register link */}
          <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-bold text-[#a8e6cf] hover:underline"
            >
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
            onClick={() => setShowForgot(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="clay-lg p-6 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-5xl mb-4">🔑</div>
              <h2 className="text-xl font-bold clay-text mb-2">Reset Password</h2>
              <p className="text-sm text-gray-500 mb-6">
                Masukkan email kamu. Kami akan kirim tautan reset password.
              </p>

              <div className="space-y-4">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="clay-inset w-full px-4 py-3 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#a8e6cf]"
                  placeholder="nama@email.com"
                  required
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleResetPassword}
                    disabled={forgotLoading}
                    className="clay-lg flex-1 py-3 font-bold clay-text hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {forgotLoading ? "Mengirim..." : "Kirim Tautan"}
                  </button>
                  <button
                    onClick={() => setShowForgot(false)}
                    className="clay-sm px-6 py-3 font-semibold clay-text"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
