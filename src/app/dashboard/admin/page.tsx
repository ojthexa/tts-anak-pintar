"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getAllUsers } from "@/services/supabase/profiles";
import { getAllPuzzles } from "@/services/supabase/puzzles";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPuzzles: 0,
    totalGames: 0,
    totalAiRequests: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [puzzles, setPuzzles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real data from database
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [allUsers, allPuzzles] = await Promise.all([
          getAllUsers(100),
          getAllPuzzles(50, 0),
        ]);
        setUsers(allUsers);
        setPuzzles(allPuzzles.puzzles);
        setStats({
          totalUsers: allUsers.length,
          totalPuzzles: allPuzzles.total,
          totalGames: 0,
          totalAiRequests: 0,
        });
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const tabs = [
    { id: "overview", icon: "📊", label: "Overview" },
    { id: "users", icon: "👥", label: "Users" },
    { id: "puzzles", icon: "🧩", label: "Puzzles" },
    { id: "ai", icon: "🤖", label: "AI Usage" },
  ];

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold clay-text">Admin Dashboard</h1>
          <p className="text-gray-500">Kelola pengguna, puzzle, dan sistem</p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: "👥", label: "Total Users", value: stats.totalUsers.toString() },
            { icon: "🧩", label: "Total Puzzles", value: stats.totalPuzzles.toString() },
            { icon: "🎮", label: "Games Played", value: stats.totalGames.toString() },
            { icon: "🤖", label: "AI Requests", value: stats.totalAiRequests.toString() },
          ].map((stat) => (
            <div key={stat.label} className="clay p-4 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-lg font-bold clay-text">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`clay-sm px-4 py-2 text-sm font-semibold clay-text ${activeTab === tab.id ? "ring-2 ring-[#a8e6cf]" : ""}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="clay-lg p-6">
          {activeTab === "overview" && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📊</div>
              <p>Dashboard akan menampilkan data setelah terhubung ke database.</p>
              <p className="text-sm mt-2">Lihat file database/schema.sql untuk setup database.</p>
            </div>
          )}
          {activeTab === "users" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold clay-text">Daftar Pengguna ({users.length})</h3>
              </div>
              {users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                        <th className="pb-2 font-semibold">Nama</th>
                        <th className="pb-2 font-semibold">Email</th>
                        <th className="pb-2 font-semibold">Role</th>
                        <th className="pb-2 font-semibold">Kelas</th>
                        <th className="pb-2 font-semibold">XP</th>
                        <th className="pb-2 font-semibold">Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u: any, i: number) => (
                        <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 font-semibold clay-text">
                            <div className="flex items-center gap-2">
                              <span>{u.avatar_url ? <img src={u.avatar_url} alt="" className="w-6 h-6 rounded-full" /> : "👤"}</span>
                              {u.display_name || "-"}
                            </div>
                          </td>
                          <td className="py-3 text-gray-500">{u.email || "-"}</td>
                          <td className="py-3"><span className="clay-sm px-2 py-0.5 text-xs">{u.role || "student"}</span></td>
                          <td className="py-3 clay-text">{u.grade || "-"}</td>
                          <td className="py-3 clay-text">{u.xp || 0}</td>
                          <td className="py-3 clay-text">{u.level || 1}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">👥</div>
                  <p>Belum ada pengguna terdaftar.</p>
                </div>
              )}
            </div>
          )}
          {activeTab === "puzzles" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold clay-text">Daftar Puzzle ({puzzles.length})</h3>
                <Link href="/play" className="clay-sm px-4 py-2 text-sm font-semibold clay-text">
                  + Buat Baru
                </Link>
              </div>
              {puzzles.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                        <th className="pb-2 font-semibold">Judul</th>
                        <th className="pb-2 font-semibold">Subject</th>
                        <th className="pb-2 font-semibold">Difficulty</th>
                        <th className="pb-2 font-semibold">Kelas</th>
                        <th className="pb-2 font-semibold">Dibuat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {puzzles.map((p: any, i: number) => (
                        <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 font-semibold clay-text">{p.title || "-"}</td>
                          <td className="py-3">{p.subject || "-"}</td>
                          <td className="py-3"><span className="clay-sm px-2 py-0.5 text-xs">{p.difficulty || "-"}</span></td>
                          <td className="py-3 clay-text">{p.grade || "-"}</td>
                          <td className="py-3 text-gray-500 text-xs">
                            {p.created_at ? new Date(p.created_at).toLocaleDateString("id-ID") : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">🧩</div>
                  <p>Belum ada puzzle. Puzzle akan muncul setelah AI menghasilkan.</p>
                </div>
              )}
            </div>
          )}
          {activeTab === "ai" && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🤖</div>
              <p>AI Usage stats akan ditampilkan setelah terintegrasi dengan OpenAI.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
