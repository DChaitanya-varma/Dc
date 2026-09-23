import React from "react";
import { motion } from "framer-motion";
import { Eye, Disc, BarChart3, Radio, Database } from "lucide-react";

export function Navbar({ activeTab, onSelectTab, storageMode = "local_json", isModelReady = true }) {
  const tabs = [
    { id: "recognize", label: "Recognize", icon: Eye },
    { id: "record", label: "Studio / Record", icon: Disc },
    { id: "dashboard", label: "Model & Analytics", icon: BarChart3 },
  ];

  return (
    <header className="fixed top-5 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="glass-pill rounded-full p-1.5 flex items-center space-x-1.5 shadow-2xl border border-white/15 pointer-events-auto">
        {/* Brand mark */}
        <div className="flex items-center space-x-2 pl-3 pr-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse glow-cyan" />
          <span className="font-serif font-bold text-xs tracking-wider uppercase text-slate-100 hidden sm:inline">
            Kuchipudi AI
          </span>
        </div>

        <div className="h-4 w-px bg-white/15 mx-1" />

        {/* Tab navigation pills */}
        <nav className="flex items-center space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center space-x-2 transition-all duration-200 ${
                  isActive
                    ? "text-white shadow-lg"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/80 to-blue-600/80 border border-cyan-400/40"
                  />
                )}
                <span className="relative z-10 flex items-center space-x-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="h-4 w-px bg-white/15 mx-1 hidden md:block" />

        {/* Storage / Model health indicator */}
        <div className="hidden md:flex items-center space-x-2 px-2 text-[10px] text-slate-400">
          <span className={`inline-block w-2 h-2 rounded-full ${isModelReady ? "bg-emerald-400" : "bg-amber-400"}`} />
          <span className="uppercase tracking-wider font-mono">
            {storageMode === "mongodb" ? "MongoDB" : "Local Sync"}
          </span>
        </div>
      </div>
    </header>
  );
}
