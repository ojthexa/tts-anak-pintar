"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  rotation: number;
  scale: number;
  delay: number;
  duration: number;
  shape: "circle" | "square" | "triangle";
}

interface ConfettiProps {
  active: boolean;
  count?: number;
}

const COLORS = [
  "#a8e6cf",
  "#d4c5f9",
  "#f8b4c8",
  "#ffd3b6",
  "#b8d4e3",
  "#ffeba7",
  "#ffb3a7",
  "#b5ead7",
];

export default function Confetti({ active, count = 50 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }

    const newPieces: ConfettiPiece[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 720 - 360,
      scale: 0.5 + Math.random() * 0.8,
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 2,
      shape: (["circle", "square", "triangle"] as const)[
        Math.floor(Math.random() * 3)
      ],
    }));

    setPieces(newPieces);

    const timer = setTimeout(() => setPieces([]), 4000);
    return () => clearTimeout(timer);
  }, [active, count]);

  return (
    <AnimatePresence>
      {pieces.length > 0 ? (
        <motion.div
          key="confetti-container"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 pointer-events-none z-[60] overflow-hidden"
        >
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                x: `${piece.x}vw`,
                y: -20,
                rotate: 0,
                scale: piece.scale,
                opacity: 1,
              }}
              animate={{
                x: `${piece.x + (Math.random() - 0.5) * 20}vw`,
                y: "110vh",
                rotate: piece.rotation,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="absolute"
              style={{ left: 0, top: 0 }}
            >
              {piece.shape === "circle" && (
                <div
                  className="rounded-full"
                  style={{
                    width: 10 * piece.scale,
                    height: 10 * piece.scale,
                    backgroundColor: piece.color,
                  }}
                />
              )}
              {piece.shape === "square" && (
                <div
                  style={{
                    width: 10 * piece.scale,
                    height: 10 * piece.scale,
                    backgroundColor: piece.color,
                    borderRadius: 2,
                  }}
                />
              )}
              {piece.shape === "triangle" && (
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: `${6 * piece.scale}px solid transparent`,
                    borderRight: `${6 * piece.scale}px solid transparent`,
                    borderBottom: `${10 * piece.scale}px solid ${piece.color}`,
                  }}
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/**
 * Star burst component for smaller celebrations
 */
export function StarBurst({ active }: { active: boolean }) {
  const stars = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    angle: (i * 360) / 8,
    distance: 40 + Math.random() * 60,
  }));

  return (
    <AnimatePresence>
      {active && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          {stars.map((star) => (
            <motion.div
              key={star.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos((star.angle * Math.PI) / 180) * star.distance,
                y: Math.sin((star.angle * Math.PI) / 180) * star.distance,
                opacity: 0,
                scale: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-xl absolute"
            >
              ⭐
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
