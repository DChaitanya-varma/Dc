import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Play,
  Square,
  Sparkles,
  CheckCircle,
  Layers,
  ChevronDown,
  Info,
  Flame,
  RotateCcw
} from "lucide-react";
import confetti from "canvas-confetti";

export function RecordPanel({
  mudrasList = [],
  selectedMudra,
  onSelectMudra,
  onCaptureFrame,
  isHandDetected,
  currentLandmarks,
  handedness,
  stats = null
}) {
  const [isBursting, setIsBursting] = useState(false);
  const [burstCount, setBurstCount] = useState(0);
  const [targetBurst, setTargetBurst] = useState(25);
  const [sessionCaptured, setSessionCaptured] = useState(0);
  const burstTimerRef = useRef(null);

  const activeMudraCount = (stats?.counts_by_mudra?.[selectedMudra] || 0) + sessionCaptured;
  const goalCount = stats?.recommended_min_per_class || 30;
  const progressPercent = Math.min(100, Math.round((activeMudraCount / goalCount) * 100));

  // Trigger single capture
  const handleSingleCapture = () => {
    if (!isHandDetected || !currentLandmarks) return;
    onCaptureFrame(selectedMudra, currentLandmarks, handedness);
    setSessionCaptured((prev) => prev + 1);
  };

  // Burst capture logic: interval capture with slight angle adjustments
  const handleToggleBurst = () => {
    if (isBursting) {
      clearInterval(burstTimerRef.current);
      setIsBursting(false);
      return;
    }

    if (!isHandDetected || !currentLandmarks) return;

    setIsBursting(true);
    setBurstCount(0);
    let captured = 0;

    burstTimerRef.current = setInterval(() => {
      if (captured >= targetBurst) {
        clearInterval(burstTimerRef.current);
        setIsBursting(false);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
        return;
      }

      onCaptureFrame(selectedMudra, currentLandmarks, handedness);
      captured += 1;
      setBurstCount(captured);
      setSessionCaptured((prev) => prev + 1);
    }, 160); // 160ms interval allows subtle wrist/tilt variations
  };

  useEffect(() => {
    return () => {
      if (burstTimerRef.current) clearInterval(burstTimerRef.current);
    };
  }, []);

  const activeMudraDetails = mudrasList.find((m) => m.name === selectedMudra);

  return (
    <div className="glass-panel rounded-3xl p-6 border border-amber-500/20 shadow-2xl relative overflow-hidden bg-gradient-to-b from-amber-950/20 via-slate-900/60 to-slate-950/90 text-slate-100">
      {/* Studio Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 glow-gold">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm text-white">Data Collection Studio</h3>
            <p className="text-[11px] text-amber-300/80">Record varied training angles & poses</p>
          </div>
        </div>

        {/* Hand detection status pill */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900/70 border border-white/10 text-[10px]">
          <span
            className={`w-2 h-2 rounded-full ${
              isHandDetected ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
            }`}
          />
          <span className="font-mono text-slate-300">
            {isHandDetected ? `${handedness} Hand Ready` : "No Hand in Frame"}
          </span>
        </div>
      </div>

      {/* Target Mudra Selector */}
      <div className="mb-5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          1. Select Target Mudra to Record
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {mudrasList.map((m) => {
            const isSelected = selectedMudra === m.name;
            const count = (stats?.counts_by_mudra?.[m.name] || 0);

            return (
              <button
                key={m.id}
                onClick={() => {
                  onSelectMudra(m.name);
                  setSessionCaptured(0);
                }}
                className={`relative px-3 py-2.5 rounded-xl text-left border transition-all duration-150 ${
                  isSelected
                    ? "bg-amber-500/20 border-amber-400/60 text-white shadow-lg shadow-amber-500/10"
                    : "bg-slate-900/40 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-semibold text-xs truncate">{m.name}</span>
                  <span className="text-[10px] font-mono text-slate-500">{count}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-serif mt-0.5 truncate">{m.sanskrit}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Mudra Pose Tip */}
      {activeMudraDetails && (
        <div className="mb-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start space-x-3">
          <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-amber-200 block mb-0.5">
              Forming {activeMudraDetails.name}:
            </span>
            <span className="text-slate-300 leading-relaxed">
              {activeMudraDetails.pose_guidance}
            </span>
          </div>
        </div>
      )}

      {/* Goal Progress Bar & Tick Counter */}
      <div className="mb-6 p-4 rounded-2xl bg-slate-900/50 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-300">
            Total Samples for <strong className="text-amber-300">{selectedMudra}</strong>
          </span>
          <div className="flex items-baseline space-x-1">
            {/* Animated Tick Counter */}
            <motion.span
              key={activeMudraCount}
              initial={{ scale: 1.3, color: "#f59e0b" }}
              animate={{ scale: 1, color: "#ffffff" }}
              transition={{ duration: 0.2 }}
              className="text-lg font-mono font-bold"
            >
              {activeMudraCount}
            </motion.span>
            <span className="text-xs font-mono text-slate-500">/ {goalCount} recommended</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400">
          <span>{sessionCaptured > 0 ? `+${sessionCaptured} this session` : "Ready to record"}</span>
          <span>{progressPercent}% towards class balance</span>
        </div>
      </div>

      {/* Capture Actions: Single vs Auto Burst */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Single Snapshot */}
        <button
          onClick={handleSingleCapture}
          disabled={!isHandDetected || isBursting}
          className="flex-1 py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition active:scale-95"
        >
          <Camera className="w-4 h-4 text-cyan-400" />
          <span>Capture Single Frame</span>
        </button>

        {/* Burst Capture */}
        <button
          onClick={handleToggleBurst}
          disabled={!isHandDetected}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition active:scale-95 shadow-xl ${
            isBursting
              ? "bg-rose-600 hover:bg-rose-500 text-white glow-rose animate-pulse"
              : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 glow-gold"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {isBursting ? (
            <>
              <Square className="w-4 h-4 fill-white" />
              <span>Recording Burst ({burstCount}/{targetBurst})...</span>
            </>
          ) : (
            <>
              <Layers className="w-4 h-4 text-slate-950" />
              <span>Auto-Burst (25 Frames)</span>
            </>
          )}
        </button>
      </div>

      <p className="text-[11px] text-slate-400 text-center mt-3 italic">
        💡 Tip: When burst recording, slowly tilt and rotate your wrist so the classifier learns varied angles.
      </p>
    </div>
  );
}
