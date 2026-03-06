"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, CreditCard, Loader2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";
import useSWR from "swr";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_dummy");
const API_URL = process.env.NEXT_PUBLIC_PLATFORM_API_URL || "http://localhost:8000";

export function TopUpModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [amount, setAmount] = useState(10); // Default $10
    const [isLoading, setIsLoading] = useState(false);
    const { data: userStatus, mutate } = useSWR(`${API_URL}/user/status`, (url) =>
        fetch(url, { headers: { "Authorization": `Bearer ${window.localStorage.getItem("clerk-db-jwt") || ""}` } }).then(res => res.json())
    );

    useEffect(() => {
        if (isOpen) mutate();
    }, [isOpen, mutate]);

    const handleCheckout = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount, packageCode: "standard_topup" }),
            });
            const data = await res.json();

            if (data.url) {
                window.location.href = data.url; // Redirect to Stripe Checkout
            } else {
                toast.error(data.error || "Failed to initiate checkout");
                setIsLoading(false);
            }
        } catch (error: any) {
            toast.error("Checkout failed: " + error.message);
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass-card"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                                    <Zap className="text-primary w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white tracking-tight">Purchase Credits</h3>
                                    <p className="text-xs text-muted font-mono uppercase tracking-widest">SaaS Billing Gateway</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">

                            {/* Current Balance */}
                            <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                                <span className="text-sm text-muted font-medium">Current Balance</span>
                                <span className="font-mono text-lg font-bold text-white">
                                    {userStatus?.balance ? userStatus.balance.toLocaleString() : "..."} <span className="text-xs text-primary uppercase">Tokens</span>
                                </span>
                            </div>

                            {/* Preset Amounts */}
                            <div className="grid grid-cols-3 gap-3">
                                {[5, 20, 100].map((preset) => (
                                    <button
                                        key={preset}
                                        onClick={() => setAmount(preset)}
                                        className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${amount === preset
                                                ? "bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(0,229,255,0.15)]"
                                                : "bg-white/[0.02] border-white/10 text-muted hover:border-white/20 hover:bg-white/[0.05]"
                                            }`}
                                    >
                                        <span className="font-bold text-lg">${preset}</span>
                                        <span className="text-[10px] uppercase font-mono tracking-wider opacity-80">{preset * 10}k Tokens</span>
                                    </button>
                                ))}
                            </div>

                            {/* Custom Amount */}
                            <div className="space-y-2">
                                <label className="text-xs text-muted uppercase tracking-widest font-mono">Custom Amount (USD)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold">$</span>
                                    <input
                                        type="number"
                                        min="5"
                                        value={amount}
                                        onChange={(e) => setAmount(Math.max(5, parseInt(e.target.value) || 5))}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white font-mono focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-muted font-mono uppercase">
                                        = {(amount * 1000).toLocaleString()} Tokens
                                    </span>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <button
                                onClick={handleCheckout}
                                disabled={isLoading}
                                className="w-full py-4 rounded-xl bg-primary text-background font-bold tracking-wide hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        Pay ${amount}.00 via Stripe
                                    </>
                                )}
                            </button>
                            <p className="text-center text-[10px] text-muted/60 font-mono uppercase tracking-widest mt-4">
                                Secure cryptographic billing by Stripe
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
