"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, CreditCard, Loader2, Sparkles, ShieldCheck, ChevronRight } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import useSWR from "swr";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_PLATFORM_API_URL || "http://localhost:8000";

const PACKAGES = [
    { amount: 10, label: "Starter", tokens: "100k", popular: false },
    { amount: 25, label: "Professional", tokens: "250k", popular: true },
    { amount: 100, label: "Enterprise", tokens: "1M", popular: false },
];

export function TopUpModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { userId, getToken } = useAuth();
    const [amount, setAmount] = useState<string>("25");
    const [isLoading, setIsLoading] = useState(false);

    // Fetch user status with proper Clerk Auth
    const { data: userStatus, mutate } = useSWR(userId ? `${API_URL}/user/status` : null, async (url) => {
        const response = await fetch(url, {
            headers: {
                "x-clerk-user-id": userId || "",
            }
        });
        return response.json();
    });

    useEffect(() => {
        if (isOpen) mutate();
    }, [isOpen, mutate]);

    const handleClose = () => {
        mutate();
        onClose();
    };

    const handleCheckout = async () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount < 5) {
            toast.error("Minimum purchase is $5.00");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: numAmount,
                    packageCode: numAmount >= 100 ? "enterprise_topup" : "standard_topup"
                }),
            });
            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error(data.error || "Failed to initiate checkout");
                setIsLoading(false);
            }
        } catch (error: any) {
            toast.error("Checkout failed: " + error.message);
            setIsLoading(false);
        }
    };

    const displayAmount = parseFloat(amount) || 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="relative w-full max-w-lg bg-[#0f172a]/60 border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-2xl"
                    >
                        {/* Animated Gradient Background */}
                        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

                        {/* Header */}
                        <div className="relative p-8 pb-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-[0_0_20px_rgba(0,229,255,0.1)]">
                                    <Sparkles className="text-primary w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white tracking-tight">Expand Quota</h3>
                                    <p className="text-[10px] text-muted font-bold uppercase tracking-[0.2em] opacity-60">Ascension Economy Engine</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2.5 rounded-xl hover:bg-white/5 text-muted hover:text-white transition-all hover:rotate-90"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="relative p-8 pt-4 space-y-8">

                            {/* Current Status Card */}
                            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between shadow-inner">
                                <div className="space-y-1">
                                    <span className="text-[10px] text-muted font-bold uppercase tracking-widest block opacity-50">Current Reserves</span>
                                    <div className="flex items-center gap-2">
                                        <Zap size={14} className="text-primary" />
                                        <span className="font-mono text-xl font-bold text-white">
                                            {userStatus ? userStatus.balance?.toLocaleString() : "---"}
                                        </span>
                                    </div>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                                    <span className="text-[9px] text-primary font-bold uppercase tracking-tighter">Verified Identity</span>
                                </div>
                            </div>

                            {/* Preset Packages */}
                            <div className="grid grid-cols-3 gap-4">
                                {PACKAGES.map((pkg) => (
                                    <button
                                        key={pkg.amount}
                                        onClick={() => setAmount(pkg.amount.toString())}
                                        className={cn(
                                            "relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 group",
                                            parseFloat(amount) === pkg.amount
                                                ? "bg-primary/5 border-primary text-white shadow-[0_0_30px_rgba(0,229,255,0.1)]"
                                                : "bg-white/[0.02] border-white/5 text-muted hover:border-white/20 hover:bg-white/[0.04]"
                                        )}
                                    >
                                        {pkg.popular && (
                                            <div className="absolute -top-2 px-2 py-0.5 bg-primary text-[8px] font-black text-background uppercase rounded-full tracking-widest shadow-lg">
                                                Best Value
                                            </div>
                                        )}
                                        <span className="text-xs font-bold uppercase tracking-widest opacity-40 group-hover:opacity-60 transition-opacity">
                                            {pkg.label}
                                        </span>
                                        <span className="font-mono text-2xl font-black">${pkg.amount}</span>
                                        <span className="text-[9px] font-bold text-primary/70">{pkg.tokens} Tokens</span>
                                    </button>
                                ))}
                            </div>

                            {/* Custom Amount Interaction */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <label className="text-[10px] text-muted font-bold uppercase tracking-[0.2em] opacity-60">Custom Injection</label>
                                    <span className="text-[10px] font-mono text-primary animate-pulse">
                                        + {(displayAmount * 10000).toLocaleString()} PROG_KEYS
                                    </span>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted font-bold transition-colors group-focus-within:text-primary">$</div>
                                    <input
                                        type="text"
                                        value={amount}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^0-9.]/g, '');
                                            setAmount(val);
                                        }}
                                        className="w-full bg-[#020617]/40 border border-white/5 rounded-2xl py-4 pl-10 pr-4 text-white font-mono text-lg focus:outline-none focus:border-primary/40 focus:bg-black/60 transition-all shadow-inner"
                                        placeholder="0.00"
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[10px] text-muted font-bold uppercase tracking-widest">
                                        <span className="opacity-40">USD</span>
                                        <ChevronRight size={12} className="opacity-20" />
                                    </div>
                                </div>
                            </div>

                            {/* Action Area */}
                            <div className="space-y-4 pt-2">
                                <button
                                    onClick={handleCheckout}
                                    disabled={isLoading || !displayAmount || displayAmount < 5}
                                    className="relative w-full py-5 rounded-2xl bg-primary text-background font-black text-sm uppercase tracking-[0.2em] hover:bg-white hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-3 group disabled:opacity-20 disabled:grayscale"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <CreditCard size={18} className="translate-y-[-1px]" />
                                            Initialize Secure Payment
                                        </>
                                    )}
                                </button>

                                <div className="flex items-center justify-center gap-6 opacity-40">
                                    <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-white">
                                        <ShieldCheck size={12} className="text-primary" />
                                        End-to-End Secure
                                    </div>
                                    <div className="w-px h-3 bg-white/20" />
                                    <div className="text-[9px] flex items-center gap-1.5 font-bold uppercase tracking-widest text-white">
                                        Powered by Stripe
                                        <span className="px-1.5 py-0.5 rounded-sm bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 text-[7px] leading-none">TEST MODE</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
