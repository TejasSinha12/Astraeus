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
        <div className="glass-card rounded-2xl border border-white/5 p-6 space-y-6">
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
                    <div className="grid grid-cols-4 gap-2 mb-2">
                        {[1000, 10000, 50000, 100000].map((val) => (
                            <button
                                key={val}
                                onClick={() => setAmount(val)}
                                className={cn(
                                    "py-1.5 rounded-lg text-[10px] font-mono border transition-all",
                                    amount === val
                                        ? "bg-primary/20 text-primary border-primary/40"
                                        : "bg-white/5 text-muted border-white/10 hover:border-white/20 hover:text-white"
                                )}
                            >
                                {val / 1000}K
                            </button>
                        ))}
                    </div>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-primary/40 transition-colors"
                    />
                </div>

                {/* Action Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleTopUp}
                    disabled={isLoading || !userId}
                    className="w-full py-4 rounded-xl bg-primary text-background font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-40 transition-all"
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
                        {status.type === "success" ? <CheckCircle2 size={14} className="shrink-0 mt-0.5" /> : <AlertCircle size={14} className="shrink-0 mt-0.5" />}
                        {status.message}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
