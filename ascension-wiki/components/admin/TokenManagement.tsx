"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Coins, User, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_PLATFORM_API_URL || "http://localhost:8000";

export function TokenManagement() {
    const [userId, setUserId] = useState("");
    const [amount, setAmount] = useState<number>(10000);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const handleTopUp = async () => {
        if (!userId) {
            setStatus({ type: "error", message: "Please enter a valid User ID" });
            return;
        }

        setIsLoading(true);
        setStatus(null);

        try {
            const res = await fetch(`${API_BASE_URL}/admin/topup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-clerk-user-role": "ADMIN", // Forced for admin UI context
                },
                body: JSON.stringify({
                    user_id: userId,
                    amount: amount,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Failed to top up tokens");
            }

            setStatus({
                type: "success",
                message: `Successfully added ${amount.toLocaleString()} ⏣ to user`
            });
            setAmount(10000); // Reset amount
        } catch (error: any) {
            setStatus({ type: "error", message: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass-card rounded-2xl border border-white/5 p-6 space-y-6 relative overflow-hidden group">
            {/* Commit 30: Glass card gradient bounds wrapped safely wrapping active glow offsets spanning relative backings internally correctly resolving absolute overlays cleanly */}
            <motion.div animate={{ opacity: [0.03, 0.06, 0.03] }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none -z-10" />
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                    <Coins size={20} />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-white tracking-tight">Token Management</h2>
                    <p className="text-[10px] font-mono text-muted uppercase tracking-tighter">Sovereign Authority Refill</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* User ID Input */}
                <div className="space-y-2">
                    <label className="text-[10px] font-mono text-muted uppercase tracking-widest flex items-center gap-1.5">
                        <User size={10} /> Recipient User ID
                    </label>
                    <input
                        type="text"
                        placeholder="clerk_user_2m..."
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 transition-colors"
                    />
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                    <label className="text-[10px] font-mono text-muted uppercase tracking-widest flex items-center gap-1.5">
                        <Coins size={10} /> Amount (⏣)
                    </label>
                    {/* Commit 27: Token amount grid bounds tracking actively shifting Framer bounds tracking explicitly across native layout limits securely */}
                    <div className="grid grid-cols-4 gap-2 mb-2 relative z-0">
                        {[1000, 10000, 50000, 100000].map((val) => (
                            <button
                                key={val}
                                onClick={() => setAmount(val)}
                                className={cn(
                                    "py-1.5 rounded-lg text-[10px] font-mono border transition-all relative flex-1 text-center min-w-[60px]",
                                    amount === val
                                        ? "text-primary border-transparent"
                                        : "bg-white/5 text-muted border-white/10 hover:border-white/20 hover:text-white"
                                )}
                            >
                                {amount === val && (
                                    <motion.div layoutId="amount-glow-tab" className="absolute inset-0 bg-primary/20 border border-primary/40 rounded-lg -z-10 shadow-[0_0_10px_rgba(0,229,255,0.2)]" transition={{ type: "spring", stiffness: 400, damping: 25 }} />
                                )}
                                {val / 1000}K
                            </button>
                        ))}
                    </div>
                    {/* Commit 28: Token amount manual spin transitions properly shifting cleanly correctly framing native elements resolving strict inputs mapping ring structures effectively */}
                    <div className="relative group/amount">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm font-mono text-white focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all shadow-inner group-hover/amount:border-white/20"
                        />
                        <Coins className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within/amount:text-primary group-focus-within/amount:animate-pulse transition-colors" />
                    </div>
                </div>

                {/* Commit 29: Execute Recharge transitions cleanly handling Framer constraints actively spanning relative bounds smartly dropping local logic securely */}
                <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0,229,255,0.5)" }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleTopUp}
                    disabled={isLoading || !userId}
                    className="w-full py-4 rounded-xl bg-primary text-background font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-40 transition-all relative overflow-hidden"
                >
                    {isLoading ? (
                        <span className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    ) : (
                        <>
                            <Send size={16} /> Execute Recharge
                        </>
                    )}
                </motion.button>

                {/* Status Message */}
                {status && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "p-3 rounded-xl border text-xs font-mono flex items-start gap-2",
                            status.type === "success"
                                ? "bg-green-500/10 border-green-500/20 text-green-400"
                                : "bg-red-500/10 border-red-500/20 text-red-400"
                        )}
                    >
                        {/* Commit 26: Success state CheckCircle pulse logic directly injected updating elements framing logic naturally pushing icons locally correctly resolving states safely */}
                        {status.type === "success" ? (
                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                                <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-green-400" />
                            </motion.div>
                        ) : (
                            <AlertCircle size={14} className="shrink-0 mt-0.5 text-red-400" />
                        )}
                        {status.message}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
