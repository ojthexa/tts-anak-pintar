import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="clay-lg p-12 text-center max-w-md">
        <div className="text-7xl mb-6">🔍</div>
        <h1 className="text-4xl font-bold clay-text mb-3">404</h1>
        <h2 className="text-xl font-bold clay-text mb-3">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Maaf, halaman yang kamu cari tidak ada atau sudah dipindahkan.
          Yuk, kembali ke halaman utama!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="clay-lg px-8 py-4 font-bold clay-text hover:scale-105 transition-all inline-flex items-center gap-2"
          >
            🏠 Ke Beranda
          </Link>
          <Link
            href="/play"
            className="clay-sm px-8 py-4 font-bold clay-text hover:scale-105 transition-all inline-flex items-center gap-2"
          >
            🎮 Main TTS
          </Link>
        </div>
      </div>
    </div>
  );
}
