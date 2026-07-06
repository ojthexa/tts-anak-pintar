"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Word } from "@/types/crossword";
import { playClickSound } from "@/services/game/audio";

interface ExplanationModalProps {
  word: Word | null;
  open: boolean;
  onClose: () => void;
}

export default function ExplanationModal({ word, open, onClose }: ExplanationModalProps) {
  if (!word) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="clay-lg p-6 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Penjelasan jawaban"
          >
            <div className="text-4xl mb-3">💡</div>
            <h3 className="text-lg font-bold clay-text mb-1">
              {word.clue}
            </h3>
            <div className="text-2xl font-extrabold text-[#a8e6cf] mb-3">
              {word.answer}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              {word.explanation}
            </p>
            {word.sourceMetadata && (
              <div className="text-xs text-gray-400 mb-4">
                Sumber: {word.sourceMetadata.reference || word.sourceMetadata.type}
              </div>
            )}
            <button
              onClick={() => { playClickSound(); onClose(); }}
              className="clay-lg px-6 py-2 text-sm font-bold clay-text hover:scale-105 transition-all"
              autoFocus
            >
              Lanjut Bermain
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
