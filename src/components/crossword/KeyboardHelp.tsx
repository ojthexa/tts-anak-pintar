"use client";

import { motion, AnimatePresence } from "framer-motion";

interface KeyboardHelpProps {
  open: boolean;
  onClose: () => void;
}

const shortcuts = [
  { keys: ["←", "→", "↑", "↓"], description: "Navigasi antar sel" },
  { keys: ["Tab"], description: "Ganti arah (horizontal/vertikal)" },
  { keys: ["A-Z"], description: "Isi huruf pada sel aktif" },
  { keys: ["Backspace"], description: "Hapus huruf pada sel" },
  { keys: ["Enter"], description: "Konfirmasi kata (jika input mode)" },
  { keys: ["Esc"], description: "Tutup modal / batalkan" },
];

export default function KeyboardHelp({ open, onClose }: KeyboardHelpProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="clay-lg p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold clay-text flex items-center gap-2">
                ⌨️ Pintasan Keyboard
              </h2>
              <button
                onClick={onClose}
                className="clay-sm px-3 py-1.5 text-sm clay-text hover:scale-105 transition-all"
              >
                ✕ Tutup
              </button>
            </div>

            <div className="space-y-3">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.keys.join("-")}
                  className="flex items-center justify-between clay-sm p-3"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {shortcut.description}
                  </span>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key) => (
                      <kbd
                        key={key}
                        className="clay-inset px-2.5 py-1 text-xs font-bold clay-text min-w-[28px] text-center"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 clay-sm p-3 bg-gradient-to-r from-[#a8e6cf]/10 to-[#d4c5f9]/10">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                💡 Tekan <kbd className="clay-inset px-1.5 py-0.5 text-[10px] font-bold">Tab</kbd> untuk 
                ganti arah saat bermain
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
