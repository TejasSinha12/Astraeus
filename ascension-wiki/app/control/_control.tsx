"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, RotateCcw, SlidersHorizontal, Cpu, X, ShieldAlert } from "lucide-react";
import { RoleGate } from "@/components/auth/RoleGate";

const VERSIONS = ["v0.1.0-alpha", "v0.0.9-pre", "v0.0.8-pre"];

function ConfirmModal({ isOpen, onClose, onConfirm, title, description, confirmLabel, danger = false }: {
    isOpen: boolean; onClose: () => void; onConfirm: () => void;
    title: string; description: string; confirmLabel: string; danger?: boolean;
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
                    <motion.div
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
                        initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
                        transition={{ type: "spring", bounce: 0.25 }}
                    >
                        <div className={`glass-card rounded-2xl p-8 border ${danger ? "border-red-500/30" : "border-primary/30"}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-lg ${danger ? "bg-red-500/10" : "bg-primary/10"}`}>
                                    {danger ? <AlertTriangle className="text-red-400" size={20} /> : <ShieldAlert className="text-primary" size={20} />}
                                </div>
                                <h3 className="text-lg font-bold text-white">{title}</h3>
                                <button onClick={onClose} className="ml-auto text-muted hover:text-white transition-colors"><X size={18} /></button>
                            </div>
                            <p className="text-muted text-sm mb-6">{description}</p>
                            <div className="flex gap-3">
                                <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-white/10 text-muted hover:text-white hover:border-white/20 transition-all text-sm">Cancel</button>
                                <button
                                    onClick={() => { onConfirm(); onClose(); }}
                                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${danger ? "bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]" : "bg-primary hover:bg-primary/90 text-background shadow-[0_0_20px_rgba(0,229,255,0.3)]"}`}
                                >
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default function ControlClient() {
    const [haltModal, setHaltModal] = useState(false);
    const [rollbackModal, setRollbackModal] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState(VERSIONS[1]);
    const [optimizerOn, setOptimizerOn] = useState(true);
    const [agentSlot, setAgentSlot] = useState(4);
    const [haltTriggered, setHaltTriggered] = useState(false);
    const [rollbackTriggered, setRollbackTriggered] = useState<string | null>(null);

    return (
        <RoleGate allowedRole="admin">
            <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <div className="flex items-center gap-2 text-xs font-mono text-red-400 uppercase tracking-widest mb-2">
                        <ShieldAlert size={12} />
                        Admin Control Panel — Restricted Access
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">System Control</h1>
                    <p className="text-muted mt-1">Critical system operations and safety controls</p>
                </motion.div>

                <div className="space-y-6">
                    {/* Emergency Halt */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="glass-card rounded-2xl border border-red-500/20 p-6 relative overflow-hidden">
                        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-red-500/5 blur-[80px]" />
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                                    <AlertTriangle className="text-red-400" size={18} />Emergency Global Halt
                                </h2>
                                <p className="text-muted text-sm max-w-sm">Immediately terminates all active cognitive loops across every registered agent in the swarm.</p>
                                {haltTriggered && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm mt-2 font-mono">⚠ HALT SIGNAL PROPAGATED — All agents offline</motion.p>}
                            </div>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setHaltModal(true)}
                                className="px-5 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all flex items-center gap-2 shrink-0">
                                <AlertTriangle size={14} />HALT ALL
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Version Rollback */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="glass-card rounded-2xl border border-white/5 p-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1"><RotateCcw className="text-primary" size={18} />Version Rollback</h2>
                        <p className="text-muted text-sm mb-4">Restore FAISS vectors and heuristic rules to a previous snapshot.</p>
                        {rollbackTriggered && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-primary text-sm mb-4 font-mono">✓ Rolled back to {rollbackTriggered}</motion.p>}
                        <div className="flex items-center gap-3">
                            <select value={selectedVersion} onChange={(e) => setSelectedVersion(e.target.value)}
                                className="flex-1 px-4 py-2 rounded-lg bg-background border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-primary transition-colors">
                                {VERSIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                            </select>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setRollbackModal(true)}
                                className="px-5 py-2 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 text-sm font-medium transition-all flex items-center gap-2">
                                <RotateCcw size={14} />Rollback
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Optimizer Toggle */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="glass-card rounded-2xl border border-white/5 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1"><SlidersHorizontal className="text-purple-400" size={18} />Heuristic Optimizer</h2>
                                <p className="text-muted text-sm">Enables the A/B learning loop to promote new rules discovered from benchmark failures.</p>
                            </div>
                            <button onClick={() => setOptimizerOn(!optimizerOn)}
                                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${optimizerOn ? "bg-primary shadow-[0_0_15px_rgba(0,229,255,0.4)]" : "bg-white/10"}`}>
                                <motion.div animate={{ x: optimizerOn ? 26 : 4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md" />
                            </button>
                        </div>
                        <p className={`text-xs font-mono mt-3 ${optimizerOn ? "text-primary" : "text-muted"}`}>
                            Status: {optimizerOn ? "ENABLED — Learning loop active" : "DISABLED — Rules frozen"}
                        </p>
                    </motion.div>

                    {/* Agent Allocation */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        className="glass-card rounded-2xl border border-white/5 p-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1"><Cpu className="text-blue-400" size={18} />Agent Allocation</h2>
                        <p className="text-muted text-sm mb-6">Maximum number of concurrent agents the coordinator can spawn.</p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between font-mono text-sm">
                                <span className="text-muted">Max Concurrent Agents</span>
                                <span className="text-blue-400 font-bold text-xl">{agentSlot}</span>
                            </div>
                            <input type="range" min={1} max={12} value={agentSlot} onChange={(e) => setAgentSlot(Number(e.target.value))}
                                className="w-full h-1.5 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:cursor-pointer" />
                            <div className="flex justify-between text-xs text-muted font-mono"><span>1</span><span>12</span></div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <ConfirmModal isOpen={haltModal} onClose={() => setHaltModal(false)} onConfirm={() => setHaltTriggered(true)}
                title="Confirm Emergency Halt" danger
                description="This will immediately send a SIGKILL to all active cognitive loops. Ongoing tasks will be lost. This action cannot be undone."
                confirmLabel="HALT ALL AGENTS" />
            <ConfirmModal isOpen={rollbackModal} onClose={() => setRollbackModal(false)} onConfirm={() => setRollbackTriggered(selectedVersion)}
                title="Confirm Version Rollback"
                description={`The active FAISS vectors and heuristic rules will be restored to snapshot ${selectedVersion}. Any learning since then will be discarded.`}
                confirmLabel="Confirm Rollback" />
        </RoleGate>
    );
}
