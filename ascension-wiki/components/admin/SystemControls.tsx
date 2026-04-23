"use client";

import { motion } from "framer-motion";
import { Zap, Power, ShieldOff, Gauge, Globe, Layers, AlertOctagon, RotateCcw, Github, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function SystemControls() {
    const [surgeLimit, setSurgeLimit] = useState(1.2);
    const [activeAgents, setActiveAgents] = useState(0);

    useEffect(() => {
        // Mock SSE streaming telemetry of active routing delegates
        setActiveAgents(12);
        const iv = setInterval(() => {
            setActiveAgents(Math.floor(Math.random() * 5) + 12);
        }, 3000);
        return () => clearInterval(iv);
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Global Toggles */}
            <div className="flex flex-col gap-6">
                <ControlSection title="Operational Guardrails">
                    <ToggleItem
                        icon={<ShieldOff size={16} />}
                        label="Global Rate Limiting"
                        description="Enforce platform-wide request capping."
                        enabled={true}
                    />
                    <ToggleItem
                        icon={<Globe size={16} />}
                        label="Public Execution Sandbox"
                        description="Enable/Disable public access to swarm endpoints."
                        enabled={true}
                    />
                    <ToggleItem
                        icon={<Layers size={16} />}
                        label="Meta-Evolution Protocol"
                        description="Allow agents to self-modify system architecture."
                        enabled={false}
                    />
                </ControlSection>

                <ControlSection title="Economy Management">
                    <div className="flex flex-col gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Surge Overload Limit</span>
                                <span className="text-[9px] text-muted/40 uppercase font-mono">Dynamic Pricing Cap</span>
                            </div>
                            <span className="text-xl font-bold font-mono text-primary" aria-live="polite">{surgeLimit}x</span>
                        </div>
                        <input 
                            type="range" 
                            aria-label="Surge Overload Limit"
                            min="1.0" max="3.0" step="0.1" 
                            value={surgeLimit}
                            onChange={(e) => setSurgeLimit(parseFloat(e.target.value))}
                            className="w-full accent-primary h-1 bg-white/10 rounded-full appearance-none cursor-pointer" 
                        />
                    </div>
                </ControlSection>

                <ControlSection title="Integrations & Hooks">
                    <ToggleItem
                        icon={<Github size={16} />}
                        label="Github App Connection"
                        description="Linked: TejasSinha12/Astraeus (main branch AST mapping)"
                        enabled={true}
                    />
                </ControlSection>
            </div>

            {/* Emergency & Advanced Controls */}
            <div className="flex flex-col gap-6">
                <ControlSection title="Extreme Measures">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl mb-2">
                            <div className="flex items-center gap-3">
                                <Activity size={16} className="text-primary animate-pulse" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Active Orchestrator Agents</span>
                                    <span className="text-[9px] text-muted/60 uppercase font-mono mt-0.5">Live telemetry streaming across clusters</span>
                                </div>
                            </div>
                            <span className="text-sm font-bold font-mono text-primary animate-pulse">{activeAgents} NODE</span>
                        </div>

                        <ActionButton
                            icon={<AlertOctagon size={18} />}
                            label="Force Forge Global Pause"
                            description="Immediately suspend ALL active swarm missions without data loss."
                            variant="danger"
                        />
                        <ActionButton
                            icon={<RotateCcw size={18} />}
                            label="Re-Sync Distributed Memory"
                            description="Purge and re-index federated knowledge graphs."
                            variant="warning"
                        />
                    </div>
                </ControlSection>

                <ControlSection title="Model Routing">
                    <div className="space-y-3">
                        <RoutingItem label="A-Level reasoning" model="GPT-4o / Claude 3.5" active />
                        <RoutingItem label="B-Level logic" model="GPT-4o-mini" active />
                        <RoutingItem label="Fallback execution" model="Llama-3-70B" />
                    </div>
                </ControlSection>
            </div>
        </div>
    );
}

function ControlSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-4" role="region" aria-label={title}>
            <h3 className="text-xs font-mono text-muted uppercase tracking-[0.3em] font-bold">{title}</h3>
            {children}
        </div>
    );
}

function ToggleItem({ icon, label, description, enabled }: { icon: React.ReactNode, label: string, description: string, enabled: boolean }) {
    const [isOn, setIsOn] = useState(enabled);
    return (
        <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-all">
            <div className="flex items-center gap-4">
                <div className={cn("p-2 rounded-lg border", isOn ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-white/10 text-muted")}>
                    {icon}
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">{label}</span>
                    <span className="text-[9px] text-muted/40 uppercase font-mono mt-0.5">{description}</span>
                </div>
            </div>
            <button
                role="switch"
                aria-checked={isOn}
                aria-label={`Toggle ${label}`}
                onClick={() => setIsOn(!isOn)}
                className={cn(
                    "w-10 h-5 rounded-full relative transition-all duration-300",
                    isOn ? "bg-primary" : "bg-white/10"
                )}
            >
                <div className={cn(
                    "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                    isOn ? "right-1" : "left-1"
                )} />
            </button>
        </div>
    );
}

function ActionButton({ icon, label, description, variant }: { icon: React.ReactNode, label: string, description: string, variant: "danger" | "warning" | "normal" }) {
    return (
        <button className={cn(
            "flex items-center gap-4 p-4 border rounded-xl transition-all text-left group active:scale-[0.98]",
            variant === "danger" ? "bg-red-500/5 border-red-500/20 hover:bg-red-500/10" :
                variant === "warning" ? "bg-yellow-500/5 border-yellow-500/20 hover:bg-yellow-500/10" :
                    "bg-white/5 border-white/10 hover:bg-white/10"
        )}>
            <div className={cn(
                "p-2 rounded-lg border",
                variant === "danger" ? "bg-red-500/20 border-red-500/30 text-red-500" :
                    variant === "warning" ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-500" :
                        "bg-white/10 border-white/20 text-white"
            )}>
                {icon}
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">{label}</span>
                    <Zap size={10} className="text-white/20 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-[9px] text-muted/40 uppercase font-mono mt-0.5">{description}</p>
            </div>
        </button>
    );
}

function RoutingItem({ label, model, active }: { label: string, model: string, active?: boolean }) {
    return (
        <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-lg">
            <div className="flex flex-col">
                <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">{label}</span>
                <span className="text-[10px] font-mono text-white/90">{model}</span>
            </div>
            <div className={cn("px-2 py-0.5 rounded text-[8px] font-bold uppercase", active ? "bg-primary/20 text-primary border border-primary/40" : "bg-white/5 text-muted/30")}>
                {active ? "Active" : "Standby"}
            </div>
        </div>
    );
}
