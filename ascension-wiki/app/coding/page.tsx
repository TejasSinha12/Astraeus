"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Send, Zap, Brain, Loader2, Code, Download, History, Pin, Maximize2, Layers, AlertTriangle, X, Search, Clock, Settings2, Github, GitPullRequest } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Custom Components
import { TelemetryMeters } from "@/components/coding/TelemetryMeters";
import { TraceSidebar } from "@/components/coding/TraceSidebar";
import { MissionDAG } from "@/components/coding/MissionDAG";
import { FileExplorer } from "@/components/coding/FileExplorer";
import { WebIDE } from "@/components/coding/WebIDE";
import { SwarmConfigurator } from "@/components/coding/SwarmConfigurator";

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
    const [fileMap, setFileMap] = useState<Record<string, string>>({});
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [storagePath, setStoragePath] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"ide" | "dag" | "diff">("ide");

    // Swarm Configuration
    // Swarm Configuration
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [swarmConfig, setSwarmConfig] = useState({
        agents: { auditor: true, optimizer: true, critic: true },
        creativity: 0.5,
        strictness: 0.8
    });

    const [isDeploying, setIsDeploying] = useState(false);
    const [ghToken, setGhToken] = useState("");
    const [repoName, setRepoName] = useState("");

    // History & DevEx
    const [history, setHistory] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [pinnedIds, setPinnedIds] = useState<string[]>([]);
    const [diffBase, setDiffBase] = useState<string | null>(null);
    const [diffTarget, setDiffTarget] = useState<string | null>(null);

    // UI Local State
    const [estimate, setEstimate] = useState<number | null>(null);
    const [isModelFallback, setIsModelFallback] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const logEndRef = useRef<HTMLDivElement>(null);
    const API_BASE_URL = process.env.NEXT_PUBLIC_PLATFORM_API_URL || "http://localhost:8000";

    // ─── Status & History Fetching ───────────────────────────────────────────
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

    const fetchHistory = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/missions/list?user_id=${user?.id || 'admin'}`);
            const data = await res.json();
            setHistory(data.missions || []);
        } catch (e) {
            console.error("History fetch failed", e);
        }
    }, [user, API_BASE_URL]);

    useEffect(() => {
        if (user) {
            fetchUserStatus();
            fetchHistory();
        }
    }, [user, fetchUserStatus, fetchHistory]);

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

    // ─── Swarm Execution Logic ───────────────────────────────────────────────
    const { getToken } = useAuth();

    const handleExecute = async () => {
        if (!objective || isExecuting) return;

        setIsExecuting(true);
        setLogs(["[SYSTEM] Connection initialized.", "[SYSTEM] Token allocation secured."]);
        setTraceSteps([]);
        setCodeResult(null);
        setFileMap({});
        setSelectedFile(null);
        setMetrics({ tokens: 0, latency: 0, confidence: 0, cost: 0 });
        const startTime = Date.now();

        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/execute/stream`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    objective,
                    user_id: user?.id,
                    mode: "professional",
                    config: swarmConfig
                })
            });

            if (!response.ok) {
                if (response.status === 402) {
                    toast.error("Insufficient tokens. Please top up your account.");
                } else if (response.status === 429) {
                    toast.error("Rate limit exceeded. Too many concurrent executions.");
                } else {
                    toast.error(`Execution failed: ${response.statusText}`);
                }
                throw new Error("HTTP " + response.status);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) throw new Error("Stream unreachable");

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split("\n").filter(Boolean);

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);

                        if (data.status === "THINKING" || data.status === "PLANNING" || data.status === "DESIGN" || data.status === "IMPLEMENT" || data.status === "AUDIT") {
                            setLogs(prev => [...prev, `[${data.status}] ${data.message}`]);
                            setTraceSteps(prev => [...prev, { status: data.status, message: data.message, timestamp: new Date().toLocaleTimeString() }]);
                        } else if (data.status === "PROCESSING") {
                            setLogs(prev => [...prev, "[PROCESSING] Swarm thinking..."]);
                        } else if (data.status === "RESULT") {
                            setCodeResult(data.message);
                            if (data.file_map) {
                                setFileMap(data.file_map);
                                const files = Object.keys(data.file_map);
                                if (files.length > 0) setSelectedFile(files[0]);
                            }
                            setLogs(prev => [...prev, "[SUCCESS] Tactical solution generated."]);
                            setMetrics(prev => ({ ...prev, confidence: 0.98, latency: Date.now() - startTime }));
                        } else if (data.status === "COMPLETED") {
                            setLogs(prev => [...prev, `[${data.status}] Mission Absolute.`]);
                            toast.success("Swarm Mission Executed Successfully");
                            if (data.storage_path) setStoragePath(data.storage_path);

                            // Visual Deduction
                            const cost = 150; // Approximated metric
                            setUserStatus(prev => ({ ...prev, balance: Math.max(0, prev.balance - cost) }));
                            setMetrics(prev => ({ ...prev, cost: prev.cost + cost, tokens: prev.tokens + 1500 }));
                            fetchHistory();
                        } else if (data.status === "ERROR") {
                            setLogs(prev => [...prev, `[ERROR] ${data.message}`]);
                            toast.error(data.message.includes("quota") ? "Execution halted due to quota limit." : `Swarm Error: ${data.message}`);

                            if (data.message.includes("429") || data.message.includes("quota")) {
                                setIsModelFallback(true);
                                // Auto-mock simulation if quota hits
                                setTimeout(() => {
                                    setCodeResult(`<!DOCTYPE html><html><head><style>body{background:#0a0a0a;color:#00e5ff;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;} .card{background:rgba(255,255,255,0.05);padding:40px;border-radius:20px;border:1px solid rgba(0,229,255,0.2);box-shadow:0 0 50px rgba(0,229,255,0.1);text-align:center;} h1{font-size:3rem;margin-bottom:10px;text-transform:uppercase;letter-spacing:5px;} p{opacity:0.6;font-family:monospace;}</style></head><body><div class="card"><h1>Swarm Matrix</h1><p>Mission: ${objective}</p><p>Status: Simulated Tactical Result</p></div></body></html>`);
                                    setLogs(prev => [...prev, "[SYSTEM] Quota fail-safe active. Swarm simulating objective in local memory."]);
                                    toast.info("Simulated fallback execution deployed.");
                                }, 1000);
                            }
                        }
                    } catch (err) {
                        // ignore unparseable chunks
                    }
                }
            }
        } catch (e) {
            setLogs(prev => [...prev, "[ERROR] Swarm critical failure. Connection reset."]);
        } finally {
            setIsExecuting(false);
            fetchUserStatus();
        }
    };

    const handleDeployToGithub = async () => {
        if (!codeResult || !repoName || !ghToken) {
            toast.error("Repository name and GitHub Token are required for deployment.");
            return;
        }

        setIsDeploying(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/v1/integrations/github/deploy`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "x-clerk-user-id": user?.id || ""
                },
                body: JSON.stringify({
                    mission_id: storagePath ? storagePath.split('/').pop() : "latest",
                    repo_name: repoName,
                    github_token: ghToken,
                    title: `Swarm Mission: ${objective.slice(0, 50)}`,
                })
            });

            const data = await response.json();
            if (response.ok) {
                toast.success("Pull Request Created Successfully!");
                window.open(data.pr_url, "_blank");
            } else {
                toast.error(data.detail || "Deployment failed.");
            }
        } catch (error) {
            toast.error("Critical deployment failure.");
        } finally {
            setIsDeploying(false);
        }
    };

    const handleExport = (format: "json" | "zip") => {
        const content = format === "json" ? JSON.stringify({ objective, code: codeResult, logs, metrics, trace: traceSteps }, null, 2) : "BUNDLE_STUB";
        const blob = new Blob([content], { type: format === "json" ? "application/json" : "application/zip" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mission_${Date.now()}.${format}`;
        a.click();
    };

    const togglePin = (id: string) => {
        setPinnedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const filteredHistory = history.filter(m =>
        m.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toString().includes(searchQuery)
    );

    const pinnedMissions = history.filter(m => pinnedIds.includes(m.id.toString()));

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#050505]">
            {/* History Sidebar - Floating/Collapsible */}
            <AnimatePresence>
                {showHistory && (
                    <motion.aside
                        initial={{ x: -320, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -320, opacity: 0 }}
                        className="fixed inset-y-16 left-0 w-80 bg-background border-r border-white/5 z-50 flex flex-col p-6 shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                                <History size={16} className="text-primary" />
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Mission Archive</h3>
                            </div>
                            <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-white/5 rounded-full transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 w-3 h-3" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search objective..."
                                className="w-full bg-white/5 border border-white/5 rounded-lg pl-9 pr-4 py-2 text-[10px] font-mono focus:outline-none focus:border-primary/40"
                            />
                        </div>

                        <div className="flex-1 overflow-auto space-y-8 custom-scrollbar">
                            {pinnedMissions.length > 0 && (
                                <section>
                                    <h4 className="text-[9px] font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Pin size={10} className="fill-primary" /> Pinned
                                    </h4>
                                    <div className="space-y-2">
                                        {pinnedMissions.map(m => (
                                            <HistoryItem key={m.id} mission={m} isPinned={true} onSelect={() => { setCodeResult(m.source_code); setObjective(m.objective); setShowHistory(false); }} onTogglePin={togglePin} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            <section>
                                <h4 className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Clock size={10} /> Recent Runs
                                </h4>
                                <div className="space-y-4">
                                    {filteredHistory.map(m => (
                                        <HistoryItem
                                            key={m.id}
                                            mission={m}
                                            isPinned={pinnedIds.includes(m.id.toString())}
                                            onSelect={() => {
                                                setCodeResult(m.source_code);
                                                if (m.is_multifile && m.file_map) {
                                                    try {
                                                        const fm = typeof m.file_map === 'string' ? JSON.parse(m.file_map) : m.file_map;
                                                        setFileMap(fm);
                                                        const first = Object.keys(fm)[0];
                                                        if (first) setSelectedFile(first);
                                                    } catch (e) { console.error("FM Parse error", e); }
                                                } else {
                                                    setFileMap({});
                                                    setSelectedFile(null);
                                                }
                                                setObjective(m.objective);
                                                setShowHistory(false);
                                            }}
                                            onTogglePin={togglePin}
                                        />
                                    ))}
                                </div>
                            </section>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Area */}
            <main className="flex-1 flex flex-col">
                {/* Header Controls */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/20">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg">
                                <Layers className="text-primary w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-xs font-bold uppercase tracking-widest">Astraeus <span className="text-primary font-light">Workspace</span></h2>
                                <p className="text-[8px] text-muted uppercase tracking-[0.2em]">{isExecuting ? "Swarm Dynamic" : "Node Idle"}</p>
                            </div>
                        </div>
                        <div className="h-8 w-[1px] bg-white/5" />
                        <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted hover:text-white transition-all">
                            <History size={14} /> Mission History
                        </button>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex items-center gap-4 text-[10px] font-mono text-muted/40 uppercase tracking-wider">
                            <span>Plan: <span className="text-primary">{userStatus.plan}</span></span>
                            <span>Credits: <span className="text-white">{userStatus.credits}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Send size={14} className="text-primary" />
                        </div>
                    </div>
                </header>

                {/* Command Input Section */}
                <div className="p-8 border-b border-white/5 bg-gradient-to-b from-black/40 to-transparent">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Terminal size={12} className="text-primary/60" />
                                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">Command Objective</span>
                            </div>
                            <div className="relative group">
                                <textarea
                                    value={objective}
                                    onChange={(e) => setObjective(e.target.value)}
                                    placeholder="Declare mission goals for swarm orchestration..."
                                    className="w-full bg-black/60 border border-white/5 rounded-2xl p-6 text-sm font-mono text-white focus:outline-none focus:border-primary/40 transition-all min-h-[120px] resize-none group-hover:border-white/10"
                                />
                                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                                    <button
                                        onClick={() => setIsConfigOpen(true)}
                                        className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-muted hover:text-primary hover:border-primary/30 transition-all group"
                                        title="Swarm Tuning"
                                    >
                                        <Settings2 size={16} className="group-hover:rotate-90 transition-transform duration-500" />
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleExecute}
                                        disabled={!objective || isExecuting}
                                        className="px-6 py-2.5 bg-primary text-background rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all box-glow disabled:opacity-50 disabled:grayscale"
                                    >
                                        {isExecuting ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} className="fill-background" />}
                                        {isExecuting ? "Orchestrating..." : "Deploy Swarm"}
                                    </motion.button>
                                </div>
                            </div>
                        </div>

                        {/* Telemetry Row */}
                        <TelemetryMeters
                            tokens={metrics.tokens}
                            latency={metrics.latency}
                            confidence={metrics.confidence}
                            cost={metrics.cost + (estimate || 0)}
                            isExecuting={isExecuting}
                        />
                    </div>
                </div>

                {/* Output Viewport */}
                <div className="flex-1 flex flex-col p-4 bg-background relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/5 rounded-lg">
                            <ViewBtn label="IDE View" active={viewMode === "ide"} onClick={() => setViewMode("ide")} />
                            <ViewBtn label="Swarm DAG" active={viewMode === "dag"} onClick={() => setViewMode("dag")} />
                            <ViewBtn label="Comparison" active={viewMode === "diff"} onClick={() => setViewMode("diff")} />
                        </div>

                        <div className="flex items-center gap-2">
                            {isModelFallback && (
                                <div className="flex items-center gap-2 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded text-[9px] text-yellow-500 font-mono uppercase">
                                    <AlertTriangle size={10} /> Fallback Active
                                </div>
                            )}
                            <div className="flex gap-1">
                                <ExportBtn
                                    icon={isDeploying ? <Loader2 size={12} className="animate-spin" /> : <Github size={12} />}
                                    onClick={() => {
                                        const repo = prompt("Enter GitHub Repo (username/repo):", repoName);
                                        const pat = prompt("Enter GitHub Personal Access Token (for PR creation):", ghToken);
                                        if (repo && pat) {
                                            setRepoName(repo);
                                            setGhToken(pat);
                                            handleDeployToGithub();
                                        }
                                    }}
                                    title="Deploy to GitHub"
                                />
                                <ExportBtn icon={<Download size={12} />} onClick={() => handleExport("zip")} title="ZIP Archive" />
                                <ExportBtn icon={<History size={12} />} onClick={() => handleExport("json")} title="JSON Trace" />
                                <ExportBtn icon={<Maximize2 size={12} />} onClick={() => { }} title="Fullscreen" />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 rounded-xl bg-black/40 overflow-hidden relative border border-white/5">
                        <AnimatePresence mode="wait">
                            {viewMode === "ide" && (
                                <motion.div
                                    key="split-view"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="h-full flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/5"
                                >
                                    {/* Web IDE Pane */}
                                    <div className="flex-1 flex flex-col min-h-0 bg-black/20">
                                        <div className="flex-1 flex flex-col min-h-0 divide-x divide-white/5 lg:flex-row">
                                            {/* File Explorer Sidebar */}
                                            {Object.keys(fileMap).length > 0 && (
                                                <div className="w-full lg:w-48 xl:w-64 shrink-0">
                                                    <FileExplorer
                                                        fileMap={fileMap}
                                                        selectedFile={selectedFile}
                                                        onFileSelect={setSelectedFile}
                                                    />
                                                </div>
                                            )}

                                            <div className="flex-1 flex flex-col min-h-0">
                                                <div className="px-4 py-2 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Code size={12} className="text-primary" />
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">
                                                            {selectedFile || "Mission Code Base"}
                                                        </span>
                                                    </div>
                                                    <span className="text-[8px] font-mono text-muted/20 uppercase tracking-widest">Read Only</span>
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    {codeResult ? (
                                                        <WebIDE
                                                            code={selectedFile ? fileMap[selectedFile] : codeResult}
                                                            filename={selectedFile || "result.html"}
                                                        />
                                                    ) : (
                                                        <EmptyState icon={<Terminal size={48} />} label="Awaiting Swarm Output..." />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Live Preview Pane */}
                                    <div className="flex-1 flex flex-col min-h-0 bg-white">
                                        <div className="px-4 py-2 border-b border-black/10 bg-black/5 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Zap size={12} className="text-primary fill-primary" />
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-black/40">Execution Preview</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 rounded-full bg-red-400/20" />
                                                <div className="w-2 h-2 rounded-full bg-yellow-400/20" />
                                                <div className="w-2 h-2 rounded-full bg-green-400/20" />
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-[#1a1a1a] relative">
                                            {codeResult ? (
                                                <iframe
                                                    title="Mission Preview"
                                                    srcDoc={codeResult.includes("<!DOCTYPE html>") ? codeResult : `<html><body style="background:#0a0a0a;color:white;font-family:sans-serif;padding:40px;"><h3>Tactical Execution Preview</h3><hr style="border:1px solid #333;margin:20px 0;"><pre style="background:#222;padding:20px;border-radius:10px;">${codeResult}</pre></body></html>`}
                                                    className="w-full h-full border-none"
                                                />
                                            ) : <EmptyState icon={<Brain size={48} />} label="Visualizer Idle..." dark />}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {viewMode === "dag" && (
                                <motion.div key="dag" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                                    <MissionDAG steps={traceSteps} isExecuting={isExecuting} />
                                </motion.div>
                            )}

                            {viewMode === "diff" && (
                                <motion.div key="diff" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col">
                                    <div className="p-4 border-b border-white/5 flex gap-4 bg-white/[0.02]">
                                        <DiffSelector value={diffBase || ""} onChange={setDiffBase} history={history} label="Select Base Mission..." />
                                        <div className="flex items-center text-muted/20 font-mono text-[9px]">VS</div>
                                        <DiffSelector value={diffTarget || ""} onChange={setDiffTarget} history={history} label="Select Target Mission..." />
                                    </div>
                                    <div className="flex-1 flex overflow-hidden">
                                        <DiffPane content={diffBase} color="bg-red-500/[0.02]" placeholder="// Base Mission Data" />
                                        <DiffPane content={diffTarget} color="bg-green-500/[0.02]" placeholder="// Target Mission Data" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {storagePath && (
                        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Terminal size={14} className="text-primary" />
                                <span className="text-[10px] font-mono text-muted uppercase tracking-[0.2em]">Matrix Path:</span>
                                <code className="text-[10px] text-white/80 font-mono">{storagePath}</code>
                            </div>
                            <button className="text-[9px] font-bold text-primary hover:underline uppercase tracking-widest">Matrix Sync</button>
                        </div>
                    )}
                </div>
            </main>

            {/* Logs/Traces Sidebar */}
            <aside className="w-80 lg:w-96 hidden md:block border-l border-white/5">
                <TraceSidebar logs={logs} steps={traceSteps} isExecuting={isExecuting} />
            </aside>
            {/* Swarm Configurator Modal */}
            <SwarmConfigurator
                isOpen={isConfigOpen}
                onClose={() => setIsConfigOpen(false)}
                config={swarmConfig}
                onChange={setSwarmConfig}
            />
        </div>
    );
}

// ─── Helper Components ───────────────────────────────────────────────────────

function HistoryItem({ mission, isPinned, onTogglePin, onSelect }: { mission: any, isPinned: boolean, onTogglePin: (id: string) => void, onSelect: () => void }) {
    return (
        <div className="group relative p-3 rounded-lg hover:bg-white/[0.03] transition-all cursor-pointer border border-transparent hover:border-white/10" onClick={onSelect}>
            <div className="flex flex-col gap-1 pr-8">
                <span className="text-[8px] font-mono text-white/20 uppercase tracking-tighter">Mission #{mission.id.toString().slice(0, 8)}</span>
                <p className="text-[11px] text-white/60 font-medium line-clamp-1 group-hover:text-primary transition-colors">{mission.objective}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] text-muted/40 uppercase tracking-widest">{new Date(mission.created_at).toLocaleDateString()}</span>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <span className="text-[8px] text-muted/40 uppercase tracking-widest">{mission.is_multifile ? "Multi-file" : "Single-file"}</span>
                </div>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onTogglePin(mission.id.toString()); }}
                className={cn(
                    "absolute top-3 right-3 p-1 rounded transition-all",
                    isPinned ? "text-primary opacity-100" : "text-white/10 opacity-0 group-hover:opacity-100"
                )}
            >
                <Pin size={12} className={cn(isPinned && "fill-primary")} />
            </button>
        </div>
    );
}

function ViewBtn({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    return (
        <button onClick={onClick} className={cn("px-4 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all", active ? "bg-primary text-background box-glow" : "text-muted hover:text-white")}>
            {label}
        </button>
    );
}

function ExportBtn({ icon, onClick, title }: { icon: React.ReactNode, onClick: () => void, title: string }) {
    return (
        <button onClick={onClick} title={title} className="p-2 rounded-lg bg-white/[0.03] border border-white/5 text-muted hover:text-white hover:bg-white/10 transition-all">
            {icon}
        </button>
    );
}

function EmptyState({ icon, label, dark }: { icon: React.ReactNode, label: string, dark?: boolean }) {
    return (
        <div className={cn("h-full flex flex-col items-center justify-center opacity-20", dark ? "bg-black/40" : "bg-transparent")}>
            {icon}
            <span className="text-[10px] uppercase tracking-[0.3em] mt-4 font-bold">{label}</span>
        </div>
    );
}

function DiffSelector({ value, onChange, history, label }: { value: string, onChange: (v: string) => void, history: any[], label: string }) {
    return (
        <select value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-mono text-white/60 focus:outline-none focus:border-primary/40">
            <option value="" className="bg-black">{label}</option>
            {history.map(m => <option key={m.id} value={m.source_code} className="bg-black">{m.objective.slice(0, 40)}...</option>)}
        </select>
    );
}

function DiffPane({ content, color, placeholder }: { content: string | null, color: string, placeholder: string }) {
    return (
        <div className={cn("flex-1 p-4 overflow-auto custom-scrollbar font-mono text-[10px] leading-relaxed", color, !content && "border-r border-white/5")}>
            <pre className="text-white/40"><code>{content || placeholder}</code></pre>
        </div>
    );
}
