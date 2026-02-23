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
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split("\n");
                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const data: StreamMessage = JSON.parse(line.replace("data: ", ""));
                            setLogs(prev => [...prev, `[${data.status}] ${data.message}`]);
                        } catch (e) {
                            console.error("Failed to parse SSE chunk", e);
                        }
                    }
                }
            }
            setLogs(prev => [...prev, "[SYSTEM] Mission complete. Balanced synchronized."]);
            fetchUserStatus();
        } catch (e) {
            setLogs(prev => [...prev, `[ERROR] Connection lost: ${e}`]);
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto flex flex-col gap-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Coding <span className="text-primary tracking-widest uppercase text-2xl ml-2">Arena</span></h1>
                    <p className="text-muted leading-relaxed max-w-xl">
                        Deploy your tactical coding mission to the Ascension Swarm. Input an objective, estimate the mission cost, and monitor the evolution in real-time.
                    </p>
                </div>

                <div className="glass-card p-4 flex gap-6 items-center border border-white/5">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-muted uppercase tracking-widest">Plan</span>
                        <span className="text-white font-bold">{userStatus.plan}</span>
                    </div>
                    <div className="h-8 w-[1px] bg-white/10" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-muted uppercase tracking-widest">Balance</span>
                        <span className="text-primary font-bold">{userStatus.balance.toLocaleString()} ⏣</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
                {/* Input Section */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="glass-card p-6 border border-white/5 flex flex-col gap-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Code size={120} />
                        </div>

                        <label className="text-xs font-mono text-muted uppercase tracking-widest">Mission Objective</label>
                        <textarea
                            value={objective}
                            onChange={(e) => {
                                setObjective(e.target.value);
                                fetchEstimate(e.target.value);
                            }}
                            placeholder="e.g. Implement a secure JWT authentication middleware in Python..."
                            className="bg-background/50 border border-white/10 rounded-lg p-4 h-48 focus:outline-none focus:border-primary/50 transition-colors text-white placeholder:text-muted/40 resize-none font-sans"
                            disabled={isExecuting}
                        />

                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2 text-xs font-mono">
                                <Zap size={14} className={cn(estimate ? "text-primary" : "text-muted")} />
                                <span className="text-muted uppercase tracking-widest">Estimated Cost:</span>
                                <span className={cn("font-bold", estimate ? "text-white" : "text-muted")}>
                                    {estimate ? `${estimate.toLocaleString()} ⏣` : "---"}
                                </span>
                            </div>

                            <button
                                onClick={handleExecute}
                                disabled={!objective || isExecuting || (estimate !== null && userStatus.balance < estimate)}
                                className={cn(
                                    "px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-all box-glow",
                                    !objective || isExecuting || (estimate !== null && userStatus.balance < estimate)
                                        ? "bg-muted/20 text-muted cursor-not-allowed border border-white/5"
                                        : "bg-primary text-background hover:bg-primary/90"
                                )}
                            >
                                {isExecuting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                {isExecuting ? "Executing Mission..." : "Deploy Swarm"}
                            </button>
                        </div>
                    </div>

                    {/* Quick Templates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: "Refactor Logic", desc: "Scan and optimize structural complexity", cost: "~500 ⏣" },
                            { title: "Add Unit Tests", desc: "Generate 100% coverage suite", cost: "~250 ⏣" }
                        ].map((t) => (
                            <button key={t.title} onClick={() => { setObjective(t.desc); fetchEstimate(t.desc); }}
                                className="glass-card p-4 border border-white/5 text-left hover:border-primary/30 transition-all group">
                                <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{t.title}</h4>
                                <p className="text-xs text-muted truncate">{t.desc}</p>
                                <div className="mt-2 text-[10px] font-mono text-primary/70">{t.cost}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Console Section */}
                <div className="glass-card border border-white/5 flex flex-col h-full min-h-[500px]">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Terminal size={14} className="text-primary" />
                            <span className="text-[10px] font-mono text-white uppercase tracking-widest">Mission Console</span>
                        </div>
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-500/20" />
                            <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
                            <div className="w-2 h-2 rounded-full bg-green-500/20" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2 bg-black/20">
                        {logs.length === 0 && <span className="text-muted/30 italic italic">Console idle. Awaiting tactical commands...</span>}
                        {logs.map((log, i) => (
                            <div key={i} className={cn(
                                "flex gap-2",
                                log.includes("[ERROR]") ? "text-red-400" :
                                    log.includes("[COMPLETED]") ? "text-green-400" :
                                        log.includes("[SYSTEM]") ? "text-primary/70" : "text-muted"
                            )}>
                                <span className="opacity-30 shrink-0">{i + 1}</span>
                                <span className="break-all">{log}</span>
                            </div>
                        ))}
                        <div ref={logEndRef} />
                    </div>

                    <div className="p-3 border-t border-white/5 bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full", isExecuting ? "bg-primary animate-pulse shadow-[0_0_10px_rgba(0,229,255,0.8)]" : "bg-muted/40")} />
                            <span className="text-[8px] font-mono text-muted uppercase tracking-widest">{isExecuting ? "Executing" : "Standby"}</span>
                        </div>
                        <span className="text-[8px] font-mono text-muted/30">v2.0.0-PROD</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
