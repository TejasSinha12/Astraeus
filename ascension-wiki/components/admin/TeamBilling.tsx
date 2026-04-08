"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, CreditCard, ArrowUpRight, Plus, Search, Building2, ShieldCheck, History, AlertCircle } from "lucide-react";
import useSWR from "swr";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_PLATFORM_API_URL || "http://localhost:8000";
const fetcher = (url: string) => fetch(url, { headers: { "api-key": "SYSTEM_ADMIN_BYPASS" } }).then(res => res.json());

export function TeamBilling() {
    const { data: orgs, error, mutate } = useSWR(`${API_URL}/admin/organizations`, fetcher);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOrg, setSelectedOrg] = useState<any>(null);
    const [selectedPackage, setSelectedPackage] = useState<any>({ amount: 20, code: "EXEC_BASIC", tokens: "200k" });
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

    const handleTopup = async () => {
        if (!selectedOrg) return;
        setIsCheckoutLoading(true);
        try {
            const res = await fetch(`/api/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ amount: selectedPackage.amount, packageCode: selectedPackage.code })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url; // Trigger Stripe Routing
            } else {
                alert(`Checkout Exception: ${data.error}`);
            }
        } catch (err) {
            console.error(err);
            alert("Network Error navigating to checkout gateway.");
        } finally {
            setIsCheckoutLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold tracking-tight uppercase flex items-center gap-2">
                        <Building2 className="text-primary w-5 h-5" />
                        Institutional Billing
                    </h2>
                    <p className="text-muted text-xs uppercase tracking-widest mt-1">Manage organization-level shared credit pools</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
                    <input
                        type="text"
                        placeholder="SEARCH ORGANIZATIONS..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-[10px] font-mono tracking-widest focus:outline-none focus:border-primary/50 transition-colors"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Organization List */}
                <div className="lg:col-span-2 space-y-4">
                    {!orgs ? (
                        <div className="h-64 flex items-center justify-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                            <p className="text-muted text-[10px] animate-pulse">SYNCHRONIZING INSTITUTIONAL DATA...</p>
                        </div>
                    ) : orgs.organizations?.filter((o: any) => o.name.toLowerCase().includes(searchQuery.toLowerCase())).map((org: any) => (
                        <div
                            key={org.id}
                            className={cn(
                                "group p-5 rounded-2xl border transition-all cursor-pointer",
                                selectedOrg?.id === org.id ? "bg-primary/5 border-primary/30" : "bg-white/[0.02] border-white/5 hover:border-white/10"
                            )}
                            onClick={() => setSelectedOrg(org)}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                                        <Building2 className="text-primary w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm tracking-tight">{org.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-mono text-muted uppercase">{org.domain || "GLOBAL DOMAIN"}</span>
                                            <div className="w-1 h-1 rounded-full bg-white/20" />
                                            <span className="text-[10px] font-mono text-primary uppercase">{org.plan_id}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold font-mono tracking-tighter text-white">
                                        {org.token_balance?.toLocaleString()}
                                    </p>
                                    <p className="text-[10px] text-muted font-mono uppercase">SHARED CREDITS</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Management Sidebar */}
                <div className="space-y-6">
                    {selectedOrg ? (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-6 sticky top-6"
                        >
                            <div>
                                <h4 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-4">Institutional Actions</h4>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                                        <label className="text-[9px] text-muted uppercase tracking-widest block mb-3">Deploy Platform Credits</label>
                                        
                                        <div className="grid grid-cols-3 gap-2 mb-4">
                                            {[
                                                { amount: 20, code: "EXEC_BASIC", tokens: "200k" },
                                                { amount: 100, code: "EXEC_PRO", tokens: "1.0M" },
                                                { amount: 500, code: "EXEC_CORP", tokens: "5.0M" }
                                            ].map(pkg => (
                                                <button
                                                    key={pkg.code}
                                                    onClick={() => setSelectedPackage(pkg)}
                                                    className={cn("p-2 rounded-lg border text-[10px] font-bold font-mono tracking-tighter transition-all flex flex-col items-center justify-center gap-1", selectedPackage.code === pkg.code ? "bg-primary/10 border-primary/40 text-primary" : "bg-white/[0.02] border-white/5 hover:border-white/20 text-muted")}
                                                >
                                                    <span>${pkg.amount}</span>
                                                    <span className="text-[8px] opacity-40 uppercase">{pkg.tokens}</span>
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={handleTopup}
                                            disabled={isCheckoutLoading}
                                            className="w-full flex items-center justify-center gap-2 p-3 bg-primary text-background rounded-lg hover:box-glow transition-all font-bold uppercase tracking-widest text-[10px] disabled:opacity-50"
                                        >
                                            {isCheckoutLoading ? "Routing to Stripe Gateway..." : `Checkout via Stripe`}
                                            <CreditCard size={14} />
                                        </button>
                                    </div>

                                    <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all">
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck size={16} className="text-muted" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Update Policy</span>
                                        </div>
                                        <ArrowUpRight size={14} className="text-muted/40" />
                                    </button>

                                    <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all">
                                        <div className="flex items-center gap-3">
                                            <History size={16} className="text-muted" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Billing History</span>
                                        </div>
                                        <ArrowUpRight size={14} className="text-muted/40" />
                                    </button>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 text-[9px] text-muted leading-relaxed">
                                <AlertCircle size={12} className="inline mr-1 text-primary" />
                                Credits allocated here are shared across all researchers linked to <strong>{selectedOrg.name}</strong>.
                            </div>
                        </motion.div>
                    ) : (
                        <div className="p-8 rounded-2xl border border-dashed border-white/5 flex flex-col items-center justify-center text-center">
                            <Building2 className="w-12 h-12 text-white/5 mb-4" />
                            <p className="text-[10px] text-muted font-bold uppercase tracking-widest max-w-[200px]">
                                Select an organization to manage institutional resources
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
