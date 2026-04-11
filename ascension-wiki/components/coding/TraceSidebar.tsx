"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Terminal, ChevronDown, ChevronRight, Activity, Cpu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TraceStep {
    status: string;
    message: string;
    timestamp: string;
    confidence?: number;
    consensus_score?: number;
    voters?: string[];
    details?: any;
}

interface TraceSidebarProps {
    logs: string[];
    steps: TraceStep[];
    isExecuting: boolean;
}

export function TraceSidebar({ logs, steps, isExecuting }: TraceSidebarProps) {
    const [activeTab, setActiveTab] = useState<"logs" | "reasoning">("reasoning");

    return (
        <div className="flex flex-col h-full bg-black/20 border-l border-white/5 font-mono">
            {/* Tabs */}
            <div className="flex border-b border-white/5 bg-white/[0.02]">
                <button
                    onClick={() => setActiveTab("reasoning")}
                    className={cn(
                        "flex-1 px-4 py-3 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2",
                        activeTab === "reasoning" ? "border-primary text-white bg-primary/5" : "border-transparent text-muted hover:text-white"
                    )}
                >
                    <Activity size={12} className="inline mr-2" />
                    Reasoning Traces
                </button>
                <button
                    onClick={() => setActiveTab("logs")}
                    className={cn(
                        "flex-1 px-4 py-3 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2",
                        activeTab === "logs" ? "border-primary text-white bg-primary/5" : "border-transparent text-muted hover:text-white"
                    )}
                >
                    <Terminal size={12} className="inline mr-2" />
                    System Logs
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <AnimatePresence mode="wait">
                    {activeTab === "reasoning" ? (
                        <motion.div
                            key="reasoning"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <motion.div layout className="space-y-4"> {/* Commit 11: Wrap generic layout */}
                                {steps.length === 0 && !isExecuting && (
                                    <div className="text-center py-20 opacity-20">
                                        <Cpu size={32} className="mx-auto mb-4" />
                                        <p className="text-[10px] uppercase tracking-widest">Awaiting Swarm Trace...</p>
                                    </div>
                                )}
                                {steps.map((step, i) => (
                                    <ReasoningStep key={i} step={step} index={i} isExecuting={isExecuting && i === steps.length - 1} />
                                ))}
                            </motion.div>
                            {isExecuting && (
                                <div className="flex flex-col gap-1 p-3 rounded-lg bg-primary/5 border border-primary/20 animate-pulse">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        <span className="text-[10px] text-primary uppercase tracking-[0.2em]">Neural Chain Expanding...</span>
                                    </div>
                                    <span className="text-[7px] text-white/20 uppercase tracking-widest pl-5">Astraeus Engine v5.2.3</span>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="logs"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-1 text-[11px]"
                        >
                            {logs.map((log, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={cn(
                                        "flex gap-3 leading-relaxed py-1 px-2 rounded",
                                        log.includes("[ERROR]") ? "bg-red-500/10 border-l-2 border-red-500 text-red-400" :
                                            log.includes("[COMPLETED]") ? "text-green-400" :
                                                log.includes("[SYSTEM]") ? "text-primary/70" : "text-muted/80 hover:bg-white/[0.02]"
                                    )} // Commit 15: Log line trace offsets formatting
                                >
                                    <span className="text-muted/30 shrink-0 select-none font-mono tracking-widest">{(i + 1).toString().padStart(3, '0')}</span>
                                    <span className="break-all">{log}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Metrics */}
            <div className="p-3 border-t border-white/5 bg-black/40 flex items-center justify-between text-[9px] text-muted tracking-widest uppercase">
                <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full", isExecuting ? "bg-primary animate-pulse" : "bg-muted/20")} />
                    {isExecuting ? "Processing Flow" : "System Idle"}
                </div>
                <span>v5.2.3-STABLE</span>
            </div>
        </div>
    );
}

function ReasoningStep({ step, index, isExecuting }: { step: TraceStep, index: number, isExecuting?: boolean }) {
    const [isOpen, setIsOpen] = useState(index === 0); 

    return (
        <motion.div 
            layout 
            className={cn(
                "border rounded-lg overflow-hidden transition-all duration-300 relative",
                isOpen ? "bg-primary/[0.03] border-primary/20 shadow-[0_4px_20px_-10px_rgba(0,229,255,0.1)]" : "bg-white/[0.02] border-white/5 hover:border-white/10",
                isExecuting && "ring-1 ring-primary/50 shadow-[0_0_15px_rgba(0,229,255,0.2)]" // Commit 13: Active node ring bounds
            )}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                    isOpen ? "bg-primary/[0.05]" : "hover:bg-white/5"
                )}
            >
                {isOpen ? <ChevronDown size={14} className="text-primary" /> : <ChevronRight size={14} className="text-muted" />}
                <div className="flex-1">
                    <div className={cn(
                        "text-[10px] font-bold uppercase tracking-tighter transition-colors",
                        isOpen ? "text-primary" : "text-white"
                    )}>
                        {step.status}
                    </div>
                </div>
                {step.consensus_score && (
                    <div className="flex flex-col items-end mr-3 w-16">
                        <span className="text-[7px] text-muted/40 uppercase font-mono mb-0.5">Consensus</span>
                        <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden mt-0.5 relative">
                            {/* Commit 12: Consensus spans */}
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${step.consensus_score * 100}%` }}
                                className={cn("h-full absolute left-0 rounded-full", step.consensus_score > 0.8 ? "bg-green-400" : "bg-yellow-400")}
                            />
                        </div>
                    </div>
                )}
                {step.confidence && (
                    <div className="flex items-center gap-1.5 mr-2">
                        <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${step.confidence * 100}%` }}
                                className={cn(
                                    "h-full rounded-full",
                                    step.confidence > 0.8 ? "bg-primary" : step.confidence > 0.5 ? "bg-yellow-400" : "bg-red-500"
                                )}
                            />
                        </div>
                        <span className={cn(
                            "text-[8px] font-bold",
                            step.confidence > 0.8 ? "text-primary" : step.confidence > 0.5 ? "text-yellow-400" : "text-red-500"
                        )}>
                            {(step.confidence * 100).toFixed(0)}%
                        </span>
                    </div>
                )}
                <span className="text-[8px] font-mono text-muted/40 border border-white/5 px-1.5 py-0.5 rounded shadow-inner bg-black/40">
                    {/* Commit 14: Timestamp bounds */}
                    {step.timestamp.split('T')[1]?.split('.')[0] || step.timestamp}
                </span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-8 pb-3 text-[10px] text-muted/90 font-mono leading-relaxed border-t border-primary/10 pt-2.5">
                            {step.message}
                            {step.voters && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {step.voters.map((voter, idx) => (
                                        <span key={idx} className="px-1.5 py-0.5 rounded-sm bg-white/5 border border-white/5 text-[7px] uppercase tracking-tighter text-muted/40 hover:text-primary transition-colors cursor-default">
                                            {voter}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
