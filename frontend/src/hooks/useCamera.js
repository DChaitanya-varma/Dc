import { useState, useEffect, useRef, useCallback } from "react";

export function useCamera() {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Stop and release all active media tracks
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn("Error stopping camera track:", e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
  }, []);

  // Enumerate video devices
  const updateDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = allDevices.filter((d) => d.kind === "videoinput");
      setDevices(videoInputs);
      if (videoInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoInputs[0].deviceId);
      }
    } catch (e) {
      console.warn("Could not enumerate video devices:", e);
    }
  }, [selectedDeviceId]);

  // Start camera stream
  const startCamera = useCallback(async (deviceId = null) => {
    setIsLoading(true);
    setError(null);
    stopCamera();

    const targetDevice = deviceId || selectedDeviceId;
    const constraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user",
        ...(targetDevice ? { deviceId: { exact: targetDevice } } : {})
      },
      audio: false
    };

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch((err) => {
          console.warn("Autoplay was prevented or delayed:", err);
        });
      }

      await updateDevices();
    } catch (err) {
      console.error("Camera access error:", err);
      let message = "Unable to access webcam.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        message = "Camera permission was denied. Please allow camera access in your browser settings.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        message = "No webcam detected on your device.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        message = "Webcam is already in use by another application.";
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDeviceId, stopCamera, updateDevices]);

  // Clean cleanup on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    stream,
    error,
    isLoading,
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    startCamera,
    stopCamera
  };
}
