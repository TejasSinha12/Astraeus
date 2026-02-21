"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Zap, Brain, Cpu, SlidersHorizontal, GitBranch, Database } from "lucide-react";
import { TIMELINE_EVENTS, type TimelineType } from "@/lib/mock-data";

const TYPE_CONFIG: Record<TimelineType, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
    release: { label: "Release", color: "text-primary", bg: "bg-primary/10 border-primary/30", Icon: Zap },
    heuristic: { label: "Heuristic", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30", Icon: SlidersHorizontal },
    memory: { label: "Memory", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30", Icon: Database },
    calibration: { label: "Calibration", color: "text-green-400", bg: "bg-green-500/10 border-green-500/30", Icon: Brain },
    swarm: { label: "Swarm", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30", Icon: Cpu },
};

const FILTER_TYPES: (TimelineType | "all")[] = ["all", "release", "heuristic", "memory", "calibration", "swarm"];

export default function EvolutionPage() {
    const [expanded, setExpanded] = useState<string | null>(null);
    const [filter, setFilter] = useState<TimelineType | "all">("all");

    const filtered = filter === "all" ? TIMELINE_EVENTS : TIMELINE_EVENTS.filter((e) => e.type === filter);

    return (
        <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                <div className="text-xs font-mono text-primary uppercase tracking-widest mb-2">System History</div>
                <h1 className="text-4xl font-bold text-white">Evolution Timeline</h1>
                <p className="text-muted mt-1">Every milestone, heuristic promotion, and architectural upgrade</p>
            </motion.div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-12">
                {FILTER_TYPES.map((type) => {
                    const cfg = type !== "all" ? TYPE_CONFIG[type] : null;
                    return (
                        <button key={type} onClick={() => setFilter(type)}
                            className={`px-3 py-1 rounded-full text-xs font-mono border transition-all capitalize ${filter === type ? (cfg ? `${cfg.bg} ${cfg.color}` : "bg-white/20 text-white border-white/30") : "text-muted border-white/10 hover:text-white"}`}>
                            {type}
                        </button>
                    );
                })}
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-white/10 to-transparent" />

                <div className="space-y-4">
                    {filtered.map((event, i) => {
                        const { label, color, bg, Icon } = TYPE_CONFIG[event.type];
                        const isOpen = expanded === event.id;

                        return (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.07, duration: 0.4 }}
                                className="relative pl-12"
                            >
                                {/* Timeline Node */}
                                <div className={`absolute left-0 top-4 w-8 h-8 rounded-full flex items-center justify-center border ${bg} z-10`}>
                                    <Icon size={14} className={color} />
                                </div>

                                {/* Card */}
                                <div className={`glass-card rounded-2xl border border-white/5 overflow-hidden transition-all ${isOpen ? "border-white/15" : ""}`}>
                                    <button
                                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
                                        onClick={() => setExpanded(isOpen ? null : event.id)}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${bg} ${color}`}>{label}</span>
                                                <span className="text-xs font-mono text-muted">{event.date}</span>
                                            </div>
                                            <h3 className="text-white font-semibold">{event.title}</h3>
                                            <p className="text-muted text-sm mt-0.5">{event.summary}</p>
                                        </div>
                                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                            <ChevronDown size={16} className="text-muted shrink-0 ml-4" />
                                        </motion.div>
                                    </button>

                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-6 pb-5 border-t border-white/5 pt-4">
                                                    <p className="text-sm text-muted leading-relaxed font-mono">{event.detail}</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
