import React, { useState } from "react";
import { CameraFeed } from "../components/CameraFeed";
import { LandmarkOverlay } from "../components/LandmarkOverlay";
import { RecordPanel } from "../components/RecordPanel";
import { FlipHorizontal, Camera, CameraOff, RefreshCw, Layers } from "lucide-react";

export function RecordPage({
  camera,
  handTracking,
  mudrasList = [],
  onCaptureSample,
  stats,
  recentCaptures = []
}) {
  const [selectedMudra, setSelectedMudra] = useState("Pataka");
  const [isMirrored, setIsMirrored] = useState(true);

  const { videoRef, stream, error, isLoading, startCamera, stopCamera } = camera;
  const { handLandmarks, isHandDetected, handedness } = handTracking;

  return (
    <div className="relative w-full min-h-[calc(100vh-5rem)] max-w-7xl mx-auto p-4 pt-20 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Camera View with Skeleton Tracking (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
            <CameraFeed
              videoRef={videoRef}
              stream={stream}
              error={error}
              isLoading={isLoading}
              isMirrored={isMirrored}
              onStartCamera={startCamera}
              onStopCamera={stopCamera}
            >
              <LandmarkOverlay
                landmarks={handLandmarks}
                isMirrored={isMirrored}
                activeColor="#f59e0b"
                confidence={isHandDetected ? 1.0 : 0}
              />

              {/* Top Controls */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
                <span className="glass-pill px-3 py-1 text-[11px] font-semibold text-amber-300 border border-amber-500/30">
                  Recording: {selectedMudra}
                </span>

                <div className="flex items-center space-x-2 pointer-events-auto">
                  <button
                    onClick={() => setIsMirrored((prev) => !prev)}
                    className="w-8 h-8 rounded-full glass-panel-subtle flex items-center justify-center text-slate-300 hover:text-white border border-white/10"
                    title="Mirror feed"
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={stream ? stopCamera : () => startCamera()}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      stream ? "bg-rose-500/20 text-rose-300" : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {stream ? <CameraOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </CameraFeed>
          </div>

          {/* Quick Session Sample Stream */}
          {recentCaptures.length > 0 && (
            <div className="glass-panel p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Recent Captures ({recentCaptures.length})</span>
                </span>
                <span className="text-[10px] text-slate-500">Auto-saved to backend</span>
              </div>
              <div className="flex space-x-2 overflow-x-auto pb-1">
                {recentCaptures.slice(-8).reverse().map((cap, i) => (
                  <div
                    key={cap.id || i}
                    className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-white/5 text-[11px] font-mono text-slate-300 flex items-center space-x-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{cap.mudra}</span>
                    <span className="text-slate-500 text-[10px]">#{cap.id?.slice(-4)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Studio Controls & Mudra Guides (5 cols) */}
        <div className="lg:col-span-5">
          <RecordPanel
            mudrasList={mudrasList}
            selectedMudra={selectedMudra}
            onSelectMudra={setSelectedMudra}
            onCaptureFrame={onCaptureSample}
            isHandDetected={isHandDetected}
            currentLandmarks={handLandmarks}
            handedness={handedness}
            stats={stats}
          />
        </div>
      </div>
    </div>
  );
}
