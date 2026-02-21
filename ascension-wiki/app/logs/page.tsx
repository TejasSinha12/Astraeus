"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Pause, Play, Trash2, Filter } from "lucide-react";
import { RoleGate } from "@/components/auth/RoleGate";
import type { LogSeverity } from "@/lib/mock-data";

interface LogEntry {
    id: number;
    timestamp: string;
    severity: LogSeverity;
    module: string;
    message: string;
}

const SEVERITY_STYLES: Record<LogSeverity, string> = {
    DEBUG: "text-gray-500",
    INFO: "text-primary",
    WARN: "text-yellow-400",
    ERROR: "text-red-400",
    CRITICAL: "text-red-400 font-bold",
};

const SEVERITY_BADGE: Record<LogSeverity, string> = {
    DEBUG: "bg-white/5 text-gray-500 border-white/10",
    INFO: "bg-primary/10 text-primary border-primary/20",
    WARN: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    ERROR: "bg-red-500/10 text-red-400 border-red-500/20",
    CRITICAL: "bg-red-500/20 text-red-300 border-red-500/40",
};

const SEVERITIES: (LogSeverity | "ALL")[] = ["ALL", "DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"];

export default function LogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [paused, setPaused] = useState(false);
    const [severityFilter, setSeverityFilter] = useState<LogSeverity | "ALL">("ALL");
    const [moduleFilter, setModuleFilter] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);
    const pausedRef = useRef(false);

    pausedRef.current = paused;

    useEffect(() => {
        const es = new EventSource("/api/logs/stream");
        es.onmessage = (e) => {
            if (pausedRef.current) return;
            try {
                const log = JSON.parse(e.data) as LogEntry;
                setLogs((prev) => [...prev.slice(-300), log]); // max 300 entries
            } catch { }
        };
        return () => es.close();
    }, []);

    useEffect(() => {
        if (!paused) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs, paused]);

    const filtered = logs.filter((l) => {
        if (severityFilter !== "ALL" && l.severity !== severityFilter) return false;
        if (moduleFilter && !l.module.includes(moduleFilter.toLowerCase())) return false;
        return true;
    });

    return (
        <RoleGate allowedRole="admin">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="text-xs font-mono text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />Live System Logs — Admin Only
                    </div>
                    <h1 className="text-4xl font-bold text-white">Log Stream</h1>
                    <p className="text-muted mt-1">Real-time cognitive event stream — SSE</p>
                </motion.div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    {/* Severity Filter */}
                    <div className="flex gap-1">
                        {SEVERITIES.map((s) => (
                            <button key={s} onClick={() => setSeverityFilter(s)}
                                className={`px-2 py-1 rounded text-xs font-mono border transition-all ${severityFilter === s
                                    ? s === "ALL" ? "bg-white/20 text-white border-white/30"
                                        : SEVERITY_BADGE[s as LogSeverity]
                                    : "text-muted border-white/10 hover:text-white"}`}>
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Module Filter */}
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1">
                        <Filter size={12} className="text-muted" />
                        <input type="text" placeholder="Filter module..." value={moduleFilter}
                            onChange={(e) => setModuleFilter(e.target.value)}
                            className="bg-transparent text-xs font-mono text-white outline-none placeholder:text-muted w-28" />
                    </div>

                    <div className="ml-auto flex gap-2">
                        <button onClick={() => setPaused((p) => !p)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${paused ? "bg-primary/10 text-primary border-primary/30" : "bg-white/5 text-muted border-white/10 hover:text-white"}`}>
                            {paused ? <Play size={12} /> : <Pause size={12} />}
                            {paused ? "Resume" : "Pause"}
                        </button>
                        <button onClick={() => setLogs([])}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-white/10 text-muted hover:text-red-400 hover:border-red-500/30 transition-all">
                            <Trash2 size={12} />Clear
                        </button>
                    </div>
                </div>

                {/* Terminal */}
                <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-500" /><div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        <span className="ml-2 text-xs font-mono text-muted">ascension://cognitive-event-stream</span>
                        <div className="ml-auto flex items-center gap-1.5 text-xs font-mono text-muted">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />{paused ? "PAUSED" : "LIVE"}
                        </div>
                    </div>

                    <div className="h-[60vh] overflow-y-auto p-4 font-mono text-xs space-y-0.5" style={{ background: "#050810" }}>
                        {filtered.map((log) => (
                            <motion.div key={log.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                className="flex items-start gap-3 py-0.5 hover:bg-white/5 rounded px-1 transition-colors group">
                                <span className="text-gray-600 shrink-0 text-[10px] pt-0.5">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                <span className={`shrink-0 px-1.5 py-px rounded border text-[10px] ${SEVERITY_BADGE[log.severity]}`}>{log.severity}</span>
                                <span className="text-purple-400/70 shrink-0">[{log.module}]</span>
                                <span className={SEVERITY_STYLES[log.severity]}>{log.message}</span>
                            </motion.div>
                        ))}
                        {filtered.length === 0 && <p className="text-gray-600 text-center pt-8">No log entries match current filters.</p>}
                        <div ref={bottomRef} />
                    </div>
                </div>

                <p className="text-xs font-mono text-muted mt-2 text-right">
                    {filtered.length} entries displayed · {logs.length} total buffered
                </p>
            </div>
        </RoleGate>
    );
}
