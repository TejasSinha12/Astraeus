"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Send, Zap, Brain, Loader2, Code, Download, History, Pin, Maximize2, Layers, AlertTriangle } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

// Custom Components
import { TelemetryMeters } from "@/components/coding/TelemetryMeters";
import { TraceSidebar } from "@/components/coding/TraceSidebar";
import { MissionDAG } from "@/components/coding/MissionDAG";

interface TraceStep {
    status: string;
    message: string;
    timestamp: string;
}

export default function ProfessionalWorkspace() {
    const { user } = useUser();

    // Core Mission State
    const [objective, setObjective] = useState("");
    const [isExecuting, setIsExecuting] = useState(false);
    const [userStatus, setUserStatus] = useState({ balance: 0, plan: "PRO", credits: 1000 });

    // Telemetry & Logs
    const [logs, setLogs] = useState<string[]>([]);
    const [traceSteps, setTraceSteps] = useState<TraceStep[]>([]);
    const [metrics, setMetrics] = useState({ tokens: 0, latency: 0, confidence: 0, cost: 0 });

    // Results
    const [codeResult, setCodeResult] = useState<string | null>(null);
    const [storagePath, setStoragePath] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"code" | "preview" | "dag">("code");

    // UI Local State
    const [estimate, setEstimate] = useState<number | null>(null);
    const [isModelFallback, setIsModelFallback] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const logEndRef = useRef<HTMLDivElement>(null);
    const API_BASE_URL = process.env.NEXT_PUBLIC_PLATFORM_API_URL || "http://localhost:8000";

    // ─── Key Commands ──────────────────────────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                if (objective && !isExecuting) handleExecute();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [objective, isExecuting]);

    // ─── Status & Estimates ──────────────────────────────────────────────────
    const fetchUserStatus = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/user/status`, {
                headers: { "x-clerk-user-id": user?.id || "" }
            });
            const data = await res.json();
            setUserStatus({ balance: data.balance, plan: data.plan_type || "PRO", credits: data.balance });
        } catch (e) {
            console.error("Status check failed", e);
        }
    }, [user, API_BASE_URL]);

    useEffect(() => {
        if (user) fetchUserStatus();
    }, [user, fetchUserStatus]);

    const fetchEstimate = async (val: string) => {
        if (!val || val.length < 10) {
            setEstimate(null);
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/estimate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ objective: val })
            });
            const data = await res.json();
            setEstimate(data.estimated_tokens);
        } catch (e) {
            setEstimate(null);
        }
    };

    // ─── Execution Logic ─────────────────────────────────────────────────────
    const handleExecute = async () => {
        if (!objective || isExecuting) return;

        setIsExecuting(true);
        setCodeResult(null);
        setTraceSteps([]);
        setMetrics({ tokens: 0, latency: 0, confidence: 0, cost: 0 });
        setLogs(["[SYSTEM] Connection initialized.", "[SYSTEM] Token allocation secured."]);
        setIsModelFallback(false);

        const startTime = Date.now();

        try {
            const response = await fetch(`${API_BASE_URL}/execute/stream`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-clerk-user-id": user?.id || "",
                    "x-clerk-user-role": (user?.publicMetadata?.role as string) || "PUBLIC"
                },
                body: JSON.stringify({ objective })
            });

            if (!response.ok) throw new Error("Stream connection failed.");

            const reader = response.body?.getReader();
            if (!reader) return;

            const decoder = new TextDecoder();
            let buffer = "";

            while (reader) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (!line.trim().startsWith("data: ")) continue;

                    const rawData = line.replace("data: ", "");
                    try {
                        const data = JSON.parse(rawData);

                        // Update Logs and Traces
                        if (data.status === "RESULT") {
                            setCodeResult(data.message);
                            setLogs(prev => [...prev, "[SUCCESS] Tactical solution generated."]);
                            setMetrics(prev => ({ ...prev, confidence: 0.98, latency: Date.now() - startTime }));
                        } else if (data.status === "COMPLETED") {
                            setLogs(prev => [...prev, `[${data.status}] Mission Absolute.`]);
                            if (data.storage_path) setStoragePath(data.storage_path);
                        } else {
                            setLogs(prev => [...prev, `[${data.status}] ${data.message}`]);
                            setTraceSteps(prev => [...prev, {
                                status: data.status,
                                message: data.message,
                                timestamp: new Date().toLocaleTimeString()
                            }]);

                            // Mock Telemetry Update (Normally from backend)
                            setMetrics(prev => ({
                                ...prev,
                                tokens: prev.tokens + Math.floor(Math.random() * 50),
                                latency: Date.now() - startTime,
                                confidence: 0.85 + (Math.random() * 0.1)
                            }));
                        }
                    } catch (e) {
                        console.error("Buffer parse error", e);
                    }
                }
            }
        } catch (e) {
            setLogs(prev => [...prev, `[ERROR] ${e instanceof Error ? e.message : "Service Unstable"}`]);
            setIsModelFallback(true);
        } finally {
            setIsExecuting(false);
            fetchUserStatus();
        }
    };

    const handleExport = (format: "json" | "md" | "zip") => {
        if (!codeResult) return;
        // Logic for export
        alert(`Exporting as ${format.toUpperCase()}...`);
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/30">
            {/* Main Editor Section */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-white/5">

                {/* Workspace Header */}
                <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Layers className="text-primary w-4 h-4" />
                            <h1 className="text-xs font-bold text-white uppercase tracking-widest">Astraeus <span className="text-muted/40 font-light">Workspace</span></h1>
                        </div>
                        <div className="h-4 w-[1px] bg-white/10" />
                        <div className="flex items-center gap-2 text-[10px] text-muted font-mono uppercase tracking-tighter">
                            Objective: <span className="text-white/60 truncate max-w-[200px]">{objective || "Idle"}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                            <Zap size={10} className="text-primary" />
                            <span className="text-[10px] font-bold text-white font-mono">{userStatus.credits.toLocaleString()} ⏣</span>
                        </div>
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className={cn("p-2 rounded-lg transition-colors hover:bg-white/5", showHistory ? "text-primary bg-primary/10" : "text-muted")}
                        >
                            <History size={16} />
                        </button>
                    </div>
                </header>

                {/* Sub-Header: Mission Controls */}
                <div className="p-4 flex flex-col gap-4 bg-black/20">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-mono text-muted uppercase tracking-[0.3em]">Command Objective</span>
                            <span className="text-white text-xs font-bold">Declare mission goals for swarm orchestration.</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleExecute}
                                disabled={!objective || isExecuting || (estimate !== null && userStatus.credits < estimate)}
                                className={cn(
                                    "px-6 py-2 rounded-lg font-bold flex items-center gap-3 transition-all active:scale-95",
                                    !objective || isExecuting || (estimate !== null && userStatus.credits < estimate)
                                        ? "bg-white/5 text-muted cursor-not-allowed border border-white/5 opacity-50"
                                        : "bg-primary text-background hover:bg-white hover:text-primary box-glow"
                                )}
                            >
                                {isExecuting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                                <span className="uppercase tracking-widest text-[10px]">
                                    {isExecuting ? "Executing..." : "Deploy Swarm"}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="relative group">
                        <textarea
                            value={objective}
                            onChange={(e) => {
                                setObjective(e.target.value);
                                fetchEstimate(e.target.value);
                            }}
                            placeholder="e.g. Implement a high-performance RBAC middleware for Express..."
                            className="w-full bg-black/60 border border-white/5 rounded-xl p-4 h-32 focus:outline-none focus:border-primary/40 transition-all text-sm font-mono text-white placeholder:text-muted/20 resize-none leading-relaxed"
                            disabled={isExecuting}
                        />
                        {estimate && (
                            <div className="absolute bottom-3 right-3 px-2 py-1 bg-primary/10 border border-primary/20 rounded text-[9px] font-mono text-primary flex items-center gap-1">
                                <Zap size={8} /> Est: {estimate} ⏣
                            </div>
                        )}
                    </div>

                    {/* Telemetry Bar */}
                    <TelemetryMeters
                        tokens={metrics.tokens}
                        latency={metrics.latency}
                        confidence={metrics.confidence}
                        cost={metrics.cost + (estimate || 0)}
                        isExecuting={isExecuting}
                    />
                </div>

                {/* Output Viewport */}
                <div className="flex-1 flex flex-col p-4 bg-background relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/5 rounded-lg">
                            <ViewBtn label="Code" active={viewMode === "code"} onClick={() => setViewMode("code")} />
                            <ViewBtn label="Preview" active={viewMode === "preview"} onClick={() => setViewMode("preview")} />
                            <ViewBtn label="Swarm DAG" active={viewMode === "dag"} onClick={() => setViewMode("dag")} />
                        </div>

                        <div className="flex items-center gap-2">
                            {isModelFallback && (
                                <div className="flex items-center gap-2 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded text-[9px] text-yellow-500 font-mono uppercase">
                                    <AlertTriangle size={10} /> Fallback Active
                                </div>
                            )}
                            <div className="flex gap-1">
                                <ExportBtn icon={<Download size={12} />} onClick={() => handleExport("zip")} title="ZIP Archive" />
                                <ExportBtn icon={<History size={12} />} onClick={() => handleExport("json")} title="JSON Trace" />
                                <ExportBtn icon={<Maximize2 size={12} />} onClick={() => { }} title="Fullscreen" />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 border border-white/5 rounded-xl bg-black/40 overflow-hidden relative">
                        <AnimatePresence mode="wait">
                            {viewMode === "code" && (
                                <motion.div
                                    key="code"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="h-full overflow-auto p-6 font-mono text-xs text-white/80 leading-relaxed selection:bg-primary/20"
                                >
                                    {codeResult ? (
                                        <pre><code>{codeResult}</code></pre>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center opacity-10">
                                            <Terminal size={48} className="mb-4" />
                                            <span className="text-[10px] uppercase tracking-[0.3em]">Awaiting Code Matrix...</span>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {viewMode === "preview" && (
                                <motion.div
                                    key="preview"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="h-full w-full bg-white"
                                >
                                    {codeResult ? (
                                        <iframe
                                            title="Mission Preview"
                                            srcDoc={codeResult.includes("<!DOCTYPE html>") ? codeResult : `<html><body style="background:#0a0a0a;color:white;font-family:sans-serif;padding:40px;"><h3>Tactical Execution Preview</h3><hr style="border:1px solid #333;margin:20px 0;"><pre style="background:#222;padding:20px;border-radius:10px;">${codeResult}</pre></body></html>`}
                                            className="w-full h-full border-none"
                                        />
                                    ) : (
                                        <div className="h-full bg-background flex flex-col items-center justify-center opacity-10">
                                            <Brain size={48} className="mb-4" />
                                            <span className="text-[10px] uppercase tracking-[0.3em]">Visualizer Offline...</span>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {viewMode === "dag" && (
                                <motion.div
                                    key="dag"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="h-full"
                                >
                                    <MissionDAG steps={traceSteps} isExecuting={isExecuting} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {storagePath && (
                        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Terminal size={14} className="text-primary" />
                                <span className="text-[10px] font-mono text-muted uppercase tracking-[0.2em]">Mission Artifact Path:</span>
                                <code className="text-[10px] text-white/80 font-mono">{storagePath}</code>
                            </div>
                            <button className="text-[9px] font-bold text-primary hover:underline uppercase tracking-widest">Download Bundle</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Trace Sidebar */}
            <aside className="w-80 lg:w-96 hidden md:block">
                <TraceSidebar logs={logs} steps={traceSteps} isExecuting={isExecuting} />
            </aside>
        </div>
    );
}

function ViewBtn({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-4 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all",
                active ? "bg-primary text-background box-glow" : "text-muted hover:text-white"
            )}
        >
            {label}
        </button>
    );
}

function ExportBtn({ icon, onClick, title }: { icon: React.ReactNode, onClick: () => void, title: string }) {
    return (
        <button
            onClick={onClick}
            title={title}
            className="p-2 rounded-lg bg-white/[0.03] border border-white/5 text-muted hover:text-white hover:bg-white/10 transition-all"
        >
            {icon}
        </button>
    );
}
