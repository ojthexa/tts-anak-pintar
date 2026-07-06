"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { SUBJECTS } from "@/lib/constants";

interface Student {
  id: string;
  name: string;
  grade: number;
  xp: number;
  completedPuzzles: number;
  averageScore: number;
}

interface Classroom {
  id: string;
  name: string;
  code: string;
  studentCount: number;
  students: Student[];
}

export default function TeacherDashboard() {
  const { profile, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"classrooms" | "assign" | "progress">("classrooms");
  const [classroomCode] = useState("TTS-" + Math.random().toString(36).substring(2, 8).toUpperCase());

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Stable subject averages (not random per render)
  const subjectAverages = useMemo(() =>
    Object.entries(SUBJECTS).slice(0, 6).map(([key, subject]) => ({
      key,
      subject,
      avgScore: Math.floor(Math.random() * 30) + 65,
    })),
  []
  );

  // Sample classroom data
  const [classrooms] = useState<Classroom[]>([
    {
      id: "1",
      name: "Kelas 3A",
      code: classroomCode,
      studentCount: 5,
      students: [
        { id: "1", name: "Ahmad", grade: 3, xp: 450, completedPuzzles: 30, averageScore: 82 },
        { id: "2", name: "Siti", grade: 3, xp: 380, completedPuzzles: 25, averageScore: 88 },
        { id: "3", name: "Budi", grade: 3, xp: 290, completedPuzzles: 20, averageScore: 75 },
        { id: "4", name: "Rina", grade: 3, xp: 520, completedPuzzles: 35, averageScore: 91 },
        { id: "5", name: "Dodi", grade: 3, xp: 200, completedPuzzles: 15, averageScore: 68 },
      ],
    },
  ]);

  if (isLoading || !profile) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="text-6xl">🧩</motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold clay-text mb-2">👨‍🏫 Dashboard Guru</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola kelas, berikan tugas, dan pantau progress murid</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "classrooms" as const, icon: "🏫", label: "Kelas Saya" },
            { id: "assign" as const, icon: "📝", label: "Beri Tugas" },
            { id: "progress" as const, icon: "📊", label: "Progress" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`clay-sm px-4 py-2 text-sm font-semibold clay-text transition-all ${
                activeTab === tab.id ? "ring-2 ring-[#a8e6cf]" : ""
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Classrooms Tab */}
        {activeTab === "classrooms" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {classrooms.map((classroom) => (
              <div key={classroom.id} className="clay-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold clay-text">{classroom.name}</h2>
                    <p className="text-sm text-gray-500">
                      Kode Kelas: <span className="font-mono font-bold clay-text">{classroom.code}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(classroom.code)}
                    className="clay-sm px-3 py-1.5 text-sm font-semibold clay-text"
                  >
                    📋 Salin Kode
                  </button>
                </div>

                {/* Students List */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                        <th className="pb-2 font-semibold">Nama</th>
                        <th className="pb-2 font-semibold">XP</th>
                        <th className="pb-2 font-semibold">TTS Selesai</th>
                        <th className="pb-2 font-semibold">Rata-rata Skor</th>
                        <th className="pb-2 font-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classroom.students.map((student, i) => (
                        <motion.tr
                          key={student.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b border-gray-100 dark:border-gray-800"
                        >
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">👤</span>
                              <span className="font-semibold clay-text">{student.name}</span>
                            </div>
                          </td>
                          <td className="py-3 clay-text">{student.xp}</td>
                          <td className="py-3 clay-text">{student.completedPuzzles}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="clay-inset h-2 w-20 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#a8e6cf] to-[#7ed5b0] rounded-full"
                                  style={{ width: `${student.averageScore}%` }}
                                />
                              </div>
                              <span className="text-xs clay-text">{student.averageScore}%</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <Link
                              href={`/play?subject=islam&grade=${student.grade}`}
                              className="clay-sm px-3 py-1 text-xs font-semibold clay-text"
                            >
                              🎮 Beri Tugas
                            </Link>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* Create Classroom */}
            <button className="clay-lg p-6 w-full text-center hover:scale-[1.01] transition-all">
              <div className="text-3xl mb-2">➕</div>
              <div className="font-bold clay-text">Buat Kelas Baru</div>
              <p className="text-sm text-gray-500">Tambahkan kelas dan undang murid-muridmu</p>
            </button>
          </motion.div>
        )}

        {/* Assign Tab */}
        {activeTab === "assign" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="clay-lg p-6">
            <h2 className="text-xl font-bold clay-text mb-4">📝 Beri Tugas ke Kelas</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold clay-text mb-2">Pilih Kelas</label>
                <div className="flex gap-2">
                  {classrooms.map((c) => (
                    <button key={c.id} className="clay-sm px-4 py-2 text-sm font-semibold ring-2 ring-[#a8e6cf]">
                      🏫 {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold clay-text mb-2">Mata Pelajaran</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {Object.entries(SUBJECTS).map(([key, subject]) => (
                    <button key={key} className="clay-sm p-2 text-center hover:scale-105 transition-all">
                      <div className="text-lg">{subject.icon}</div>
                      <div className="text-[10px] font-semibold clay-text">{subject.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold clay-text mb-2">Tenggat Waktu</label>
                <input type="date" className="clay-inset px-4 py-2 w-full bg-transparent" />
              </div>
              <button className="clay-lg px-6 py-3 font-bold clay-text hover:scale-105 transition-all inline-flex items-center gap-2">
                📤 Kirim Tugas
              </button>
            </div>
          </motion.div>
        )}

        {/* Progress Tab */}
        {activeTab === "progress" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="clay-lg p-6">
            <h2 className="text-xl font-bold clay-text mb-4">📊 Progress Kelas</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {subjectAverages.map(({ key, subject, avgScore }) => {
                return (
                  <div key={key} className="clay-sm p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{subject.icon}</span>
                      <span className="font-bold clay-text text-sm">{subject.label}</span>
                    </div>
                    <div className="clay-inset h-3 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${avgScore}%`, backgroundColor: subject.color }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Rata-rata: {avgScore}%</span>
                      <span>Target: 75%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
