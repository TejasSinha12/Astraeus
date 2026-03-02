"use client";

import { ReactFlow, Background, Controls, Handle, Position, type NodeTypes } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// ─── Custom DAG Node ─────────────────────────────────────────────────────────
function SwarmNode({ data }: { data: { label: string; status: "idle" | "active" | "done"; message?: string } }) {
    return (
        <div className={cn(
            "px-4 py-2 rounded-xl border text-[10px] font-mono transition-all duration-500 min-w-[120px]",
            data.status === "active" ? "bg-primary/20 border-primary text-white shadow-[0_0_20px_rgba(0,229,255,0.4)]" :
                data.status === "done" ? "bg-green-500/10 border-green-500/30 text-green-400" :
                    "bg-white/5 border-white/10 text-muted"
        )} title={data.message}>
            <Handle type="target" position={Position.Left} style={{ background: "transparent", border: "none" }} />
            <div className="flex flex-col gap-1 text-center font-bold tracking-tight">
                {data.label}
            </div>
            <Handle type="source" position={Position.Right} style={{ background: "transparent", border: "none" }} />
        </div>
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
                    message: stepMatch?.message
                }
            };
        });

        const updatedEdges = baseEdges.map(edge => {
            const sourceDone = updatedNodes.find(n => n.id === edge.source)?.data.status !== "idle";
            const targetDone = updatedNodes.find(n => n.id === edge.target)?.data.status !== "idle";
            return {
                ...edge,
                animated: sourceDone && isExecuting,
                style: { stroke: targetDone ? "#00e5ff" : sourceDone ? "#00e5ff44" : "#333" }
            };
        });

        setNodes(updatedNodes);
        setEdges(updatedEdges);
    }, [steps, isExecuting]);

    return (
        <div className="w-full h-[300px] glass-card border border-white/5 bg-black/20 rounded-xl overflow-hidden relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                proOptions={{ hideAttribution: true }}
                style={{ background: "transparent" }}
                zoomOnScroll={false}
                zoomOnPinch={false}
                panOnScroll={false}
                panOnDrag={true}
            >
                <Background color="rgba(255,255,255,0.02)" gap={20} />
            </ReactFlow>

            <div className="absolute bottom-4 left-4 flex gap-4 text-[8px] font-mono text-muted uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Done</div>
                <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Active</div>
                <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-white/10" /> Idle</div>
            </div>
        </div>
    );
}
