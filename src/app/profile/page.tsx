"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/providers/AuthProvider";
import { ACHIEVEMENTS, GRADES } from "@/lib/constants";
import { updateProfile } from "@/services/supabase/profiles";

export default function ProfilePage() {
  const { user, profile, isAuthenticated, isLoading, refreshProfile } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [grade, setGrade] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setGrade(profile.grade || 1);
    }
  }, [profile]);

  if (isLoading || !profile) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="text-6xl">🧩</motion.div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    await updateProfile(profile.id, { displayName, grade });
    await refreshProfile();
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="min-h-[80vh] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="clay-lg p-8 mb-8 text-center">
          <div className="w-24 h-24 rounded-full clay-colored flex items-center justify-center text-5xl mx-auto mb-4">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              "👤"
            )}
          </div>
          <h1 className="text-2xl font-bold clay-text">{profile.displayName}</h1>
          <p className="text-gray-500">{profile.email}</p>
          <div className="flex justify-center gap-4 mt-4">
            <div className="clay-sm px-4 py-2"><span className="font-bold">{profile.level}</span> Level</div>
            <div className="clay-sm px-4 py-2"><span className="font-bold">{profile.xp}</span> XP</div>
            <div className="clay-sm px-4 py-2"><span className="font-bold">{profile.coins}</span> 🪙</div>
          </div>
          <button onClick={() => setEditing(!editing)} className="clay-sm px-6 py-2 mt-4 font-semibold clay-text">
            ✏️ Edit Profil
          </button>
        </motion.div>

        {/* Edit Profile */}
        {editing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="clay p-6 mb-8">
            <h3 className="font-bold clay-text mb-4">Edit Profil</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nama</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                  className="clay-inset w-full px-4 py-2 bg-transparent" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Kelas</label>
                <div className="flex gap-2">
                  {GRADES.map((g) => (
                    <button key={g} onClick={() => setGrade(g)}
                      className={`clay-sm px-4 py-2 ${grade === g ? "ring-2 ring-[#a8e6cf]" : ""}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving} className="clay-lg px-6 py-2 font-semibold clay-text">
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
                <button onClick={() => setEditing(false)} className="clay-sm px-6 py-2 font-semibold clay-text">
                  Batal
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Achievements */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h2 className="text-xl font-bold clay-text mb-4">🏆 Pencapaian</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ACHIEVEMENTS.map((a) => (
              <div key={a.id} className="clay-sm p-3 flex items-center gap-3">
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <div className="font-bold text-sm clay-text">{a.name}</div>
                  <div className="text-xs text-gray-500">+{a.xpReward} XP</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
