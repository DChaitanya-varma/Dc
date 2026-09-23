import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Navbar } from "./components/Navbar";
import { RecognizePage } from "./pages/RecognizePage";
import { RecordPage } from "./pages/RecordPage";
import { DashboardPage } from "./pages/DashboardPage";
import { useCamera } from "./hooks/useCamera";
import { useHandTracking } from "./hooks/useHandTracking";
import { extractHandFeatures } from "./utils/featureExtractor";

const API_BASE = "http://localhost:8000/api/v1";

export function App() {
  const [activeTab, setActiveTab] = useState("recognize");
  const [mudrasList, setMudrasList] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [stats, setStats] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [trainingReport, setTrainingReport] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [recentCaptures, setRecentCaptures] = useState([]);
  const [isBackendHealthy, setIsBackendHealthy] = useState(false);

  // Initialize camera and lifecycle
  const camera = useCamera();

  // Throttled prediction loop callback (called at ~10-12 Hz from HandTracking hook)
  const isPredictingRef = useRef(false);

  const handleThrottledFeatures = useCallback(
    async (landmarks, handedness) => {
      // Only predict if in recognize tab and not already awaiting response
      if (activeTab !== "recognize" || isPredictingRef.current) return;

      try {
        isPredictingRef.current = true;
        // Compute 33 invariant geometric features client-side
        const features = extractHandFeatures(landmarks, handedness);

        const response = await axios.post(`${API_BASE}/predict`, {
          features,
          handedness
        });

        if (response.data) {
          setPrediction(response.data);
        }
      } catch (err) {
        // Silently catch network drops during video streaming
        // console.warn("Prediction frame dropped:", err.message);
      } finally {
        isPredictingRef.current = false;
      }
    },
    [activeTab]
  );

  // Hand tracking with MediaPipe
  const handTracking = useHandTracking(camera.videoRef, handleThrottledFeatures, 90);

  // Reset prediction when hand leaves frame
  useEffect(() => {
    if (!handTracking.isHandDetected) {
      setPrediction(null);
    }
  }, [handTracking.isHandDetected]);

  // Fetch initial mudra catalog, stats, and model info
  const fetchInitialData = useCallback(async () => {
    try {
      const [mudrasRes, statsRes, modelRes] = await Promise.all([
        axios.get(`${API_BASE}/mudras`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/samples/stats`).catch(() => ({ data: null })),
        axios.get(`${API_BASE}/train/info`).catch(() => ({ data: null }))
      ]);

      if (mudrasRes.data && mudrasRes.data.length > 0) {
        setMudrasList(mudrasRes.data);
        setIsBackendHealthy(true);
      }
      if (statsRes.data) setStats(statsRes.data);
      if (modelRes.data) setModelInfo(modelRes.data);
    } catch (e) {
      console.warn("Backend not yet connected:", e);
      setIsBackendHealthy(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(fetchInitialData, 8000);
    return () => clearInterval(interval);
  }, [fetchInitialData]);

  // Save labeled sample from Record Studio
  const handleCaptureSample = async (mudra, landmarks, handedness) => {
    try {
      const features = extractHandFeatures(landmarks, handedness);
      const res = await axios.post(`${API_BASE}/samples`, {
        mudra,
        features,
        landmarks: landmarks.map((lm) => ({ x: lm.x, y: lm.y, z: lm.z || 0 })),
        handedness
      });

      if (res.data) {
        setRecentCaptures((prev) => [...prev.slice(-20), res.data]);
        // Refresh stats
        const statsRes = await axios.get(`${API_BASE}/samples/stats`);
        if (statsRes.data) setStats(statsRes.data);
      }
    } catch (e) {
      console.error("Failed to save sample:", e);
    }
  };

  // Retrain model
  const handleRetrainModel = async (algorithm = "knn", test_size = 0.20) => {
    setIsTraining(true);
    try {
      const res = await axios.post(`${API_BASE}/train`, {
        algorithm,
        test_size
      });
      if (res.data) {
        setTrainingReport(res.data);
        const infoRes = await axios.get(`${API_BASE}/train/info`);
        if (infoRes.data) setModelInfo(infoRes.data);
        return res.data;
      }
    } catch (e) {
      console.error("Training failed:", e);
      alert("Retraining failed: " + (e.response?.data?.detail || e.message));
    } finally {
      setIsTraining(false);
    }
  };

  // Seed dataset with canonical samples
  const handleSeedDataset = async () => {
    setIsTraining(true);
    try {
      await axios.post(`${API_BASE}/samples/seed?samples_per_mudra=35`);
      await handleRetrainModel();
      const statsRes = await axios.get(`${API_BASE}/samples/stats`);
      if (statsRes.data) setStats(statsRes.data);
    } catch (e) {
      console.error("Seeding failed:", e);
    } finally {
      setIsTraining(false);
    }
  };

  // Clear samples
  const handleClearSamples = async () => {
    try {
      await axios.delete(`${API_BASE}/samples`);
      setRecentCaptures([]);
      const statsRes = await axios.get(`${API_BASE}/samples/stats`);
      if (statsRes.data) setStats(statsRes.data);
    } catch (e) {
      console.error("Clear failed:", e);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#060913] text-slate-100 overflow-x-hidden">
      {/* Ambient Moving Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-600/10 blur-[120px] animate-orb-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[420px] h-[420px] rounded-full bg-violet-600/10 blur-[140px] animate-orb-reverse" />
        <div className="absolute top-1/2 left-2/3 w-80 h-80 rounded-full bg-amber-500/10 blur-[100px] animate-pulse-subtle" />
      </div>

      {/* Floating Pill Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        storageMode={stats?.storage_mode || "local_json"}
        isModelReady={modelInfo?.is_trained ?? true}
      />

      {/* Main Views */}
      <main className="relative z-10">
        {activeTab === "recognize" && (
          <RecognizePage
            camera={camera}
            handTracking={handTracking}
            prediction={prediction}
            mudrasList={mudrasList}
          />
        )}

        {activeTab === "record" && (
          <RecordPage
            camera={camera}
            handTracking={handTracking}
            mudrasList={mudrasList}
            onCaptureSample={handleCaptureSample}
            stats={stats}
            recentCaptures={recentCaptures}
          />
        )}

        {activeTab === "dashboard" && (
          <DashboardPage
            modelInfo={modelInfo}
            stats={stats}
            trainingReport={trainingReport}
            onRetrainModel={handleRetrainModel}
            onSeedDataset={handleSeedDataset}
            onClearSamples={handleClearSamples}
            isTraining={isTraining}
            mudrasList={mudrasList}
          />
        )}
      </main>
    </div>
  );
}

export default App;
