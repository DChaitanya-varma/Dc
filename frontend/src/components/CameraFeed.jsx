import React from "react";
import { Camera, CameraOff, AlertCircle, RefreshCw } from "lucide-react";

export function CameraFeed({
  videoRef,
  stream,
  error,
  isLoading,
  isMirrored = true,
  onStartCamera,
  onStopCamera,
  children
}) {
  return (
    <div className="relative w-full h-full min-h-[460px] md:min-h-[580px] rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl flex items-center justify-center bg-black/40">
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transition-transform duration-300 ${
          isMirrored ? "-scale-x-100" : ""
        } ${!stream ? "hidden" : "block"}`}
      />

      {/* Cinematic dark corner vignettes */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#060913]/90 via-transparent to-[#060913]/50" />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />

      {/* Children overlays (Landmarks, ConfidenceRing, HUD badges) */}
      {stream && children}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md z-30">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-xs font-medium text-slate-300 tracking-wide">
            Initializing camera stream...
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/90 backdrop-blur-md z-30">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 glow-rose">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-base font-serif font-bold text-white mb-2">Webcam Unavailable</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-5 leading-relaxed">{error}</p>
          <button
            onClick={() => onStartCamera()}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold flex items-center space-x-2 transition shadow-lg shadow-cyan-500/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Camera Access</span>
          </button>
        </div>
      )}

      {/* Empty / Inactive stream placeholder */}
      {!stream && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center p-8 text-center z-20">
          <div className="w-16 h-16 rounded-3xl bg-slate-900/80 border border-white/10 flex items-center justify-center text-cyan-400 mb-4 shadow-xl">
            <Camera className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-serif font-semibold text-white mb-2">
            Start Live Vision
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mb-5 leading-relaxed">
            Allow camera access to enable real-time Kuchipudi hand landmark tracking and recognition.
          </p>
          <button
            onClick={() => onStartCamera()}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 text-xs font-bold tracking-wide uppercase shadow-lg shadow-cyan-500/25 transition duration-200"
          >
            Turn On Camera
          </button>
        </div>
      )}
    </div>
  );
}
