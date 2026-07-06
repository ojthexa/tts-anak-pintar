"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="clay-lg p-12 text-center max-w-md">
        <div className="text-7xl mb-6">😅</div>
        <h1 className="text-3xl font-bold clay-text mb-3">Ada yang Salah</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Maaf, terjadi kesalahan yang tidak terduga. Tim kami sudah mengetahuinya.
          Coba refresh halaman ini!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="clay-lg px-8 py-4 font-bold clay-text hover:scale-105 transition-all inline-flex items-center gap-2"
          >
            🔄 Coba Lagi
          </button>
          <a
            href="/"
            className="clay-sm px-8 py-4 font-bold clay-text hover:scale-105 transition-all inline-flex items-center gap-2"
          >
            🏠 Ke Beranda
          </a>
        </div>
      </div>
    </div>
  );
}
