"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Star, GitFork, AlertCircle, GitCommit, RefreshCw, Info } from "lucide-react";

interface Repo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  fork: boolean;
  language: string | null;
  updated_at: string;
  topics: string[];
}

interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
}

export default function GitHubDashboardPage() {
  const [username, setUsername] = useState("");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "stars" | "name">("stars");

  const fetchRepos = useCallback(async (targetUsername: string) => {
    if (!targetUsername.trim()) return;
    setLoading(true);
    setError("");
    try {
      const [userRes, reposRes] = await Promise.all([
        fetch(`/api/github?action=user&username=${encodeURIComponent(targetUsername)}`),
        fetch(`/api/github?action=repos&username=${encodeURIComponent(targetUsername)}&sort=${sortBy}`),
      ]);

      if (!userRes.ok) {
        const err = await userRes.json();
        throw new Error(err.error || "Failed to fetch user");
      }
      if (!reposRes.ok) {
        const err = await reposRes.json();
        throw new Error(err.error || "Failed to fetch repos");
      }

      const userData = await userRes.json();
      const reposData = await reposRes.json();

      setUser(userData);
      setRepos(
        reposData
          .filter((r: Repo) => !r.fork)
          .slice(0, 12)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setUser(null);
      setRepos([]);
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  // Load on mount if username was searched before
  useEffect(() => {
    const saved = localStorage.getItem("github_last_username");
    if (saved) {
      setUsername(saved);
      fetchRepos(saved);
    }
  }, [fetchRepos]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem("github_last_username", username.trim());
      fetchRepos(username.trim());
    }
  };

  const languageColors: Record<string, string> = {
    TypeScript: "#3178c6",
    JavaScript: "#f7df1e",
    Python: "#3572a5",
    Go: "#00add8",
    Rust: "#dea584",
    Java: "#b07219",
    "C++": "#f34b7d",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Ruby: "#701516",
    PHP: "#4f5d95",
    Swift: "#f05138",
    Kotlin: "#a97bff",
    Dart: "#00b4ab",
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Hari ini";
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="min-h-[80vh] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 clay-sm px-4 py-2 text-sm font-semibold clay-text hover:scale-105 transition-all mb-4"
          >
            <ArrowLeft size={16} />
            Kembali ke Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-5xl">
              <svg viewBox="0 0 24 24" className="w-12 h-12" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold clay-text mb-1">GitHub</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Cari dan lihat repositori publik GitHub
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSearch}
          className="clay-lg p-4 mb-6"
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username GitHub..."
              className="clay-inset flex-1 px-4 py-3 bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#a8e6cf]"
            />
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="clay-lg px-6 py-3 font-bold clay-text hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              )}
              Cari
            </button>
          </div>
        </motion.form>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="clay-sm bg-red-50 dark:bg-red-900/20 p-4 mb-6 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        {/* User Profile */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="clay-lg p-6 mb-6"
          >
            <div className="flex items-center gap-4">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-16 h-16 rounded-full clay-colored"
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold clay-text">
                  {user.name || user.login}
                </h2>
                <a
                  href={`https://github.com/${user.login}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-[#a8e6cf] transition-colors flex items-center gap-1"
                >
                  @{user.login}
                  <ExternalLink size={12} />
                </a>
                {user.bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {user.bio}
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <div className="clay-sm px-4 py-2 text-center">
                  <div className="font-bold clay-text">{user.public_repos}</div>
                  <div className="text-xs text-gray-500">Repositori</div>
                </div>
                <div className="clay-sm px-4 py-2 text-center">
                  <div className="font-bold clay-text">{user.followers}</div>
                  <div className="text-xs text-gray-500">Pengikut</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sort Controls */}
        {repos.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Menampilkan {repos.length} repositori
            </p>
            <div className="flex gap-2">
              {(["stars", "updated", "name"] as const).map((sort) => (
                <button
                  key={sort}
                  onClick={() => setSortBy(sort)}
                  className={`clay-sm px-3 py-1.5 text-xs font-semibold clay-text hover:scale-105 transition-all ${
                    sortBy === sort ? "ring-2 ring-[#a8e6cf]" : ""
                  }`}
                >
                  {sort === "stars" ? "⭐ Bintang" : sort === "updated" ? "🔄 Terbaru" : "📝 Nama"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Repositories Grid */}
        {loading ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-4xl inline-block"
            >
              <svg viewBox="0 0 24 24" className="w-10 h-10" fill="currentColor" style={{ color: "#4a5568" }}>
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </motion.div>
            <p className="clay-text font-bold mt-4">Memuat repositori...</p>
          </div>
        ) : repos.length > 0 ? (
          <div className="grid gap-4">
            {repos.map((repo, i) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="clay p-5 hover:scale-[1.01] transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-bold clay-text hover:text-[#a8e6cf] transition-colors flex items-center gap-2"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="currentColor" style={{ color: "#4a5568" }}>
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      <span className="truncate">{repo.full_name}</span>
                      <ExternalLink size={14} className="flex-shrink-0 opacity-50" />
                    </a>
                    {repo.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {repo.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      {repo.language && (
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: languageColors[repo.language] || "#858585",
                            }}
                          />
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Star size={14} />
                        {repo.stargazers_count}
                      </span>
                      <span className="text-xs text-gray-500">
                        Diperbarui {formatDate(repo.updated_at)}
                      </span>
                    </div>
                    {repo.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {repo.topics.slice(0, 4).map((topic) => (
                          <span
                            key={topic}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-[#a8e6cf]/20 text-[#4a5568] dark:text-gray-300"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : !loading && !error && !user ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="clay-lg p-12 text-center"
          >
            <div className="text-6xl mb-4">
              <svg viewBox="0 0 24 24" className="w-16 h-16 mx-auto" fill="currentColor" style={{ color: "#4a5568" }}>
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold clay-text mb-2">
              Cari Repositori GitHub
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Masukkan username GitHub di atas untuk melihat repositori publik mereka.
            </p>
          </motion.div>
        ) : null}

        {/* Integration Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="clay-sm p-4 mt-8 flex items-start gap-3"
        >
          <Info size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm clay-text font-semibold mb-1">
              Tentang Integrasi GitHub
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Halaman ini menggunakan GitHub REST API untuk mencari dan menampilkan repositori publik.
              Data repositori diambil melalui server proxy — token GitHub tetap aman di sisi server.
              Github Personal Access Token (GITHUB_TOKEN) diperlukan untuk mengaktifkan integrasi ini.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
