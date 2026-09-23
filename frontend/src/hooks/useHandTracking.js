import { useState, useEffect, useRef, useCallback } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

const WASM_PATH = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export function useHandTracking(videoRef, onThrottledFeatures = null, throttleMs = 90) {
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState(null);
  const [handLandmarks, setHandLandmarks] = useState(null);
  const [handedness, setHandedness] = useState("Right");
  const [isHandDetected, setIsHandDetected] = useState(false);

  const landmarkerRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const lastInferenceTimeRef = useRef(0);
  const onThrottledFeaturesRef = useRef(onThrottledFeatures);

  useEffect(() => {
    onThrottledFeaturesRef.current = onThrottledFeatures;
  }, [onThrottledFeatures]);

  // Initialize MediaPipe HandLandmarker
  useEffect(() => {
    let isCancelled = false;

    async function initMediaPipe() {
      setIsModelLoading(true);
      setModelError(null);
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
        if (isCancelled) return;

        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        if (isCancelled) {
          landmarker.close();
          return;
        }

        landmarkerRef.current = landmarker;
        setIsModelLoading(false);
      } catch (err) {
        console.error("Failed to initialize MediaPipe HandLandmarker:", err);
        if (!isCancelled) {
          setModelError("Failed to initialize hand tracker. Please check network connection.");
          setIsModelLoading(false);
        }
      }
    }

    initMediaPipe();

    return () => {
      isCancelled = true;
      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch (e) {
          console.warn("Error closing landmarker:", e);
        }
        landmarkerRef.current = null;
      }
    };
  }, []);

  // Frame processing loop
  const processVideoFrame = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;

    if (
      video &&
      video.readyState >= 2 &&
      video.currentTime > 0 &&
      !video.paused &&
      !video.ended &&
      landmarker
    ) {
      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        const now = performance.now();

        try {
          const results = landmarker.detectForVideo(video, now);

          if (results && results.landmarks && results.landmarks.length > 0) {
            const rawLms = results.landmarks[0];
            setHandLandmarks(rawLms);
            setIsHandDetected(true);

            let detectedHandedness = "Right";
            if (results.handedness && results.handedness.length > 0) {
              detectedHandedness = results.handedness[0][0]?.categoryName || "Right";
            }
            setHandedness(detectedHandedness);

            // Throttled inference callback (~10-12 predictions/sec to avoid UI & network lag)
            if (
              onThrottledFeaturesRef.current &&
              now - lastInferenceTimeRef.current >= throttleMs
            ) {
              lastInferenceTimeRef.current = now;
              onThrottledFeaturesRef.current(rawLms, detectedHandedness);
            }
          } else {
            setHandLandmarks(null);
            setIsHandDetected(false);
          }
        } catch (err) {
          console.warn("HandLandmarker detection error:", err);
        }
      }
    }

    animationFrameIdRef.current = requestAnimationFrame(processVideoFrame);
  }, [videoRef, throttleMs]);

  // Start/Stop RAF tracking loop
  useEffect(() => {
    animationFrameIdRef.current = requestAnimationFrame(processVideoFrame);
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [processVideoFrame]);

  return {
    isModelLoading,
    modelError,
    handLandmarks,
    handedness,
    isHandDetected
  };
}
