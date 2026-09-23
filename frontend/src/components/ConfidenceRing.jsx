import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ConfidenceRing({
  landmarks,
  confidence = 0,
  isValid = false,
  color = "#38bdf8",
  isMirrored = true,
  containerWidth = 1000,
  containerHeight = 700
}) {
  if (!landmarks || landmarks.length !== 21) return null;

  // Hand center: midpoint between Wrist (0) and Middle MCP (9)
  const wrist = landmarks[0];
  const middleMcp = landmarks[9];
  const rawCenterX = (wrist.x + middleMcp.x) / 2;
  const rawCenterY = (wrist.y + middleMcp.y) / 2;

  const xPercent = (isMirrored ? 1.0 - rawCenterX : rawCenterX) * 100;
  const yPercent = rawCenterY * 100;

  // Ring geometry
  const radius = 46;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(confidence, 1.0) * circumference);

  const isHighConfidence = isValid && confidence >= 0.80;

  return (
    <AnimatePresence>
      <motion.div
        key="confidence-ring"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.6 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="absolute pointer-events-none z-20"
        style={{
          left: `${xPercent}%`,
          top: `${yPercent}%`,
          transform: "translate(-50%, -50%)"
        }}
      >
        <div className="relative flex items-center justify-center">
          {/* Subtle outer pulsing aura when confident */}
          {isHighConfidence && (
            <motion.div
              animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0.1, 0.6] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-28 h-28 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${color}33 0%, rgba(0,0,0,0) 70%)`
              }}
            />
          )}

          {/* SVG Progress Ring */}
          <svg className="w-24 h-24 transform -rotate-90 filter drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">
            {/* Background track */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth={strokeWidth}
              fill="rgba(15, 23, 42, 0.25)"
            />
            {/* Dynamic glowing progress arc */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke={isValid ? color : "rgba(148, 163, 184, 0.5)"}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{
                transition: "stroke-dashoffset 0.15s ease-out, stroke 0.2s ease"
              }}
            />
          </svg>

          {/* Center HUD readout */}
          <div className="absolute flex flex-col items-center justify-center">
            <span
              className="text-xs font-mono font-bold tracking-tight"
              style={{ color: isValid ? color : "#94a3b8" }}
            >
              {Math.round(confidence * 100)}%
            </span>
            <span className="text-[9px] font-sans tracking-widest uppercase text-slate-400">
              {isValid ? "LOCKED" : "SEEK"}
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
