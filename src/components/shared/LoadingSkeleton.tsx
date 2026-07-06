"use client";

import { motion } from "framer-motion";

/**
 * Dashboard skeleton loader
 */
export function DashboardSkeleton() {
  return (
    <div className="min-h-[80vh] px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="clay-lg p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full clay-inset animate-pulse" />
            <div className="flex-1 space-y-3 w-full">
              <div className="h-6 w-48 clay-inset rounded animate-pulse" />
              <div className="h-4 w-32 clay-inset rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="clay p-4 text-center">
              <div className="h-8 w-12 clay-inset rounded mx-auto mb-2 animate-pulse" />
              <div className="h-4 w-16 clay-inset rounded mx-auto animate-pulse" />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="clay p-4">
              <div className="h-5 w-32 clay-inset rounded mb-3 animate-pulse" />
              <div className="h-2 clay-inset rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Game loading skeleton
 */
export function GameSkeleton() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-6xl mb-4"
        >
          🧩
        </motion.div>
        <div className="h-5 w-40 clay-inset rounded mx-auto animate-pulse" />
      </div>
    </div>
  );
}

/**
 * Leaderboard skeleton loader
 */
export function LeaderboardSkeleton() {
  return (
    <div className="min-h-[80vh] px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <div className="text-5xl mb-4">🏆</div>
          <div className="h-8 w-64 clay-inset rounded mx-auto mb-2 animate-pulse" />
        </div>
        <div className="clay-lg overflow-hidden">
          {/* Podium */}
          <div className="flex justify-center gap-4 p-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="text-2xl mb-2">👤</div>
                <div className="w-14 h-14 rounded-full clay-inset animate-pulse mb-2" />
                <div className="h-4 w-16 clay-inset rounded mb-1 animate-pulse" />
                <div className={`w-full clay-sm mt-2 animate-pulse ${i === 0 ? "h-32" : i === 1 ? "h-24" : "h-20"}`} style={{ minWidth: "60px" }} />
              </div>
            ))}
          </div>
          {/* List */}
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="w-8 h-8 clay-inset rounded animate-pulse" />
                <div className="w-10 h-10 rounded-full clay-inset animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-24 clay-inset rounded animate-pulse" />
                  <div className="h-3 w-16 clay-inset rounded animate-pulse" />
                </div>
                <div className="h-5 w-12 clay-inset rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Card skeleton for grids
 */
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="clay p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full clay-inset animate-pulse" />
            <div className="h-5 w-28 clay-inset rounded animate-pulse" />
          </div>
          <div className="h-2 clay-inset rounded animate-pulse" />
        </div>
      ))}
    </>
  );
}
