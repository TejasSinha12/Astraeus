"use client";

export const dynamic = "force-dynamic";

import { useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, RotateCcw, GitCompare, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ReactFlow, Background, Controls, Handle, Position, type NodeTypes } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { RoleGate } from "@/components/auth/RoleGate";
import { useAgentSimStore } from "@/lib/store";
import { SIM_TRACE_SEQUENCES } from "@/lib/mock-data";
import { ResearcherProfile } from "@/components/admin/ResearcherProfile";
import { ForgePortal } from "@/components/coding/ForgePortal";
import { ChronosScrub } from "@/components/coding/ChronosScrub";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

// ─── Custom DAG Node ─────────────────────────────────────────────────────────
function AGINode({ data }: { data: { label: string; status: "idle" | "active" | "done"; color: string } }) {
    return (
        <div className={`px-4 py-2 rounded-xl border text-xs font-mono transition-all duration-500 ${data.status === "active" ? "bg-primary/20 border-primary text-white shadow-[0_0_20px_rgba(0,229,255,0.4)]" :
            data.status === "done" ? "bg-green-500/10 border-green-500/30 text-green-400" :
                "bg-white/5 border-white/10 text-muted"}`}>
            <Handle type="target" position={Position.Left} style={{ background: "transparent", border: "none" }} />
            {data.label}
            <Handle type="source" position={Position.Right} style={{ background: "transparent", border: "none" }} />
        </div>
    );
}

const nodeTypes: NodeTypes = { agi: AGINode };

const AGENTS = ["Researcher_01", "Coder_01", "Executive_Alpha"] as const;

interface TraceStep {
    id: string;
    type: string;
    label: string;
    detail: string;
    confidence: number;
    timestamp: number;
}

function buildNodes(steps: TraceStep[]) {
    const base = [
        { id: "goal", type: "agi", position: { x: 0, y: 80 }, data: { label: "Goal", status: "idle", color: "#00e5ff" } },
        { id: "plan", type: "agi", position: { x: 160, y: 80 }, data: { label: "Planner", status: "idle", color: "#a78bfa" } },
        { id: "decide", type: "agi", position: { x: 320, y: 80 }, data: { label: "Decision", status: "idle", color: "#34d399" } },
        { id: "tool", type: "agi", position: { x: 480, y: 20 }, data: { label: "Tool", status: "idle", color: "#f472b6" } },
        { id: "reflect", type: "agi", position: { x: 480, y: 140 }, data: { label: "Reflect", status: "idle", color: "#fb923c" } },
        { id: "complete", type: "agi", position: { x: 640, y: 80 }, data: { label: "Complete", status: "idle", color: "#00e5ff" } },
    ];

    const stepTypeMap: Record<string, string> = { plan: "plan", decide: "decide", tool: "tool", reflect: "reflect", complete: "complete", fail: "complete" };
    const activeIds = new Set(steps.map((s) => stepTypeMap[s.type] || s.type));
    const lastId = steps.length > 0 ? stepTypeMap[steps[steps.length - 1].type] : null;

    return base.map((n) => ({
        ...n,
        data: {
            ...n.data,
            status: n.id === "goal" && steps.length > 0 ? "done" :
                n.id === lastId ? "active" :
                    activeIds.has(n.id) ? "done" : "idle",
        },
    }));
}

const EDGES = [
    { id: "e1", source: "goal", target: "plan", style: { stroke: "rgba(255,255,255,0.15)", strokeWidth: 1.5 }, animated: true },
    { id: "e2", source: "plan", target: "decide", style: { stroke: "rgba(255,255,255,0.15)", strokeWidth: 1.5 }, animated: true },
    { id: "e3", source: "decide", target: "tool", style: { stroke: "rgba(244,114,182,0.4)", strokeWidth: 1.5 }, animated: true },
    { id: "e4", source: "decide", target: "reflect", style: { stroke: "rgba(251,146,60,0.4)", strokeWidth: 1.5 }, animated: true },
    { id: "e5", source: "tool", target: "complete", style: { stroke: "rgba(255,255,255,0.15)", strokeWidth: 1.5 }, animated: true },
    { id: "e6", source: "reflect", target: "complete", style: { stroke: "rgba(255,255,255,0.15)", strokeWidth: 1.5 }, animated: true },
];

const STEP_COLORS = { plan: "text-purple-400", decide: "text-primary", tool: "text-pink-400", reflect: "text-orange-400", complete: "text-green-400", fail: "text-red-400" };

function buildGenealogyNodes(lineage: any[]) {
    return lineage.map((m, i) => ({
        id: m.id,
        type: "agi",
        position: { x: (i % 5) * 200, y: Math.floor(i / 5) * 100 },
        data: {
            label: `${m.id}\n${m.objective.substring(0, 15)}...`,
            status: "done",
            color: m.experiment_id ? "#f472b6" : "#00e5ff"
        }
    }));
}

function buildGenealogyEdges(lineage: any[]) {
    return lineage
        .filter(m => m.parent_id)
        .map(m => ({
            id: `e-${m.parent_id}-${m.id}`,
            source: m.parent_id,
            target: m.id,
            style: { stroke: "rgba(255,255,255,0.2)", strokeWidth: 1.5 },
            animated: true
        }));
}

function buildFederationNodes(clusters: any[]) {
    return clusters.map((c, i) => ({
        id: c.id,
        type: "agi",
        position: { x: (i % 3) * 300, y: Math.floor(i / 3) * 150 },
        data: {
            label: `${c.name}\n[${c.region}]\nMode: ${c.mode}`,
            status: c.is_active ? "done" : "idle",
            color: c.is_active ? "#00e5ff" : "#ff4444"
        }
    }));
}

function buildFederationEdges(clusters: any[]) {
    // Connect all clusters to a central 'GlobalCoordinator' if multiple exist
    if (clusters.length < 2) return [];
    return clusters.slice(1).map(c => ({
        id: `link-${clusters[0].id}-${c.id}`,
        source: clusters[0].id,
        target: c.id,
        style: { stroke: "rgba(0,229,255,0.3)", strokeWidth: 1, strokeDasharray: "5,5" },
        animated: true
    }));
}

const API_URL = process.env.NEXT_PUBLIC_PLATFORM_API_URL || "http://localhost:8000";

export default function ArenaPage() {
    const { getToken, userId } = useAuth();
    const { selectedAgent, task, isRunning, traceSteps, confidence, setAgent, setTask, startSim, stopSim, pushStep, pushConfidence, reset } = useAgentSimStore();
    const [lineage, setLineage] = useState<any[]>([]);
    const [clusters, setClusters] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<"reasoning" | "genealogy" | "federation" | "profile" | "forge">("reasoning");

    // Forge & Chronos state
    const [forgeData, setForgeData] = useState<any>(null);
    const [isForging, setIsForging] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [replayMode, setReplayMode] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/missions/lineage`)
            .then(res => res.json())
            .then(data => setLineage(data))
            .catch(err => console.error("Failed to fetch lineage:", err));

        fetch(`${API_URL}/missions/federation/clusters`)
            .then(res => res.json())
            .then(data => setClusters(data))
            .catch(err => console.error("Failed to fetch clusters:", err));
    }, []);

    const runSim = useCallback(async () => {
        startSim();
        setReplayMode(false);
        const steps = SIM_TRACE_SEQUENCES[selectedAgent];
        for (let i = 0; i < steps.length; i++) {
            await new Promise((r) => setTimeout(r, 900 + Math.random() * 400));
            pushStep({ ...steps[i], id: `step-${i}`, timestamp: Date.now() });
            pushConfidence(steps[i].confidence);
            setCurrentStep(i);
        }
        stopSim();
    }, [selectedAgent, startSim, stopSim, pushStep, pushConfidence]);

    const runForge = async () => {
        setIsForging(true);
        setViewMode("forge");
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/forge/session`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-clerk-user-id": userId || "" },
                body: JSON.stringify({ objective: task })
            });
            const data = await res.json();
            setForgeData(data);
        } catch (err) {
            console.error("Forge failed:", err);
        } finally {
            setIsForging(false);
        }
    };

    const getNodes = () => {
        if (viewMode === "reasoning") {
            // If replaying, we only show nodes up to the currentStep
            const visibleSteps = replayMode ? traceSteps.slice(0, currentStep + 1) : traceSteps;
            return buildNodes(visibleSteps);
        }
        if (viewMode === "genealogy") return buildGenealogyNodes(lineage);
        return buildFederationNodes(clusters);
    };

    const getEdges = () => {
        if (viewMode === "reasoning") return EDGES;
        if (viewMode === "genealogy") return buildGenealogyEdges(lineage);
        return buildFederationEdges(clusters);
    };

    const nodes = getNodes();
    const edges = getEdges();
    const confidenceData = confidence.map((v, i) => ({ step: i + 1, value: parseFloat((v * 100).toFixed(1)) }));

    return (
        <RoleGate allowedRole="researcher">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex justify-between items-end">
                    <div>
                        <div className="text-xs font-mono text-primary uppercase tracking-widest mb-2">Live Simulation</div>
                        <h1 className="text-4xl font-bold text-white">Agent Arena</h1>
                        <p className="text-muted mt-1">Observe and compare agent cognitive loops in real time</p>
                    </div>
                    {viewMode === "forge" && (
                        <button onClick={() => setViewMode("reasoning")} className="text-xs font-mono text-primary px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 transition-all">
                            Back to Core View
                        </button>
                    )}
                </motion.div>

                {viewMode === "forge" ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        {isForging ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-6 glass-card border-primary/20 bg-primary/5 rounded-3xl">
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="p-4 rounded-full border-4 border-primary border-t-transparent shadow-[0_0_50px_rgba(0,229,255,0.3)]" />
                                <div className="text-center">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-widest">Forging Parallel Branches...</h3>
                                    <p className="text-muted font-mono mt-2 animate-pulse uppercase tracking-[0.3em]">Spawning Swarms Alpha, Beta, and Gamma</p>
                                </div>
                            </div>
                        ) : forgeData && (
                            <ForgePortal objective={task} branches={forgeData.branches} onSelect={(label) => console.log("Selected branch", label)} />
                        )}
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Control Panel */}
                        <div className="space-y-4">
                            <div className="glass-card rounded-2xl border border-white/5 p-5">
                                <h2 className="text-xs font-mono text-muted uppercase tracking-widest mb-4">Configuration</h2>

                                <label className="text-xs text-muted font-mono uppercase tracking-widest block mb-2">Agent</label>
                                <select value={selectedAgent} onChange={(e) => setAgent(e.target.value as typeof selectedAgent)}
                                    className="w-full px-3 py-2 rounded-lg bg-background border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-primary mb-4 transition-colors">
                                    {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
                                </select>

                                <label className="text-xs text-muted font-mono uppercase tracking-widest block mb-2">Task</label>
                                <textarea value={task} onChange={(e) => setTask(e.target.value)} rows={3}
                                    placeholder="Describe a research task..."
                                    className="w-full px-3 py-2 rounded-lg bg-background border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-primary resize-none transition-colors mb-4" />

                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            onClick={runSim} disabled={isRunning || isForging}
                                            className="flex-1 py-2 rounded-lg bg-primary text-background font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all">
                                            <Play size={14} />{isRunning ? "Running…" : "Run Single"}
                                        </motion.button>
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            onClick={reset}
                                            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-muted hover:text-white transition-colors">
                                            <RotateCcw size={14} />
                                        </motion.button>
                                    </div>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        onClick={runForge} disabled={isRunning || isForging || !task}
                                        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-primary text-white font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-40 group overflow-hidden relative shadow-lg">
                                        <Zap size={14} className="group-hover:animate-bounce" />
                                        Launch Neural Forge
                                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Confidence Graph */}
                            {confidenceData.length > 0 && (
                                <div className="glass-card rounded-2xl border border-white/5 p-5">
                                    <h2 className="text-xs font-mono text-muted uppercase tracking-widest mb-3">Confidence</h2>
                                    <ResponsiveContainer width="100%" height={100}>
                                        <LineChart data={confidenceData}>
                                            <XAxis dataKey="step" hide />
                                            <YAxis domain={[50, 100]} hide />
                                            <Tooltip formatter={(v: number | undefined) => [`${v ?? 0}%`, "Confidence"]} contentStyle={{ background: "#1a1f2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }} />
                                            <Line type="monotone" dataKey="value" stroke="#00e5ff" strokeWidth={2} dot={{ fill: "#00e5ff", r: 3 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>

                        {/* Reasoning Trace */}
                        <div className="glass-card rounded-2xl border border-white/5 p-5 flex flex-col">
                            <h2 className="text-xs font-mono text-muted uppercase tracking-widest mb-4">Reasoning Trace</h2>
                            <div className="space-y-3 min-h-[300px] flex-1 overflow-y-auto custom-scrollbar pr-1">
                                <AnimatePresence>
                                    {traceSteps.length === 0 && !isRunning && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted text-sm font-mono text-center pt-12">
                                            No trace yet. Configure and run a simulation.
                                        </motion.p>
                                    )}
                                    {traceSteps.slice(0, replayMode ? currentStep + 1 : undefined).map((step, i) => (
                                        <motion.div key={step.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0 }}
                                            className={cn(
                                                "flex gap-3 p-3 rounded-xl border transition-colors",
                                                i === currentStep ? "bg-primary/5 border-primary/20" : "bg-white/5 border-white/5"
                                            )}>
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="text-lg font-bold font-mono text-muted">{String(i + 1).padStart(2, "0")}</div>
                                            </div>
                                            <div>
                                                <div className={`text-xs font-mono font-bold uppercase tracking-widest ${STEP_COLORS[step.type] ?? "text-white"}`}>{step.label}</div>
                                                <p className="text-xs text-muted mt-0.5">{step.detail}</p>
                                                <div className="text-xs font-mono text-white/40 mt-1">confidence: {(step.confidence * 100).toFixed(0)}%</div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {isRunning && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2 }}
                                            className="text-xs font-mono text-primary text-center pt-2">
                                            ● Processing…
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Chronos Scrub Bar */}
                            {traceSteps.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <ChronosScrub
                                        steps={traceSteps.map(s => ({ step: 1, label: s.label, role: s.type }))}
                                        currentStep={currentStep}
                                        onStepChange={(idx) => {
                                            setReplayMode(true);
                                            setCurrentStep(idx);
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* React Flow DAG / Profile View */}
                        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden flex flex-col" style={{ height: 420 }}>
                            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                                <h2 className="text-xs font-mono text-muted uppercase tracking-widest">
                                    {viewMode === "reasoning" ? "Reasoning DAG" :
                                        viewMode === "genealogy" ? "Evolution Genealogy" :
                                            viewMode === "federation" ? "Federation Topology" : "Intelligence Profile"}
                                </h2>
                                <div className="flex gap-2">
                                    <button onClick={() => setViewMode("reasoning")} className={`px-2 py-1 rounded text-[10px] font-mono uppercase transition-colors ${viewMode === "reasoning" ? "bg-primary/20 text-primary border border-primary/50" : "bg-white/5 text-muted hover:text-white"}`}>
                                        Reasoning
                                    </button>
                                    <button onClick={() => setViewMode("genealogy")} className={`px-2 py-1 rounded text-[10px] font-mono uppercase transition-colors ${viewMode === "genealogy" ? "bg-primary/20 text-primary border border-primary/50" : "bg-white/5 text-muted hover:text-white"}`}>
                                        Genealogy
                                    </button>
                                    <button onClick={() => setViewMode("federation")} className={`px-2 py-1 rounded text-[10px] font-mono uppercase transition-colors ${viewMode === "federation" ? "bg-primary/20 text-primary border border-primary/50" : "bg-white/5 text-muted hover:text-white"}`}>
                                        Fed
                                    </button>
                                    <button onClick={() => setViewMode("profile")} className={`px-2 py-1 rounded text-[10px] font-mono uppercase transition-colors ${viewMode === "profile" ? "bg-primary/20 text-primary border border-primary/50" : "bg-white/5 text-muted hover:text-white"}`}>
                                        Profile
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 relative">
                                {viewMode === "profile" ? (
                                    <div className="absolute inset-0 p-6 overflow-auto custom-scrollbar">
                                        <ResearcherProfile />
                                    </div>
                                ) : (
                                    <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView proOptions={{ hideAttribution: true }}
                                        style={{ background: "transparent" }}>
                                        <Background color="rgba(255,255,255,0.03)" gap={16} />
                                        <Controls style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                                    </ReactFlow>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </RoleGate>
    );
}
