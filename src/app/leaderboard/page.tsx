"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { getLeaderboard } from "@/services/supabase/profiles";
import type { LeaderboardEntry } from "@/types/user";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getLeaderboard(50);
      if (data.length > 0) {
        setEntries(data);
      } else {
        // Use sample data if no real data
        setEntries([
          { rank: 1, userId: "1", displayName: "Ahmad", score: 2500, level: 15 },
          { rank: 2, userId: "2", displayName: "Siti", score: 2200, level: 13 },
          { rank: 3, userId: "3", displayName: "Budi", score: 1900, level: 12 },
          { rank: 4, userId: "4", displayName: "Rina", score: 1700, level: 11 },
          { rank: 5, userId: "5", displayName: "Dodi", score: 1500, level: 10 },
        ]);
      }
    } catch {
      // Use sample data on error
      setEntries([
        { rank: 1, userId: "1", displayName: "Ahmad", score: 2500, level: 15 },
        { rank: 2, userId: "2", displayName: "Siti", score: 2200, level: 13 },
        { rank: 3, userId: "3", displayName: "Budi", score: 1900, level: 12 },
        { rank: 4, userId: "4", displayName: "Rina", score: 1700, level: 11 },
        { rank: 5, userId: "5", displayName: "Dodi", score: 1500, level: 10 },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getMedal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="min-h-[80vh] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="text-5xl mb-4">🏆</div>
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-3xl font-bold clay-text">Papan Peringkat</h1>
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="clay-sm px-3 py-1.5 text-xs font-semibold clay-text hover:scale-105 transition-all disabled:opacity-50"
              title="Perbarui peringkat"
              aria-label="Perbarui peringkat"
            >
              {refreshing ? "⏳" : "🔄"}
            </button>
          </div>
          <p className="text-gray-500">Siswa dengan XP tertinggi</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="text-4xl">🧩</motion.div>
          </div>
        ) : (
          <div className="clay-lg overflow-hidden">
            {/* Podium for top 3 */}
            <div className="flex justify-center items-end gap-4 p-6 bg-gradient-to-b from-transparent to-[#a8e6cf]/10">
              {entries.slice(0, 3).map((entry, i) => {
                const heights = ["h-24", "h-32", "h-20"];
                const order = [1, 0, 2];
                return (
                  <div key={entry.userId} className={`flex flex-col items-center ${order[i] === 0 ? "order-2" : order[i] === 1 ? "order-1" : "order-3"}`}>
                    <div className="text-2xl mb-1">{getMedal(entry.rank)}</div>
                    <div className="w-14 h-14 rounded-full clay-colored flex items-center justify-center text-xl mb-2">
                      {entry.avatarUrl ? <img src={entry.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" /> : "👤"}
                    </div>
                    <div className="font-bold text-sm clay-text">{entry.displayName}</div>
                    <div className="text-xs text-gray-500">{entry.score} XP</div>
                    <div className={`w-full clay-sm mt-2 ${heights[order[i]]}`} style={{ minWidth: "60px" }}>
                      <div className="text-center font-bold clay-text pt-2">Lv.{entry.level}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* List */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {entries.map((entry, i) => (
                <motion.div key={entry.userId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="w-10 text-center font-bold text-lg">{getMedal(entry.rank)}</div>
                  <div className="w-10 h-10 rounded-full clay-colored flex items-center justify-center text-lg">
                    {entry.avatarUrl ? <img src={entry.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" /> : "👤"}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold clay-text">{entry.displayName}</div>
                    <div className="text-xs text-gray-500">Level {entry.level}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold clay-text">{entry.score}</div>
                    <div className="text-xs text-gray-500">XP</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
