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
                <div className="relative w-full md:w-64 group/search">
                    {/* Commit 18: Input search icon color wrapping strictly cleanly managing focus groups correctly */}
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4 group-focus-within/search:text-primary transition-colors duration-300" />
                    <input
                        type="text"
                        aria-label="Search Organizations"
                        placeholder="SEARCH ORGANIZATIONS..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-[10px] font-mono tracking-widest focus:outline-none focus:border-primary/50 transition-colors shadow-inner"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Organization List */}
                <div className="lg:col-span-2 space-y-4">
                    {!orgs ? (
                        <div className="h-64 flex items-center justify-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]" aria-live="polite" aria-busy="true">
                            <p className="text-muted text-[10px] animate-pulse">SYNCHRONIZING INSTITUTIONAL DATA...</p>
                        </div>
                    ) : orgs.organizations?.filter((o: any) => o.name.toLowerCase().includes(searchQuery.toLowerCase())).map((org: any) => (
                        <div
                            key={org.id}
                            role="button"
                            tabIndex={0}
                            aria-selected={selectedOrg?.id === org.id}
                            // Commit 16: selectedOrg relative component background layouts cleanly nesting static states securely replacing CSS with framer
                            className={cn(
                                "group p-5 rounded-2xl border transition-all cursor-pointer relative z-0 focus:outline-none focus:border-primary",
                                selectedOrg?.id === org.id ? "border-transparent" : "bg-white/[0.02] border-white/5 hover:border-white/10"
                            )}
                            onClick={() => setSelectedOrg(org)}
                            onKeyDown={(e) => e.key === 'Enter' && setSelectedOrg(org)}
                        >
                            {selectedOrg?.id === org.id && (
                                <motion.div layoutId="team-org-glow" className="absolute inset-0 rounded-2xl bg-primary/5 -z-10 shadow-[0_0_15px_rgba(0,229,255,0.05)] border border-primary/30" transition={{ type: "spring", stiffness: 400, damping: 25 }} />
                            )}
                            <div className="flex justify-between items-start z-10 relative">
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
                                        
                                        {/* Commit 17: Package grid mobile flex wrapping logic constraints safely dynamically structuring flex over internal md layouts */}
                                        <div className="flex flex-wrap md:grid md:grid-cols-3 gap-2 mb-4">
                                            {[
                                                { amount: 20, code: "EXEC_BASIC", tokens: "200k" },
                                                { amount: 100, code: "EXEC_PRO", tokens: "1.0M" },
                                                { amount: 500, code: "EXEC_CORP", tokens: "5.0M" }
                                            ].map(pkg => (
                                                <button
                                                    key={pkg.code}
                                                    aria-label={`Select package ${pkg.code}`}
                                                    onClick={() => setSelectedPackage(pkg)}
                                                    className={cn("p-2 rounded-lg border text-[10px] font-bold font-mono tracking-tighter transition-all flex flex-col items-center justify-center gap-1", selectedPackage.code === pkg.code ? "bg-primary/10 border-primary/40 text-primary" : "bg-white/[0.02] border-white/5 hover:border-white/20 text-muted")}
                                                >
                                                    <span>${pkg.amount}</span>
                                                    <span className="text-[8px] opacity-40 uppercase">{pkg.tokens}</span>
                                                </button>
                                            ))}
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.02, textShadow: "0px 0px 8px rgb(255 255 255 / 0.5)" }}
                                            // Commit 19: Execute Checkout button whileTap constraints mapped smoothly safely dropping standard CSS logic correctly
                                            whileTap={{ scale: 0.96 }}
                                            onClick={handleTopup}
                                            disabled={isCheckoutLoading}
                                            className="w-full flex items-center justify-center gap-2 p-3 bg-primary text-background rounded-lg hover:box-glow transition-all font-bold uppercase tracking-widest text-[10px] disabled:opacity-50"
                                        >
                                            {isCheckoutLoading ? "Routing to Stripe Gateway..." : `Checkout via Stripe`}
                                            <CreditCard size={14} />
                                        </motion.button>
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
                        // Commit 20: Empty state pulse constraints tracking texts wrapping standard text elements into mapped gradient spans directly inside layout containers structurally
                        <div className="p-8 rounded-2xl border border-dashed border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                            <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
                            <Building2 className="w-12 h-12 text-white/5 mb-4 group-hover:text-primary/20 transition-colors duration-500 relative z-10" />
                            <p className="text-[10px] font-bold uppercase tracking-widest max-w-[200px] relative z-10">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-muted to-white/60">Select an organization to manage institutional resources</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
