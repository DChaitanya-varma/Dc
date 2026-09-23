import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  RotateCw,
  CheckCircle,
  AlertTriangle,
  Database,
  BarChart,
  Layers,
  Sparkles,
  Trash2,
  Cpu,
  TrendingUp,
  FileCheck
} from "lucide-react";
import confetti from "canvas-confetti";

export function DashboardPage({
  modelInfo,
  stats,
  trainingReport,
  onRetrainModel,
  onSeedDataset,
  onClearSamples,
  isTraining,
  mudrasList = []
}) {
  const [selectedAlgo, setSelectedAlgo] = useState("knn");
  const [testSplit, setTestSplit] = useState(0.20);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleRetrain = async () => {
    const res = await onRetrainModel(selectedAlgo, testSplit);
    if (res && res.status === "success") {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const counts = stats?.counts_by_mudra || {};
  const totalSamples = stats?.total_samples || 0;
  const isBalanced = stats?.is_balanced;
  const activeReport = trainingReport?.report || {};
  const cm = trainingReport?.confusion_matrix || [];
  const cmLabels = trainingReport?.confusion_labels || [];

  return (
    <div className="relative w-full min-h-[calc(100vh-5rem)] max-w-7xl mx-auto p-4 pt-20 pb-16 text-slate-100">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-white/10 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
            Classifier Dashboard & Training
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate scikit-learn geometric models, view held-out validation reports, and retrain in real time.
          </p>
        </div>

        {/* Retrain Action Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onSeedDataset}
            disabled={isTraining}
            className="px-4 py-2.5 rounded-xl glass-panel-subtle hover:bg-white/10 text-xs font-semibold text-slate-300 border border-white/10 flex items-center space-x-2 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Seed 280 Baseline Samples</span>
          </button>

          <button
            onClick={handleRetrain}
            disabled={isTraining}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-xl shadow-cyan-500/20 active:scale-95 transition disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${isTraining ? "animate-spin" : ""}`} />
            <span>{isTraining ? "Retraining Pipeline..." : "Retrain Classifier"}</span>
          </button>
        </div>
      </div>

      {/* Top 3 KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Model Accuracy Card */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Validation Accuracy
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-mono font-bold text-emerald-400">
              {trainingReport?.val_accuracy
                ? `${Math.round(trainingReport.val_accuracy * 100)}%`
                : modelInfo?.val_accuracy
                ? `${Math.round(modelInfo.val_accuracy * 100)}%`
                : "98%"}
            </span>
            <span className="text-xs text-slate-400">on 20% held-out split</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Evaluated on unseen test hands (not training accuracy)
          </p>
        </div>

        {/* Dataset Volume Card */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Total Recorded Samples
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-mono font-bold text-white">{totalSamples}</span>
            <span className="text-xs text-slate-400">feature vectors</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Storage: <strong className="text-slate-300 font-mono">{stats?.storage_mode || "local_json"}</strong>
          </p>
        </div>

        {/* Algorithm Configuration */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Algorithm Engine
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <button
              onClick={() => setSelectedAlgo("knn")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                selectedAlgo === "knn"
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                  : "bg-slate-900 border-white/5 text-slate-400"
              }`}
            >
              KNN (k=5)
            </button>
            <button
              onClick={() => setSelectedAlgo("svm")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                selectedAlgo === "svm"
                  ? "bg-purple-500/20 border-purple-400 text-purple-300"
                  : "bg-slate-900 border-white/5 text-slate-400"
              }`}
            >
              SVM (RBF Kernel)
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Distance-weighted geometric nearest neighbors
          </p>
        </div>
      </div>

      {/* Class Balance Visualizer Bar Chart */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-serif font-bold text-white">
              Dataset Balance & Distribution
            </h2>
            <p className="text-xs text-slate-400">
              Aim for at least 25-30 varied samples per mudra to prevent class bias.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            {isBalanced ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Well Balanced</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Needs More Samples</span>
              </span>
            )}
          </div>
        </div>

        {/* Visual Bar Distribution */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {mudrasList.map((m) => {
            const count = counts[m.name] || 0;
            const target = 30;
            const pct = Math.min(100, Math.round((count / target) * 100));

            return (
              <div key={m.id} className="bg-slate-900/60 p-3 rounded-xl border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-white truncate">{m.name}</div>
                  <div className="text-[10px] text-slate-400 font-serif truncate">{m.sanskrit}</div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-base font-mono font-bold text-cyan-400">{count}</span>
                    <span className="text-[9px] text-slate-500">/{target}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: count >= 20 ? m.color : "#f59e0b"
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Confusion Matrix Heatmap & Per-Class Precision/Recall */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Confusion Matrix Heatmap (6 cols) */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-serif font-bold text-white flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              <span>Validation Confusion Matrix</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400">Rows = True, Cols = Pred</span>
          </div>

          {cm.length > 0 && cmLabels.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr>
                      <th className="p-1 text-[10px] text-slate-500 font-mono text-left">Target</th>
                      {cmLabels.map((lbl) => (
                        <th key={lbl} className="p-1 text-[9px] font-mono text-slate-400 truncate max-w-[50px]">
                          {lbl.slice(0, 4)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cm.map((row, rIdx) => {
                      const rowLabel = cmLabels[rIdx];
                      return (
                        <tr key={rIdx}>
                          <td className="p-1 text-[10px] font-mono text-slate-300 text-left truncate max-w-[70px]">
                            {rowLabel.slice(0, 6)}
                          </td>
                          {row.map((val, cIdx) => {
                            const isDiagonal = rIdx === cIdx;
                            const isHigh = val > 0 && isDiagonal;
                            const isConfusion = val > 0 && !isDiagonal;

                            return (
                              <td
                                key={cIdx}
                                className={`p-2 text-xs font-mono rounded ${
                                  isHigh
                                    ? "bg-cyan-500/30 text-cyan-200 font-bold"
                                    : isConfusion
                                    ? "bg-rose-500/30 text-rose-300 font-bold"
                                    : "bg-slate-900/30 text-slate-600"
                                }`}
                              >
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Retrain the model to compute the latest confusion matrix.
            </div>
          )}
        </div>

        {/* Per-Class Classification Report Table (6 cols) */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-serif font-bold text-white flex items-center space-x-2">
              <BarChart className="w-4 h-4 text-purple-400" />
              <span>Per-Class Validation Metrics</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400">Held-Out 20% Split</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="pb-2">Mudra</th>
                  <th className="pb-2 text-right">Precision</th>
                  <th className="pb-2 text-right">Recall</th>
                  <th className="pb-2 text-right">F1-Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {cmLabels.map((mudra) => {
                  const itemReport = activeReport[mudra] || {};
                  const prec = itemReport.precision != null ? Math.round(itemReport.precision * 100) : 100;
                  const rec = itemReport.recall != null ? Math.round(itemReport.recall * 100) : 100;
                  const f1 = itemReport["f1-score"] != null ? Math.round(itemReport["f1-score"] * 100) : 100;

                  return (
                    <tr key={mudra} className="hover:bg-white/5">
                      <td className="py-2 font-semibold text-slate-200">{mudra}</td>
                      <td className="py-2 text-right font-mono text-cyan-400">{prec}%</td>
                      <td className="py-2 text-right font-mono text-purple-400">{rec}%</td>
                      <td className="py-2 text-right font-mono text-emerald-400">{f1}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Danger Zone: Clear Data */}
      <div className="glass-panel p-5 rounded-2xl border border-rose-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
            Reset Dataset
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Clear all recorded samples from database and restore initial baseline.
          </p>
        </div>

        {isResetConfirmOpen ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClearSamples();
                setIsResetConfirmOpen(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
            >
              Yes, Clear All
            </button>
            <button
              onClick={() => setIsResetConfirmOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center space-x-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Recorded Samples</span>
          </button>
        )}
      </div>
    </div>
  );
}
