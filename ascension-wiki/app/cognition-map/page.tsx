"use client";

export const dynamic = "force-dynamic";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ReactFlow, Background, Controls, Handle, Position, type NodeTypes, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Brain, Database, Zap, SlidersHorizontal, GitBranch, Shield, ArrowRight, Cpu, Activity } from "lucide-react";

const NODE_CONFIGS: Record<string, { label: string; desc: string; color: string; icon: React.ElementType; detail: string; metrics?: { label: string; value: string }[] }> = {
    input: {
        label: "Input", icon: ArrowRight, color: "#00e5ff",
        desc: "Receives raw user goal or task description.",
        detail: "Accepts natural language task descriptions. Routes to the GoalPlanner for decomposition. Validates input schema and sanitizes for injection attacks.",
        metrics: [{ label: "Avg Input Tokens", value: "312" }, { label: "Sanitization Pass Rate", value: "99.7%" }],
    },
    planner: {
        label: "Planner", icon: Brain, color: "#a78bfa",
        desc: "GoalPlanner decomposes goals into DAG subtasks.",
        detail: "Uses LLM structured output (Pydantic) to generate a Plan with up to 8 executable TaskDefinitions. Creates dependency ordering and expected outcomes per task.",
        metrics: [{ label: "Avg Tasks/Plan", value: "4.2" }, { label: "Plan Accuracy", value: "87.3%" }],
    },
    reasoner: {
        label: "Reasoner", icon: Cpu, color: "#34d399",
        desc: "ReasoningEngine executes LLM calls with strict schemas.",
        detail: "Wraps all OpenAI calls in retry logic, response validation, and schema enforcement using Pydantic BaseModel. Tracks token usage and handles streaming.",
        metrics: [{ label: "Avg Latency", value: "1.24s" }, { label: "Schema Compliance", value: "98.9%" }],
    },
    decision: {
        label: "Decision", icon: Activity, color: "#fb923c",
        desc: "DecisionEngine selects next action per step.",
        detail: "Returns one of three actions: USE_TOOL, TASK_COMPLETE, or FAIL. Uses heuristic-augmented prompting to improve decision confidence. Tracked against benchmark baselines.",
        metrics: [{ label: "TASK_COMPLETE Rate", value: "91.2%" }, { label: "FAIL Rate", value: "4.1%" }],
    },
    tool: {
        label: "Tool", icon: Zap, color: "#f472b6",
        desc: "ToolExecutor runs sandboxed tool operations.",
        detail: "All tools inherit BaseTool with a strict args schema and are executed in a try/catch sandbox. Results are stringified for memory ingestion regardless of success or failure.",
        metrics: [{ label: "Tool Success Rate", value: "94.8%" }, { label: "Avg Execution Time", value: "0.83s" }],
    },
    memory: {
        label: "Memory", icon: Database, color: "#60a5fa",
        desc: "Short-term + FAISS vector memory systems.",
        detail: "ShortTermMemory maintains a rotating context buffer. FAISS vector store enables semantic retrieval. Memory Optimizer prunes low-signal episodes based on composite quality score.",
        metrics: [{ label: "Retrieval Accuracy", value: "82.4%" }, { label: "Memory Hit Rate", value: "67.1%" }],
    },
    reflection: {
        label: "Reflect", icon: GitBranch, color: "#34d399",
        desc: "Generates heuristic hypotheses from failed tasks.",
        detail: "On task completion or failure, the Reflection module analyzes the execution trace and generates candidate heuristic rules for A/B testing by the Optimizer.",
        metrics: [{ label: "Avg Rules/Session", value: "2.3" }, { label: "Promotion Rate", value: "38%" }],
    },
    optimizer: {
        label: "Optimizer", icon: SlidersHorizontal, color: "#a78bfa",
        desc: "A/B tests heuristics and promotes winning rules.",
        detail: "Runs 3-round A/B benchmark sweeps on proposed heuristics before promoting to the system prompt. Uses Welch's t-test for statistical significance. ECE tracked for calibration.",
        metrics: [{ label: "False Promotions Blocked", value: "61%" }, { label: "Avg Uplift/Promotion", value: "+3.2%" }],
    },
    versioning: {
        label: "Versioning", icon: Shield, color: "#f87171",
        desc: "Snapshots and rollback for vectors + heuristics.",
        detail: "Creates versioned snapshots of FAISS indices and heuristic weights at every release. Admin-triggered rollback restores previous cognitive state within seconds.",
        metrics: [{ label: "Snapshots Stored", value: "3" }, { label: "Rollback Time", value: "< 2s" }],
    },
};

function CognitionNode({ data }: { data: { nodeId: string; isSelected: boolean; onSelect: (id: string) => void } }) {
    const cfg = NODE_CONFIGS[data.nodeId];
    if (!cfg) return null;
    const Icon = cfg.icon;
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => data.onSelect(data.nodeId)}
            className={`px-5 py-3 rounded-2xl border cursor-pointer transition-all duration-300 ${data.isSelected
                    ? "shadow-[0_0_30px_var(--glow)] scale-105"
                    : "hover:shadow-[0_0_15px_var(--glow)]"
                }`}
            style={{
                background: `rgba(${hexToRgb(cfg.color)}, 0.08)`,
                borderColor: `rgba(${hexToRgb(cfg.color)}, ${data.isSelected ? 0.8 : 0.25})`,
                "--glow": cfg.color,
            } as React.CSSProperties}
        >
            <Handle type="target" position={Position.Left} style={{ background: "transparent", border: "none", width: 0, height: 0 }} />
            <div className="flex items-center gap-2">
                <Icon size={14} style={{ color: cfg.color }} />
                <span className="text-xs font-mono font-bold text-white">{cfg.label}</span>
            </div>
            <p className="text-xs mt-1 font-mono" style={{ color: `rgba(${hexToRgb(cfg.color)}, 0.7)` }}>{cfg.desc}</p>
            <Handle type="source" position={Position.Right} style={{ background: "transparent", border: "none", width: 0, height: 0 }} />
        </motion.div>
    );
}

function hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
}

const nodeTypes: NodeTypes = { cognition: CognitionNode };

export default function CognitionMapPage() {
    const [selected, setSelected] = useState<string | null>("input");

    const handleSelect = useCallback((id: string) => {
        setSelected((prev) => (prev === id ? null : id));
    }, []);

    const FLOW_NODES: Node[] = [
        { id: "input", type: "cognition", position: { x: 0, y: 160 }, data: { nodeId: "input", isSelected: selected === "input", onSelect: handleSelect } },
        { id: "planner", type: "cognition", position: { x: 200, y: 80 }, data: { nodeId: "planner", isSelected: selected === "planner", onSelect: handleSelect } },
        { id: "reasoner", type: "cognition", position: { x: 200, y: 240 }, data: { nodeId: "reasoner", isSelected: selected === "reasoner", onSelect: handleSelect } },
        { id: "decision", type: "cognition", position: { x: 420, y: 160 }, data: { nodeId: "decision", isSelected: selected === "decision", onSelect: handleSelect } },
        { id: "tool", type: "cognition", position: { x: 620, y: 60 }, data: { nodeId: "tool", isSelected: selected === "tool", onSelect: handleSelect } },
        { id: "memory", type: "cognition", position: { x: 620, y: 260 }, data: { nodeId: "memory", isSelected: selected === "memory", onSelect: handleSelect } },
        { id: "reflection", type: "cognition", position: { x: 820, y: 160 }, data: { nodeId: "reflection", isSelected: selected === "reflection", onSelect: handleSelect } },
        { id: "optimizer", type: "cognition", position: { x: 1020, y: 80 }, data: { nodeId: "optimizer", isSelected: selected === "optimizer", onSelect: handleSelect } },
        { id: "versioning", type: "cognition", position: { x: 1020, y: 260 }, data: { nodeId: "versioning", isSelected: selected === "versioning", onSelect: handleSelect } },
    ];

    const FLOW_EDGES = [
        { id: "e1", source: "input", target: "planner", animated: true, style: { stroke: "rgba(0,229,255,0.3)", strokeWidth: 1.5 } },
        { id: "e2", source: "input", target: "reasoner", animated: true, style: { stroke: "rgba(52,211,153,0.3)", strokeWidth: 1.5 } },
        { id: "e3", source: "planner", target: "decision", animated: true, style: { stroke: "rgba(167,139,250,0.3)", strokeWidth: 1.5 } },
        { id: "e4", source: "reasoner", target: "decision", animated: true, style: { stroke: "rgba(52,211,153,0.3)", strokeWidth: 1.5 } },
        { id: "e5", source: "decision", target: "tool", animated: true, style: { stroke: "rgba(244,114,182,0.4)", strokeWidth: 1.5 } },
        { id: "e6", source: "decision", target: "memory", animated: true, style: { stroke: "rgba(96,165,250,0.4)", strokeWidth: 1.5 } },
        { id: "e7", source: "tool", target: "reflection", animated: true, style: { stroke: "rgba(52,211,153,0.3)", strokeWidth: 1.5 } },
        { id: "e8", source: "memory", target: "reflection", animated: true, style: { stroke: "rgba(52,211,153,0.3)", strokeWidth: 1.5 } },
        { id: "e9", source: "reflection", target: "optimizer", animated: true, style: { stroke: "rgba(167,139,250,0.4)", strokeWidth: 1.5 } },
        { id: "e10", source: "reflection", target: "versioning", animated: true, style: { stroke: "rgba(248,113,113,0.4)", strokeWidth: 1.5 } },
        { id: "e11", source: "optimizer", target: "planner", animated: true, style: { stroke: "rgba(167,139,250,0.2)", strokeWidth: 1, strokeDasharray: "4 2" } },
    ];

    const selectedCfg = selected ? NODE_CONFIGS[selected] : null;

    return (
        <div className="flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
                <div>
                    <div className="text-xs font-mono text-primary uppercase tracking-widest mb-0.5">Architecture</div>
                    <h1 className="text-xl font-bold text-white">Cognition Map</h1>
                </div>
                <p className="text-muted text-xs font-mono hidden md:block">Click any node to inspect</p>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Flow Canvas */}
                <div className="flex-1 relative">
                    <ReactFlow
                        nodes={FLOW_NODES} edges={FLOW_EDGES} nodeTypes={nodeTypes}
                        fitView proOptions={{ hideAttribution: true }}
                        style={{ background: "transparent" }}
                        nodesDraggable={false} nodesConnectable={false}
                    >
                        <Background color="rgba(0,229,255,0.04)" gap={24} />
                        <Controls style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                    </ReactFlow>
                </div>

                {/* Side Panel */}
                <AnimatePresence>
                    {selectedCfg && selected && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="shrink-0 border-l border-white/5 overflow-hidden"
                            style={{ background: "rgba(11,15,25,0.95)" }}
                        >
                            <div className="p-6 w-80">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-xl" style={{ background: `rgba(${hexToRgb(selectedCfg.color)}, 0.12)` }}>
                                        <selectedCfg.icon size={18} style={{ color: selectedCfg.color }} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{selectedCfg.label}</h3>
                                        <p className="text-xs text-muted">{selectedCfg.desc}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-muted/80 leading-relaxed mb-5">{selectedCfg.detail}</p>
                                {selectedCfg.metrics && (
                                    <div className="space-y-2">
                                        {selectedCfg.metrics.map((m) => (
                                            <div key={m.label} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                                                <span className="text-xs text-muted font-mono">{m.label}</span>
                                                <span className="text-xs font-mono font-bold" style={{ color: selectedCfg.color }}>{m.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
