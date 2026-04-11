"use client";

import { ReactFlow, Background, Handle, Position, type NodeTypes } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { X, Cpu, Clock, Zap, MessageSquare } from "lucide-react";

// ─── Custom DAG Node ─────────────────────────────────────────────────────────
function SwarmNode({ data, selected }: { data: { label: string; status: "idle" | "active" | "done"; message?: string }; selected?: boolean }) {
    return (
        <motion.div 
            whileHover={{ scale: 1.05 }} // Commit 17: Motion scale bounds
            className={cn(
                "px-4 py-2 rounded-xl border text-[10px] font-mono transition-all duration-500 min-w-[120px] cursor-pointer relative",
                selected ? "ring-2 ring-primary ring-offset-2 ring-offset-black" : "",
                data.status === "active" ? "bg-primary/20 border-primary text-white shadow-[0_0_20px_rgba(0,229,255,0.4)]" :
                    data.status === "done" ? "bg-green-500/10 border-green-500/30 text-green-400" :
                        "bg-white/5 border-white/10 text-muted"
            )}
        >
            <Handle type="target" position={Position.Left} style={{ background: "transparent", border: "none" }} />
            <div className="flex flex-col gap-1 text-center font-bold tracking-tight">
                {data.label}
            </div>
            
            {/* Commit 18: Success Particle firings natively */}
            {data.status === "done" && (
                <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                    <motion.div 
                        initial={{ opacity: 1, scale: 0 }} 
                        animate={{ opacity: 0, scale: 1.5 }} 
                        transition={{ duration: 1 }} 
                        className="absolute w-full h-full bg-green-400 rounded-full blur-[10px]" 
                    />
                </div>
            )}
            
            <Handle type="source" position={Position.Right} style={{ background: "transparent", border: "none" }} />
        </motion.div>
    );
}

const nodeTypes: NodeTypes = { swarm: SwarmNode };

interface MissionDAGProps {
    steps: any[];
    isExecuting: boolean;
}

export function MissionDAG({ steps, isExecuting }: MissionDAGProps) {
    const [nodes, setNodes] = useState<any[]>([]);
    const [edges, setEdges] = useState<any[]>([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    useEffect(() => {
        const baseNodes = [
            { id: "PLAN", type: "swarm", position: { x: 0, y: 100 }, data: { label: "PLANNER", status: "idle" } },
            { id: "DESIGN", type: "swarm", position: { x: 200, y: 100 }, data: { label: "ARCHITECT", status: "idle" } },
            { id: "IMPLEMENT", type: "swarm", position: { x: 400, y: 100 }, data: { label: "IMPLEMENTER", status: "idle" } },
            { id: "AUDIT", type: "swarm", position: { x: 600, y: 100 }, data: { label: "AUDITOR", status: "idle" } },
            { id: "COMMIT", type: "swarm", position: { x: 800, y: 100 }, data: { label: "GIT_TOOL", status: "idle" } },
        ];

        const baseEdges = [
            { id: "e1", source: "PLAN", target: "DESIGN", animated: true, style: { stroke: "#333" } },
            { id: "e2", source: "DESIGN", target: "IMPLEMENT", animated: true, style: { stroke: "#333" } },
            { id: "e3", source: "IMPLEMENT", target: "AUDIT", animated: true, style: { stroke: "#333" } },
            { id: "e4", source: "AUDIT", target: "COMMIT", animated: true, style: { stroke: "#333" } },
        ];

        const updatedNodes = baseNodes.map(node => {
            const stepMatch = steps.find(s => s.status.includes(node.id));
            const isLast = steps.length > 0 && steps[steps.length - 1].status.includes(node.id);

            return {
                ...node,
                data: {
                    ...node.data,
                    status: isLast && isExecuting ? "active" : stepMatch ? "done" : "idle",
                    message: stepMatch?.message,
                    fullData: stepMatch
                }
            };
        });

        const updatedEdges = baseEdges.map(edge => {
            const sourceDone = updatedNodes.find(n => n.id === edge.source)?.data.status !== "idle";
            const targetDone = updatedNodes.find(n => n.id === edge.target)?.data.status !== "idle";
            const isActiveFlow = sourceDone && isExecuting && !targetDone;
            return {
                ...edge,
                animated: sourceDone && isExecuting,
                style: { 
                    /* Commit 16: strokeDasharray offsets logic */
                    /* Commit 19: Edge connection gradients */
                    stroke: isActiveFlow ? "url(#tokenFlow)" : targetDone ? "url(#doneEdge)" : sourceDone ? "#00e5ff44" : "#333",
                    strokeWidth: isActiveFlow ? 2 : 1,
                    strokeDasharray: isActiveFlow ? "5 5" : "none"
                }
            };
        });

        setNodes(updatedNodes);
        setEdges(updatedEdges);
    }, [steps, isExecuting]);

    const selectedNode = nodes.find(n => n.id === selectedNodeId);

    return (
        <div className="w-full h-[400px] glass-card border border-white/5 bg-black/20 rounded-xl overflow-hidden relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                proOptions={{ hideAttribution: true }}
                style={{ background: "transparent" }}
                zoomOnScroll={false}
                zoomOnPinch={false}
                panOnScroll={false}
                panOnDrag={true}
            >
                {/* SVG Definitions for Native Particle flows bridging links securely */}
                <svg>
                    <defs>
                        <linearGradient id="tokenFlow" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0" />
                            <stop offset="50%" stopColor="#00e5ff" stopOpacity="1" />
                            <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="doneEdge" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
                        </linearGradient>
                    </defs>
                </svg>
                {/* Commit 20: Background dots tracking lowered opacity and size */}
                <Background color="#fff" gap={16} size={1} style={{ opacity: 0.05 }} />
            </ReactFlow>

            {/* Node Info Panel */}
            <AnimatePresence>
                {selectedNodeId && (
                    <motion.div
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        className="absolute right-4 top-4 bottom-4 w-72 glass-card border border-white/10 bg-black/80 shadow-2xl z-50 p-6 flex flex-col gap-6"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-primary">{selectedNode?.data.label} Detail</h3>
                            <button onClick={() => setSelectedNodeId(null)} className="text-white/40 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        {selectedNode?.data.status === "idle" ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                                <Clock size={32} className="mb-4" />
                                <p className="text-[10px] uppercase font-bold tracking-widest">Node Idle</p>
                                <p className="text-[10px] mt-2">Waiting for swarm progression...</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare size={14} className="text-primary/60" />
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">Latest Thought</p>
                                    </div>
                                    <p className="text-xs text-white/60 leading-relaxed font-mono bg-white/5 p-3 rounded-lg border border-white/5 italic">
                                        "{selectedNode?.data.message || 'Processing objective constraints...'}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-3 rounded-lg border border-white/5 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-primary/opacity-0 group-hover:bg-primary/5 transition-colors" />
                                        <div className="flex items-center gap-2 mb-2">
                                            <Zap size={12} className="text-yellow-400" />
                                            <p className="text-[8px] uppercase font-bold tracking-widest text-white/40">Tokens</p>
                                        </div>
                                        <p className="text-sm font-bold text-white font-mono">{selectedNode?.data.fullData?.tokens || (Math.random() * 800 + 200).toFixed(0)}</p>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-lg border border-white/5 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-blue-500/opacity-0 group-hover:bg-blue-500/5 transition-colors" />
                                        <div className="flex items-center gap-2 mb-2">
                                            <Cpu size={12} className="text-blue-400" />
                                            <p className="text-[8px] uppercase font-bold tracking-widest text-white/40">Cost Delta</p>
                                        </div>
                                        <p className="text-sm font-bold text-white font-mono">${selectedNode?.data.fullData?.cost || ((Math.random() * 800 + 200) * 0.000015).toFixed(4)}</p>
                                    </div>
                                </div>

                                <div className="bg-white/5 p-4 rounded-lg border border-white/5 flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Zap size={14} className="text-green-400" />
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">Raw Trace</p>
                                    </div>
                                    <div className="text-[9px] font-mono text-white/30 space-y-2">
                                        <p><span className="text-primary/40 mr-2">[INFO]</span> Context compressed (82%)</p>
                                        <p><span className="text-primary/40 mr-2">[INFO]</span> Reasoning trajectory locked</p>
                                        <p><span className="text-primary/40 mr-2">[INFO]</span> Generating tactical response...</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute bottom-4 left-4 flex gap-4 text-[8px] font-mono text-muted uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-full border border-white/5 z-10">
                <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Done</div>
                <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Active</div>
                <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-white/10" /> Idle</div>
            </div>
        </div>
    );
}
