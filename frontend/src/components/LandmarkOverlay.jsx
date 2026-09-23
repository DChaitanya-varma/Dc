import React, { useRef, useEffect } from "react";

// MediaPipe 21 Hand Landmark Bones
const CONNECTIONS = [
  // Palm base
  [0, 1], [0, 5], [5, 9], [9, 13], [13, 17], [0, 17],
  // Thumb
  [1, 2], [2, 3], [3, 4],
  // Index
  [5, 6], [6, 7], [7, 8],
  // Middle
  [9, 10], [10, 11], [11, 12],
  // Ring
  [13, 14], [14, 15], [15, 16],
  // Pinky
  [17, 18], [18, 19], [19, 20]
];

// Color mapping per finger group
const FINGER_COLORS = {
  wrist: { core: "#fef08a", glow: "rgba(234, 179, 8, 0.7)", line: "rgba(234, 179, 8, 0.45)" },
  thumb: { core: "#a5f3fc", glow: "rgba(6, 182, 212, 0.8)", line: "rgba(6, 182, 212, 0.55)" },
  index: { core: "#a7f3d0", glow: "rgba(16, 185, 129, 0.8)", line: "rgba(16, 185, 129, 0.55)" },
  middle: { core: "#ddd6fe", glow: "rgba(139, 92, 246, 0.8)", line: "rgba(139, 92, 246, 0.55)" },
  ring: { core: "#fbcfe8", glow: "rgba(236, 72, 153, 0.8)", line: "rgba(236, 72, 153, 0.55)" },
  pinky: { core: "#fed7aa", glow: "rgba(249, 115, 22, 0.8)", line: "rgba(249, 115, 22, 0.55)" }
};

function getLandmarkColor(index) {
  if (index === 0) return FINGER_COLORS.wrist;
  if (index >= 1 && index <= 4) return FINGER_COLORS.thumb;
  if (index >= 5 && index <= 8) return FINGER_COLORS.index;
  if (index >= 9 && index <= 12) return FINGER_COLORS.middle;
  if (index >= 13 && index <= 16) return FINGER_COLORS.ring;
  return FINGER_COLORS.pinky;
}

export function LandmarkOverlay({
  landmarks,
  videoWidth,
  videoHeight,
  isMirrored = true,
  activeColor = "#38bdf8",
  confidence = 0
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    if (!landmarks || landmarks.length !== 21) {
      ctx.restore();
      return;
    }

    // Coordinate conversion with mirror adjustment
    const toCanvasCoords = (lm) => {
      const rawX = isMirrored ? 1.0 - lm.x : lm.x;
      return {
        x: rawX * width,
        y: lm.y * height,
        z: lm.z || 0
      };
    };

    const pts = landmarks.map(toCanvasCoords);

    // 1. Draw glowing bones
    for (const [startIdx, endIdx] of CONNECTIONS) {
      const p1 = pts[startIdx];
      const p2 = pts[endIdx];
      const colorDef = getLandmarkColor(endIdx);

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineWidth = 3.0;
      ctx.strokeStyle = colorDef.line;
      ctx.shadowColor = colorDef.glow;
      ctx.shadowBlur = 10;
      ctx.lineCap = "round";
      ctx.stroke();

      // Inner crisp bone highlight
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.shadowBlur = 0;
      ctx.stroke();
    }

    // 2. Draw glowing joint halos and cores
    pts.forEach((pt, idx) => {
      const colorDef = getLandmarkColor(idx);
      const isTip = [4, 8, 12, 16, 20].includes(idx);
      const radius = isTip ? 6.5 : (idx === 0 ? 7.0 : 4.5);

      // Outer soft glowing aura
      const grad = ctx.createRadialGradient(pt.x, pt.y, 1, pt.x, pt.y, radius * 2.8);
      grad.addColorStop(0, colorDef.glow);
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius * 2.8, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Solid colored joint ring
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = colorDef.glow;
      ctx.fill();

      // Bright inner core dot
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    });

    ctx.restore();
  }, [landmarks, videoWidth, videoHeight, isMirrored, activeColor, confidence]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
}
