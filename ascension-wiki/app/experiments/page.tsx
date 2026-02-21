"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Zap } from "lucide-react";
import { RoleGate } from "@/components/auth/RoleGate";
import { useExperimentStore } from "@/lib/store";

const TOOL_LABELS: Record<string, string> = {
    web_search: "Web Search",
    file_system: "File System",
    python_execution: "Python Executor",
};

export default function ExperimentsPage() {
    const {
        temperature, enabledTools, heuristicToggles, selectedDataset,
        isRunning, progress, results,
        setTemperature, toggleTool, toggleHeuristic, setDataset, runExperiment, setProgress, setResults,
    } = useExperimentStore();

    useEffect(() => {
        if (!isRunning) return;
        let p = 0;
        const interval = setInterval(() => {
            p += Math.random() * 15;
            if (p >= 100) {
                setResults([
                    { category: "math", before: 0.78, after: 0.84 + Math.random() * 0.06 },
                    { category: "logic", before: 0.72, after: 0.79 + Math.random() * 0.08 },
                    { category: "planning", before: 0.65, after: 0.71 + Math.random() * 0.07 },
                    { category: "tool-use", before: 0.81, after: 0.87 + Math.random() * 0.05 },
                ]);
                clearInterval(interval);
            } else {
                setProgress(Math.min(p, 99));
            }
        }, 200);
        return () => clearInterval(interval);
    }, [isRunning]);

    return (
        <RoleGate allowedRole="admin">
            <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <div className="text-xs font-mono text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />Admin Workspace
                    </div>
                    <h1 className="text-4xl font-bold text-white">Experiment Workbench</h1>
                    <p className="text-muted mt-1">Modify cognitive parameters and benchmark against held-out datasets</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Config */}
                    <div className="lg:col-span-1 space-y-5">
                        {/* Temperature */}
                        <div className="glass-card rounded-2xl border border-white/5 p-5">
                            <h2 className="text-xs font-mono text-muted uppercase tracking-widest mb-4">Temperature</h2>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-muted text-xs font-mono">LLM Sampling</span>
                                <span className="text-primary font-mono font-bold">{temperature.toFixed(2)}</span>
                            </div>
                            <input type="range" min={0} max={2} step={0.05} value={temperature}
                                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer" />
                            <div className="flex justify-between text-xs text-muted font-mono mt-1"><span>0.0</span><span>2.0</span></div>
                        </div>

                        {/* Tools */}
                        <div className="glass-card rounded-2xl border border-white/5 p-5">
                            <h2 className="text-xs font-mono text-muted uppercase tracking-widest mb-4">Tool Access</h2>
                            <div className="space-y-3">
                                {Object.entries(enabledTools).map(([tool, enabled]) => (
                                    <div key={tool} className="flex items-center justify-between">
                                        <span className="text-sm text-white font-mono">{TOOL_LABELS[tool]}</span>
                                        <button onClick={() => toggleTool(tool)}
                                            className={`relative w-10 h-5 rounded-full transition-all duration-300 ${enabled ? "bg-primary shadow-[0_0_10px_rgba(0,229,255,0.4)]" : "bg-white/10"}`}>
                                            <motion.div animate={{ x: enabled ? 20 : 2 }} transition={{ type: "spring", stiffness: 400 }}
                                                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Dataset */}
                        <div className="glass-card rounded-2xl border border-white/5 p-5">
                            <h2 className="text-xs font-mono text-muted uppercase tracking-widest mb-4">Benchmark Dataset</h2>
                            <div className="grid grid-cols-2 gap-2">
                                {(["math", "logic", "planning", "tool-use"] as const).map((ds) => (
                                    <button key={ds} onClick={() => setDataset(ds)}
                                        className={`py-2 rounded-lg text-xs font-mono border transition-all ${selectedDataset === ds ? "bg-primary/20 text-primary border-primary/40" : "bg-white/5 text-muted border-white/10 hover:text-white"}`}>
                                        {ds}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Heuristics + Run */}
                    <div className="lg:col-span-2 space-y-5">
                        <div className="glass-card rounded-2xl border border-white/5 p-5">
                            <h2 className="text-xs font-mono text-muted uppercase tracking-widest mb-4">Heuristic Toggles</h2>
                            <div className="space-y-3">
                                {Object.entries(heuristicToggles).map(([rule, enabled]) => (
                                    <div key={rule} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                        <span className="text-sm font-mono text-white/80">{rule}</span>
                                        <button onClick={() => toggleHeuristic(rule)}
                                            className={`relative w-10 h-5 rounded-full transition-all duration-300 ml-4 shrink-0 ${enabled ? "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]" : "bg-white/10"}`}>
                                            <motion.div animate={{ x: enabled ? 20 : 2 }} transition={{ type: "spring", stiffness: 400 }}
                                                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Run */}
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={runExperiment} disabled={isRunning}
                            className="w-full py-3 rounded-xl bg-primary text-background font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-40 transition-all">
                            <Play size={16} />{isRunning ? "Running Experiment…" : "Run Experiment"}
                        </motion.button>

                        {/* Progress */}
                        {isRunning && (
                            <div>
                                <div className="flex justify-between text-xs font-mono text-muted mb-1">
                                    <span>Progress</span><span>{Math.round(progress)}%</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div animate={{ width: `${progress}%` }} className="h-full bg-primary rounded-full" />
                                </div>
                            </div>
                        )}

                        {/* Results */}
                        {results.length > 0 && (
                            <div>
                                <h2 className="text-xs font-mono text-muted uppercase tracking-widest mb-3">Results — Before vs After</h2>
                                <div className="grid grid-cols-2 gap-3">
                                    {results.map((r, i) => (
                                        <motion.div key={r.category} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                                            className="glass-card rounded-xl border border-white/5 p-4">
                                            <div className="text-xs font-mono text-muted uppercase tracking-widest mb-2">{r.category}</div>
                                            <div className="flex items-end gap-3">
                                                <div>
                                                    <div className="text-xs text-muted">Before</div>
                                                    <div className="text-lg font-bold font-mono text-white/50">{(r.before * 100).toFixed(1)}%</div>
                                                </div>
                                                <div className="text-primary">→</div>
                                                <div>
                                                    <div className="text-xs text-muted">After</div>
                                                    <div className="text-lg font-bold font-mono text-green-400">{(r.after * 100).toFixed(1)}%</div>
                                                </div>
                                                <div className="ml-auto text-xs font-mono text-green-400">
                                                    +{((r.after - r.before) * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </RoleGate>
    );
}
