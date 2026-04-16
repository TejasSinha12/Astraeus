"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Settings2, X, Zap, ShieldCheck, Gauge, Cpu, MessageSquareQuote, Layers } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SwarmConfig {
    agents: {
        auditor: boolean;
        optimizer: boolean;
        critic: boolean;
    };
    creativity: number;
    strictness: number;
    useForge: boolean;
}

interface SwarmConfiguratorProps {
    isOpen: boolean;
    onClose: () => void;
    config: SwarmConfig;
    onChange: (config: SwarmConfig) => void;
}

export function SwarmConfigurator({ isOpen, onClose, config, onChange }: SwarmConfiguratorProps) {
    const toggleAgent = (agent: keyof SwarmConfig['agents']) => {
        onChange({
            ...config,
            agents: {
                ...config.agents,
                [agent]: !config.agents[agent]
            }
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-surface border-l border-white/10 shadow-2xl overflow-y-auto custom-scrollbar flex flex-col"
                    >
                        <div className="p-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-surface/80 backdrop-blur-md z-10 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg">
                                    <Settings2 className="text-primary w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Swarm Tuning</h3>
                                    <p className="text-[8px] text-muted uppercase tracking-widest mt-1">Cognitive Override Layer</p>
                                </div>
                            </div>
                            <button onClick={onClose} aria-label="Close Configurator" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-6 space-y-8">
                            <section className="space-y-4">
                                <h4 className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                    <Layers size={12} /> Evolutionary Execution
                                </h4>
                                <AgentToggle
                                    label="The Forge (Multi-Branch)"
                                    description="Spawn parallel architectures (Perf/Scale/Elegant)"
                                    active={config.useForge}
                                    onClick={() => onChange({ ...config, useForge: !config.useForge })}
                                    icon={<Layers size={14} className={config.useForge ? "text-[#ff6b6b]" : ""} />}
                                    badge="BETA"
                                />
                            </section>

                            {/* Agent Selection */}
                            <section className="space-y-4">
                                <h4 className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                    <Cpu size={12} /> Workforce Modulation
                                </h4>
                                <motion.div layout className="space-y-2"> {/* Commit 25: Layout bounds */}
                                    <AgentToggle
                                        label="Auditor Specialist"
                                        description="Security & Logic Verification"
                                        active={config.agents.auditor}
                                        onClick={() => toggleAgent('auditor')}
                                        icon={<ShieldCheck size={14} />}
                                        accent="text-[#34d399]" // Commit 22: Toggle elements accents
                                        bgAccent="bg-[#34d399]"
                                    />
                                    <AgentToggle
                                        label="Performance Optimizer"
                                        description="Efficiency Pass & Refactoring"
                                        active={config.agents.optimizer}
                                        onClick={() => toggleAgent('optimizer')}
                                        icon={<Zap size={14} />}
                                        accent="text-[#fbbf24]"
                                        bgAccent="bg-[#fbbf24]"
                                    />
                                    <AgentToggle
                                        label="Critical Reviewer"
                                        description="Recursive Logic Critique"
                                        active={config.agents.critic}
                                        onClick={() => toggleAgent('critic')}
                                        icon={<MessageSquareQuote size={14} />}
                                        accent="text-[#a855f7]"
                                        bgAccent="bg-[#a855f7]"
                                    />
                                </motion.div>
                            </section>

                            {/* Parameter Sliders */}
                            <section className="space-y-6">
                                <h4 className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                    <Gauge size={12} /> Neural Parameters
                                </h4>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] text-muted uppercase tracking-widest">Creativity</label>
                                        <span className="text-[10px] font-mono text-primary">{(config.creativity * 100).toFixed(0)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={config.creativity}
                                        onChange={(e) => onChange({ ...config, creativity: parseFloat(e.target.value) })}
                                        className="w-full accent-primary bg-white/5 rounded-lg appearance-none h-1.5"
                                    />
                                    <p className="text-[9px] text-muted/40 italic">Higher = More abstract solutions</p>
                                </div>

                                <div className="space-y-3 relative group/slider">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] text-muted uppercase tracking-widest">Strictness</label>
                                        <span className="text-[10px] font-mono text-primary group-hover/slider:scale-110 transition-transform">{(config.strictness * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="relative">
                                        {/* Commit 21: Value overlays over input bounds explicitly rendering visual nodes natively */}
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.05"
                                            value={config.strictness}
                                            onChange={(e) => onChange({ ...config, strictness: parseFloat(e.target.value) })}
                                            className="w-full accent-primary bg-white/5 rounded-lg appearance-none h-1.5 relative z-10 cursor-pointer"
                                        />
                                    </div>
                                    <p className="text-[9px] text-muted/40 italic">Higher = Robust standard adherence</p>
                                </div>
                            </section>

                            <div className="pt-6 border-t border-white/5">
                                <p className="text-[8px] text-muted/40 leading-relaxed uppercase tracking-widest">
                                    NOTE: Enabling additional agents increases the token cost per execution step.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function AgentToggle({ label, description, active, onClick, icon, badge, accent, bgAccent }: { label: string, description: string, active: boolean, onClick: () => void, icon: React.ReactNode, badge?: string, accent?: string, bgAccent?: string }) {
    // Commit 24: Active Agent Shadow pulses mapped below the agent blocks dynamically
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full p-4 rounded-xl border flex items-center gap-4 transition-all text-left group relative",
                active
                    ? "bg-primary/5 border-primary/30 text-white shadow-[0_0_15px_rgba(0,229,255,0.1)]"
                    : "bg-white/[0.02] border-white/5 text-muted hover:border-white/10"
            )}
        >
            <div className={cn(
                "p-2 rounded-lg transition-colors border",
                active ? `bg-[#0a0a0a] ${accent || "text-primary"} border-primary/20 ${bgAccent ? "shadow-[0_0_10px_" + bgAccent + "_0.5]" : ""}` : "bg-white/5 text-muted group-hover:text-white border-transparent"
            )}>
                {icon}
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <h5 className="text-[11px] font-bold uppercase tracking-tight">{label}</h5>
                    {badge && <span className="text-[8px] bg-[#ff6b6b]/20 text-[#ff6b6b] border border-[#ff6b6b]/30 px-1.5 py-0.5 rounded-md font-mono">{badge}</span>}
                </div>
                <p className="text-[9px] opacity-40 mt-0.5">{description}</p>
            </div>
            <div className={cn(
                "w-8 h-4 rounded-full relative transition-colors",
                active ? (bgAccent || "bg-primary") : "bg-white/10"
            )}>
                <motion.div
                    animate={{ x: active ? 16 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute inset-y-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm"
                />
            </div>
        </button>
    );
}
