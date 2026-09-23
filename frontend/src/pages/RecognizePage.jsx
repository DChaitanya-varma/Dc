import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CameraOff, FlipHorizontal, Sparkles, BookOpen, Volume2, ShieldCheck } from "lucide-react";
import { CameraFeed } from "../components/CameraFeed";
import { LandmarkOverlay } from "../components/LandmarkOverlay";
import { ConfidenceRing } from "../components/ConfidenceRing";
import { MudraCard } from "../components/MudraCard";

export function RecognizePage({
  camera,
  handTracking,
  prediction,
  mudrasList = []
}) {
  const [isMirrored, setIsMirrored] = useState(true);
  const [showReferenceCard, setShowReferenceCard] = useState(true);

  const { videoRef, stream, error, isLoading, startCamera, stopCamera } = camera;
  const { handLandmarks, isHandDetected, handedness } = handTracking;

  // Active prediction details
  const isConfident = prediction && prediction.is_valid && prediction.confidence >= 0.55;
  const currentMudraName = isConfident ? prediction.mudra : null;
  const currentMudraData = mudrasList.find((m) => m.name === currentMudraName) || (isConfident ? prediction : null);

  return (
    <div className="relative w-full h-[calc(100vh-5rem)] max-w-7xl mx-auto flex flex-col md:flex-row gap-6 items-center justify-center p-4 pt-16">
      {/* Hero Video Feed Section */}
      <div className="relative flex-1 w-full h-full flex flex-col items-center justify-center">
        <CameraFeed
          videoRef={videoRef}
          stream={stream}
          error={error}
          isLoading={isLoading}
          isMirrored={isMirrored}
          onStartCamera={startCamera}
          onStopCamera={stopCamera}
        >
          {/* Skeleton Landmarks Canvas */}
          <LandmarkOverlay
            landmarks={handLandmarks}
            isMirrored={isMirrored}
            activeColor={currentMudraData?.color || "#38bdf8"}
            confidence={prediction?.confidence || 0}
          />

          {/* Micro-interaction Hand HUD Progress Ring */}
          <ConfidenceRing
            landmarks={handLandmarks}
            confidence={prediction?.confidence || 0}
            isValid={isConfident}
            color={currentMudraData?.color || "#38bdf8"}
            isMirrored={isMirrored}
          />

          {/* Top Floating HUD: Controls & Hand Status */}
          <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-20 pointer-events-none">
            {/* Status Pill */}
            <div className="glass-panel-subtle px-3 py-1.5 rounded-full flex items-center space-x-2 text-xs border border-white/10 pointer-events-auto">
              <span
                className={`w-2 h-2 rounded-full ${
                  isHandDetected ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                }`}
              />
              <span className="text-slate-300 font-mono text-[11px]">
                {isHandDetected ? `${handedness} Hand Tracked` : "Waiting for Hand"}
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center space-x-2 pointer-events-auto">
              {/* Mirror toggle */}
              <button
                onClick={() => setIsMirrored((prev) => !prev)}
                title="Toggle Mirror Feed"
                className="w-9 h-9 rounded-full glass-panel-subtle flex items-center justify-center text-slate-300 hover:text-white border border-white/10 hover:border-white/30 transition shadow-lg"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>

              {/* Reference Card Toggle */}
              <button
                onClick={() => setShowReferenceCard((prev) => !prev)}
                title="Toggle Reference Mudra Card"
                className={`w-9 h-9 rounded-full glass-panel-subtle flex items-center justify-center transition shadow-lg border ${
                  showReferenceCard
                    ? "text-cyan-400 border-cyan-500/40 bg-cyan-500/10"
                    : "text-slate-300 border-white/10 hover:text-white"
                }`}
              >
                <BookOpen className="w-4 h-4" />
              </button>

              {/* Camera Power Toggle */}
              <button
                onClick={stream ? stopCamera : () => startCamera()}
                title={stream ? "Stop Camera" : "Start Camera"}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition shadow-lg ${
                  stream
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
                    : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30"
                }`}
              >
                {stream ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Bottom Floating Typography HUD: Large Serif Mudra Recognition */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col items-center justify-center text-center z-20 pointer-events-none">
            <AnimatePresence mode="wait">
              {isConfident && currentMudraName ? (
                <motion.div
                  key={currentMudraName}
                  initial={{ opacity: 0, y: 25, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="pointer-events-auto glass-panel px-8 py-4 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-2xl relative overflow-hidden"
                >
                  {/* Subtle top glow line matching mudra color */}
                  <div
                    className="absolute top-0 left-1/4 right-1/4 h-0.5 rounded-full"
                    style={{
                      background: currentMudraData?.color || "#38bdf8",
                      boxShadow: `0 0 12px ${currentMudraData?.color || "#38bdf8"}`
                    }}
                  />

                  {/* Sanskrit script calligraphic heading */}
                  <div className="text-sm font-serif font-semibold tracking-wider text-slate-400 mb-0.5">
                    {currentMudraData?.sanskrit || "मुद्रा"}
                  </div>

                  {/* Main Display Typography (Cinzel Serif) */}
                  <h1 className="text-4xl md:text-5xl font-serif font-black tracking-wider text-white uppercase text-glow">
                    {currentMudraName}
                  </h1>

                  {/* Meaning & Confidence badge */}
                  <div className="flex items-center justify-center space-x-3 mt-1.5">
                    <span className="text-xs text-slate-300 font-medium italic">
                      "{currentMudraData?.meaning || "Kuchipudi Mudra"}"
                    </span>
                    <span className="h-3 w-px bg-white/20" />
                    <span
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${currentMudraData?.color || "#38bdf8"}22`,
                        color: currentMudraData?.color || "#38bdf8"
                      }}
                    >
                      {Math.round((prediction?.confidence || 0) * 100)}% Locked
                    </span>
                  </div>
                </motion.div>
              ) : isHandDetected ? (
                <motion.div
                  key="seeking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-panel-subtle px-5 py-2.5 rounded-full border border-white/10 text-xs text-slate-400 flex items-center space-x-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span>Forming mudra... Hold steady for lock</span>
                </motion.div>
              ) : (
                <motion.div
                  key="no-hand"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-panel-subtle px-5 py-2 rounded-full border border-white/10 text-xs text-slate-400"
                >
                  Show your hand to the camera to begin
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CameraFeed>
      </div>

      {/* Sliding Mudra Reference Card */}
      {showReferenceCard && currentMudraData && (
        <div className="fixed md:static right-6 top-24 bottom-10 z-30 flex items-center">
          <MudraCard
            mudraData={currentMudraData}
            confidence={prediction?.confidence || 0}
            isOpen={showReferenceCard}
            onClose={() => setShowReferenceCard(false)}
          />
        </div>
      )}
    </div>
  );
}
