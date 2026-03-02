"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Terminal, ChevronDown, ChevronRight, Activity, Cpu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TraceStep {
    status: string;
    message: string;
    timestamp: string;
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
                            {steps.length === 0 && !isExecuting && (
                                <div className="text-center py-20 opacity-20">
                                    <Cpu size={32} className="mx-auto mb-4" />
                                    <p className="text-[10px] uppercase tracking-widest">Awaiting Swarm Trace...</p>
                                </div>
                            )}
                            {steps.map((step, i) => (
                                <ReasoningStep key={i} step={step} index={i} />
                            ))}
                            {isExecuting && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20 animate-pulse">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <span className="text-[10px] text-primary uppercase tracking-[0.2em]">Neural Chain Expanding...</span>
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
                                <div key={i} className="flex gap-3 leading-relaxed py-0.5">
                                    <span className="text-muted/30 shrink-0 select-none">{(i + 1).toString().padStart(3, '0')}</span>
                                    <span className={cn(
                                        "break-all",
                                        log.includes("[ERROR]") ? "text-red-400" :
                                            log.includes("[COMPLETED]") ? "text-green-400" :
                                                log.includes("[SYSTEM]") ? "text-primary/70" : "text-muted/80"
                                    )}>
                                        {log}
                                    </span>
                                </div>
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
                <span>v5.0.0-PROD</span>
            </div>
        </div>
    );
}

function ReasoningStep({ step, index }: { step: TraceStep, index: number }) {
    const [isOpen, setIsOpen] = useState(index === 0); // Open first step by default

    return (
        <div className="border border-white/5 rounded-lg overflow-hidden transition-all hover:border-white/10 bg-white/[0.02]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-white/5"
            >
                {isOpen ? <ChevronDown size={14} className="text-primary" /> : <ChevronRight size={14} className="text-muted" />}
                <div className="flex-1">
                    <div className="text-[10px] font-bold text-white uppercase tracking-tighter">
                        {step.status}
                    </div>
                </div>
                <span className="text-[8px] text-muted/30">{step.timestamp}</span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-8 pb-3 text-[10px] text-muted/80 leading-relaxed border-t border-white/5 pt-2">
                            {step.message}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
