"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Send, Zap, Brain, Loader2, Code } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

interface StreamMessage {
    status: string;
    message: string;
}

export default function CodingArena() {
    const { user } = useUser();
    const [objective, setObjective] = useState("");
    const [estimate, setEstimate] = useState<number | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [userStatus, setUserStatus] = useState({ balance: 0, plan: "...", access: 1 });
    const [logs, setLogs] = useState<string[]>([]);
    const [codeResult, setCodeResult] = useState<string | null>(null);
    const [storagePath, setStoragePath] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"code" | "preview">("code");
    const logEndRef = useRef<HTMLDivElement>(null);

    const API_BASE_URL = process.env.NEXT_PUBLIC_PLATFORM_API_URL || "http://localhost:8000";

    useEffect(() => {
        if (user) fetchUserStatus();
    }, [user]);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    const fetchUserStatus = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/user/status`, {
                headers: { "x-clerk-user-id": user?.id || "" }
            });
            const data = await res.json();
            setUserStatus({ balance: data.balance, plan: data.plan, access: data.access_level });
        } catch (e) {
            console.error("Failed to fetch user status", e);
        }
    };

    const fetchEstimate = async (val: string) => {
        if (!val) {
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
            console.error("Failed to fetch estimate", e);
        }
    };

    const handleExecute = async () => {
        if (!objective || isExecuting) return;
        setIsExecuting(true);
        setCodeResult(null);
        setLogs(["[SYSTEM] Initiating swarm connection...", "[SYSTEM] Validating token balance..."]);

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

            if (!response.ok) {
                const err = await response.json();
                setLogs(prev => [...prev, `[ERROR] ${err.detail || "Execution failed"}`]);
                setIsExecuting(false);
                return;
            }

            const reader = response.body?.getReader();
            if (!reader) return;

            const decoder = new TextDecoder();
            let buffer = ""; // SSE Reassembly Buffer

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");

                // Keep the last partial line in the buffer
                buffer = lines.pop() || "";

                for (const line of lines) {
                    const cleanLine = line.trim();
                    if (cleanLine.startsWith("data: ")) {
                        try {
                            const data: StreamMessage & { message: string } = JSON.parse(cleanLine.replace("data: ", ""));

                            if (data.status === "RESULT") {
                                setCodeResult(data.message);
                                setLogs(prev => [...prev, "[SUCCESS] Tactical mission output captured."]);
                            } else if (data.status === "PROCESSING") {
                                // Keep-Alive pings
                            } else if (data.status === "COMPLETED") {
                                setLogs(prev => [...prev, `[${data.status}] ${data.message}`]);
                                if ((data as any).storage_path) {
                                    setStoragePath((data as any).storage_path);
                                }
                            } else {
                                setLogs(prev => [...prev, `[${data.status}] ${data.message}`]);
                            }
                        } catch (e) {
                            console.error("Failed to parse SSE line", cleanLine, e);
                        }
                    }
                }
            }
            fetchUserStatus();
        } catch (e) {
            setLogs(prev => [...prev, `[ERROR] Connection lost: ${e}`]);
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto flex flex-col gap-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2 uppercase">Coding <span className="text-primary tracking-[0.3em] font-light ml-2">Arena</span></h1>
                    <p className="text-muted leading-relaxed max-w-xl text-sm">
                        Deploy tactical coding missions to the Ascension Swarm. Input an objective, estimate the mission cost, and monitor evolution in real-time.
                    </p>
                </div>

                <div className="glass-card p-4 flex gap-6 items-center border border-white/5 bg-white/[0.02]">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-muted uppercase tracking-widest opacity-50">Plan</span>
                        <span className="text-white font-bold">{userStatus.plan}</span>
                    </div>
                    <div className="h-8 w-[1px] bg-white/10" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-muted uppercase tracking-widest opacity-50">Balance</span>
                        <span className="text-primary font-bold">{userStatus.balance.toLocaleString()} ⏣</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
                {/* Input & Output Section */}
                <div className="lg:col-span-3 flex flex-col gap-8">
                    {/* Mission Input */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-6 border border-white/5 flex flex-col gap-4 relative overflow-hidden bg-white/[0.01]"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Brain className="text-primary w-4 h-4" />
                            <label className="text-xs font-mono text-muted uppercase tracking-widest">Astraeus Command Input</label>
                        </div>

                        <textarea
                            value={objective}
                            onChange={(e) => {
                                setObjective(e.target.value);
                                fetchEstimate(e.target.value);
                            }}
                            placeholder="e.g. Build a sleek dark-mode dashboard landing page with glassmorphism..."
                            className="bg-black/40 border border-white/5 rounded-xl p-5 h-40 focus:outline-none focus:border-primary/40 transition-all text-white placeholder:text-muted/30 resize-none font-mono text-sm leading-relaxed"
                            disabled={isExecuting}
                        />

                        <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                            <div className="flex items-center gap-4 bg-white/[0.03] px-4 py-2 rounded-full border border-white/5">
                                <div className="flex items-center gap-2 text-xs font-mono">
                                    <Zap size={14} className={cn(estimate ? "text-primary" : "text-muted opacity-30")} />
                                    <span className="text-muted/60 uppercase tracking-widest text-[10px]">Budget Delta:</span>
                                    <span className={cn("font-bold", estimate ? "text-white" : "text-muted/30")}>
                                        {estimate ? `${estimate.toLocaleString()} ⏣` : "---"}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleExecute}
                                disabled={!objective || isExecuting || (estimate !== null && userStatus.balance < estimate)}
                                className={cn(
                                    "px-10 py-3 rounded-full font-bold flex items-center gap-3 transition-all box-glow active:scale-95",
                                    !objective || isExecuting || (estimate !== null && userStatus.balance < estimate)
                                        ? "bg-white/5 text-muted cursor-not-allowed border border-white/5"
                                        : "bg-primary text-background hover:bg-white hover:text-primary"
                                )}
                            >
                                {isExecuting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                <span className="uppercase tracking-widest text-xs">
                                    {isExecuting ? "Mobilizing Swarm..." : "Deploy Mission"}
                                </span>
                            </button>
                        </div>
                    </motion.div>

                    {/* Result Visualization */}
                    <AnimatePresence>
                        {codeResult && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="flex flex-col gap-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                                            <Code className="text-primary w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white uppercase tracking-tight">Mission Output</h3>
                                            <p className="text-[10px] text-muted font-mono uppercase tracking-widest">Synthesized Intelligence Result</p>
                                        </div>
                                    </div>

                                    <div className="flex p-1 bg-white/[0.03] border border-white/5 rounded-full">
                                        <button
                                            onClick={() => setViewMode("code")}
                                            className={cn("px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all", viewMode === "code" ? "bg-primary text-background font-bold shadow-lg" : "text-muted hover:text-white")}
                                        >
                                            Code
                                        </button>
                                        <button
                                            onClick={() => setViewMode("preview")}
                                            className={cn("px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all", viewMode === "preview" ? "bg-primary text-background font-bold shadow-lg" : "text-muted hover:text-white")}
                                        >
                                            Preview
                                        </button>
                                    </div>
                                </div>

                                <div className="glass-card border border-white/10 overflow-hidden bg-black/40 min-h-[500px] relative">
                                    {viewMode === "code" ? (
                                        <pre className="p-6 text-sm font-mono text-white/90 leading-relaxed overflow-x-auto selection:bg-primary/30">
                                            <code>{codeResult}</code>
                                        </pre>
                                    ) : (
                                        <div className="w-full h-full min-h-[500px] bg-white rounded-inner">
                                            <iframe
                                                title="Preview"
                                                srcDoc={codeResult.includes("<!DOCTYPE html>") || codeResult.includes("<html") ? codeResult : `<html><body style="background:#0a0a0a;color:white;font-family:sans-serif;padding:40px;"><h3>Tactical Execution Preview</h3><hr style="border:1px solid #333;margin:20px 0;"><pre style="background:#222;padding:20px;border-radius:10px;">${codeResult}</pre></body></html>`}
                                                className="w-full h-full min-h-[500px] border-none"
                                            />
                                        </div>
                                    )}
                                </div>

                                {storagePath && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-3 px-4 py-2 bg-white/[0.03] border border-white/5 rounded-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Terminal size={12} className="text-primary/50" />
                                            <span className="text-[10px] font-mono text-muted uppercase tracking-widest">Storage Path:</span>
                                        </div>
                                        <code className="text-[10px] font-mono text-primary/80 break-all">{storagePath}</code>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Console Sidebar */}
                <div className="flex flex-col gap-6">
                    <div className="glass-card border border-white/5 flex flex-col h-[600px] bg-white/[0.01]">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-2">
                                <Terminal size={12} className="text-primary" />
                                <span className="text-[10px] font-mono text-white uppercase tracking-widest opacity-70">Mission Console</span>
                            </div>
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400/20" />
                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/20" />
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400/20" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 font-mono text-[11px] space-y-3 scrollbar-hide">
                            <AnimatePresence>
                                {logs.length === 0 && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-muted/20 italic block"
                                    >
                                        Console standby. Awaiting mission parameters...
                                    </motion.span>
                                )}
                                {logs.map((log, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={i}
                                        className={cn(
                                            "flex gap-3 leading-relaxed",
                                            log.includes("[ERROR]") ? "text-red-400" :
                                                log.includes("[COMPLETED]") || log.includes("[RESULT]") ? "text-green-400" :
                                                    log.includes("[SYSTEM]") ? "text-primary/70" :
                                                        log.includes("[PLANNING]") || log.includes("[DESIGN]") || log.includes("[IMPLEMENT]") || log.includes("[AUDIT]")
                                                            ? "text-primary/90 font-bold border-l-2 border-primary pl-2 mb-4 mt-2"
                                                            : "text-muted/80"
                                        )}
                                    >
                                        <span className="opacity-20 shrink-0 select-none">{(i + 1).toString().padStart(2, '0')}</span>
                                        <span className="break-all">{log}</span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <div ref={logEndRef} />
                        </div>

                        <div className="p-3 border-t border-white/5 bg-black/20 flex items-center justify-between">
                            <div className="flex items-center gap-3 px-2">
                                <div className={cn("w-2 h-2 rounded-full", isExecuting ? "bg-primary animate-pulse shadow-[0_0_15px_rgba(0,229,255,1)]" : "bg-muted/20")} />
                                <span className="text-[9px] font-mono text-muted uppercase tracking-[0.2em]">{isExecuting ? "Neural Processing" : "Link Idle"}</span>
                            </div>
                            <span className="text-[9px] font-mono text-muted/20">Astraeus v2.0.0</span>
                        </div>
                    </div>

                    {/* Meta Stats */}
                    <div className="glass-card p-5 border border-white/5 bg-white/[0.01] flex flex-col gap-4">
                        <h4 className="text-[10px] font-mono text-muted uppercase tracking-widest text-center">Swarm Heuristics</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white/[0.02] p-2 rounded border border-white/5 text-center">
                                <div className="text-[8px] text-muted uppercase">Latency</div>
                                <div className="text-xs text-white font-mono">142ms</div>
                            </div>
                            <div className="bg-white/[0.02] p-2 rounded border border-white/5 text-center">
                                <div className="text-[8px] text-muted uppercase">Confidence</div>
                                <div className="text-xs text-primary font-mono">98.4%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
