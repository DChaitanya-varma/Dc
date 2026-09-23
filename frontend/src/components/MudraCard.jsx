import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Info, BookOpen, Compass, ChevronRight, CheckCircle2 } from "lucide-react";

export function MudraCard({
  mudraData,
  confidence = 0,
  isOpen = true,
  onClose = null
}) {
  if (!mudraData || !isOpen) return null;

  const {
    name,
    sanskrit,
    meaning,
    description,
    pose_guidance,
    color = "#38bdf8",
    sloka_reference
  } = mudraData;

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ x: 380, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 380, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="w-80 md:w-96 glass-panel rounded-2xl p-5 text-slate-100 shadow-2xl relative overflow-hidden border border-white/15"
      >
        {/* Soft atmospheric gradient backlight */}
        <div
          className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: color }}
        />

        {/* Header badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
            />
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
              Kuchipudi Asamyukta Hasta
            </span>
          </div>
          {confidence > 0 && (
            <span
              className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full border border-white/10"
              style={{ color }}
            >
              {Math.round(confidence * 100)}% match
            </span>
          )}
        </div>

        {/* Mudra Names: Large Serif + Sanskrit Calligraphy */}
        <div className="border-b border-white/10 pb-4 mb-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-3xl font-serif font-bold tracking-tight text-white">
              {name}
            </h2>
            <span
              className="text-2xl font-serif text-slate-300 font-semibold"
              style={{ textShadow: `0 0 16px ${color}66` }}
            >
              {sanskrit}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-400 mt-1 italic">
            "{meaning}"
          </p>
        </div>

        {/* Dynamic Mudra Hand Illustration / Diagram */}
        <div className="relative rounded-xl overflow-hidden glass-panel-subtle p-4 mb-4 border border-white/10 flex items-center justify-center bg-gradient-to-b from-slate-900/60 to-slate-950/80">
          <MudraVectorVisual mudraName={name} color={color} />
        </div>

        {/* Finger Posture Guidance */}
        <div className="space-y-3 text-xs">
          <div className="flex items-start space-x-2 bg-slate-900/50 p-2.5 rounded-lg border border-white/5">
            <Compass className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-200 mb-0.5">Pose Guidance</p>
              <p className="text-slate-400 leading-relaxed">{pose_guidance}</p>
            </div>
          </div>

          <div className="flex items-start space-x-2 bg-slate-900/50 p-2.5 rounded-lg border border-white/5">
            <BookOpen className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-200 mb-0.5">Shastra Meaning</p>
              <p className="text-slate-400 leading-relaxed line-clamp-3">{description}</p>
            </div>
          </div>
        </div>

        {/* Sloka Footnote */}
        {sloka_reference && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-[10px] text-slate-500 italic truncate">
              {sloka_reference}
            </p>
          </div>
        )}
      </motion.aside>
    </AnimatePresence>
  );
}

// Vector illustration representation for canonical mudras
function MudraVectorVisual({ mudraName, color }) {
  return (
    <svg viewBox="0 0 160 160" className="w-36 h-36 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
      <defs>
        <radialGradient id={`glow-${mudraName}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient background glow circle */}
      <circle cx="80" cy="80" r="72" fill={`url(#glow-${mudraName})`} />
      <circle cx="80" cy="80" r="68" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />

      {/* Stylized Classical Mudra Hand Geometry */}
      <g stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Palm base */}
        <path d="M 60 130 C 60 100, 68 85, 78 85 C 88 85, 96 100, 96 130 Z" fill="rgba(255,255,255,0.05)" />

        {/* Finger configurations according to mudra */}
        {mudraName === "Pataka" && (
          <>
            {/* 4 straight fingers joined */}
            <path d="M 68 85 L 68 35" />
            <path d="M 75 85 L 75 28" />
            <path d="M 82 85 L 82 30" />
            <path d="M 89 85 L 89 42" />
            {/* Thumb bent touching side */}
            <path d="M 60 105 Q 52 100 56 90 Q 60 85 66 90" stroke="#fef08a" />
          </>
        )}

        {mudraName === "Tripataka" && (
          <>
            <path d="M 68 85 L 68 35" />
            <path d="M 75 85 L 75 28" />
            {/* Ring finger bent */}
            <path d="M 82 85 Q 86 65 78 68 Q 74 72 78 80" stroke="#f43f5e" />
            <path d="M 89 85 L 89 42" />
            <path d="M 60 105 Q 52 100 56 90 Q 60 85 66 90" stroke="#fef08a" />
          </>
        )}

        {mudraName === "Ardhapataka" && (
          <>
            <path d="M 68 85 L 68 35" />
            <path d="M 75 85 L 75 28" />
            {/* Ring and Pinky bent */}
            <path d="M 82 85 Q 86 65 78 68" stroke="#f43f5e" />
            <path d="M 89 85 Q 92 70 85 74" stroke="#f43f5e" />
            <path d="M 60 105 Q 52 100 56 90" stroke="#fef08a" />
          </>
        )}

        {mudraName === "Kartarimukha" && (
          <>
            {/* Index and Middle in wide V */}
            <path d="M 72 85 L 56 32" stroke="#10b981" />
            <path d="M 80 85 L 96 32" stroke="#8b5cf6" />
            {/* Ring & Pinky closed */}
            <path d="M 84 88 Q 90 75 80 75" />
            <path d="M 88 92 Q 94 80 84 82" />
            {/* Thumb over ring */}
            <path d="M 60 105 Q 65 85 78 82" stroke="#fef08a" />
          </>
        )}

        {mudraName === "Mayura" && (
          <>
            <path d="M 68 85 L 68 35" />
            <path d="M 75 85 L 75 28" />
            {/* Thumb touches ring finger tip forming loop */}
            <circle cx="78" cy="74" r="10" stroke="#10b981" fill="rgba(16,185,129,0.15)" />
            <path d="M 89 85 L 89 42" />
          </>
        )}

        {mudraName === "Ardhachandra" && (
          <>
            {/* 4 fingers joined */}
            <path d="M 72 85 L 72 32" />
            <path d="M 78 85 L 78 26" />
            <path d="M 84 85 L 84 30" />
            <path d="M 90 85 L 90 40" />
            {/* Thumb stretched outward wide */}
            <path d="M 60 105 C 45 105 32 95 35 80" stroke="#f59e0b" strokeWidth="4" />
          </>
        )}

        {mudraName === "Mushti" && (
          <>
            {/* 4 fingers curled into tight fist */}
            <rect x="64" y="65" width="30" height="35" rx="8" fill="rgba(239,68,68,0.2)" stroke="#ef4444" strokeWidth="3" />
            {/* Thumb locked over fingers */}
            <path d="M 58 98 Q 65 75 92 78" stroke="#fef08a" strokeWidth="3.5" />
          </>
        )}

        {mudraName === "Shikhara" && (
          <>
            {/* Fist */}
            <rect x="66" y="70" width="30" height="35" rx="8" fill="rgba(20,184,166,0.2)" stroke="#14b8a6" strokeWidth="3" />
            {/* Thumb pointing straight up */}
            <path d="M 60 95 Q 56 65 56 35 C 56 26, 68 26, 68 35 L 68 70" stroke="#14b8a6" strokeWidth="3.5" fill="rgba(20,184,166,0.15)" />
          </>
        )}
      </g>
    </svg>
  );
}
