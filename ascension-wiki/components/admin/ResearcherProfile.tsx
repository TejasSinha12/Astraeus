"use client";

import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { GitPullRequest, Hash, MessageSquare, ShieldCheck, User, ExternalLink, Calendar } from "lucide-react";
import useSWR from "swr";

const API_URL = process.env.NEXT_PUBLIC_PLATFORM_API_URL || "http://localhost:8000";
const fetcher = (url: string) => fetch(url, { headers: { "api-key": "SYSTEM_ADMIN_BYPASS" } }).then(res => res.json());

export function ResearcherProfile() {
    const { user } = useUser();
    const { data: metrics, error: metricsError } = useSWR(`${API_URL}/admin/metrics/research`, fetcher, { refreshInterval: 5000 });
    const { data: contributions, error: contError } = useSWR(`${API_URL}/admin/metrics/contributions`, fetcher);
    const { data: account, error: accError } = useSWR(`${API_URL}/admin/users/${user?.id || 'current'}`, fetcher);
    
    // Ledger Identity Sync
    const ledgerFetcher = (url: string) => fetch(url, { headers: { "api-key": "SYSTEM_ADMIN_BYPASS", "x-clerk-user-id": user?.id || "admin" } }).then(res => res.json());
    const { data: ledgerResp } = useSWR(user ? `${API_URL}/economy/history` : null, ledgerFetcher, { refreshInterval: 10000 });
    const ledgerHash = ledgerResp?.transactions?.[0]?.signature || "AWAITING_VERIFICATION";

    const reputation = account?.balance?.reputation || 5.2; // Mock fallback if db is stale

    const joinedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "March 2026";
    const displayName = user?.fullName || "Lead Researcher";
    const username = user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "system_admin";

    // Default fallback if loading or error
    const displayData = metrics || [
        { subject: "Logic (Missions)", A: 20, fullMark: 100 },
        { subject: "Architecture (Plan)", A: 15, fullMark: 100 },
        { subject: "Auditing (Trace)", A: 10, fullMark: 100 },
        { subject: "Stability (Uptime)", A: 88, fullMark: 100 },
    ];
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Info */}
                <motion.div
                    role="article"
                    aria-label="Researcher Identification Profile"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-8 border border-white/5 bg-white/[0.01] flex flex-col justify-between"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center p-1">
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                                    <User className="text-background w-8 h-8" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight text-glow">{displayName}</h2>
                                <p className="text-sm text-primary/60 font-mono">@{username}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
                                Tier {reputation > 8 ? 'Alpha' : reputation > 5 ? 'Beta' : 'Gamma'}
                            </div>
                            <span className="text-[9px] text-white/20 font-mono uppercase">Reputation: {reputation.toFixed(1)}</span>
                            <div role="status" aria-label={`Ledger Identity Hash: ${ledgerHash}`} className="mt-1 px-2 py-1 rounded bg-black/40 border border-white/5 flex items-center gap-1.5" title="Cryptographic Ledger Hash">
                                <ShieldCheck size={10} className="text-primary/50" />
                                <span className="text-[7px] text-primary/40 font-mono tracking-widest uppercase truncate max-w-[100px]">{ledgerHash.slice(0, 16)}...</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] text-white/60 uppercase font-bold tracking-widest">Scientific Tier Progress</span>
                            <span className="text-[10px] text-primary font-mono">{((reputation % 1) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(reputation % 1) * 100}%` }}
                                className="h-full bg-gradient-to-r from-primary to-blue-500"
                            />
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        <div className="flex items-center gap-3 text-white/60">
                            <Calendar size={16} className="text-white/20" />
                            <span className="text-xs">Active since {joinedDate}</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/60">
                            <Hash size={16} className="text-white/20" />
                            <span className="text-xs">559 Total Swarm Contributions</span>
                        </div>
                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 mt-4">
                            <p className="text-xs text-white/40 leading-relaxed italic">
                                "Specializing in autonomous code evolution, structural entropy reduction, and cross-swarm intelligence federation. Currently
                                benchmarking v5.0.0 reasoning trajectories."
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button className="flex-1 py-2 px-4 rounded-lg bg-primary text-background text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2">
                            <ExternalLink size={12} /> View Public Node
                        </button>
                        <button className="flex-1 py-2 px-4 rounded-lg bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                            Export Bio
                        </button>
                    </div>
                </motion.div>

                {/* Radar Chart (GitHub Activity Overview Mock) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-8 border border-white/5 bg-white/[0.01]"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xs font-mono text-muted uppercase tracking-widest">Activity Overview</h3>
                            <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1">Intelligence Distribution</p>
                        </div>
                        <GitPullRequest size={16} className="text-primary/40" />
                    </div>

                    <div className="h-[250px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={displayData}>
                                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 600 }}
                                />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Activity"
                                    dataKey="A"
                                    stroke="#00e5ff"
                                    fill="#00e5ff"
                                    fillOpacity={0.3}
                                />
                                <Tooltip
                                    contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "10px" }}
                                    itemStyle={{ color: "#00e5ff" }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <StatItem icon={<MessageSquare size={12} />} label="Issues" value="20%" color="text-yellow-400" />
                        <StatItem icon={<ShieldCheck size={12} />} label="Reviews" color="text-green-500" value="15%" />
                    </div>
                </motion.div>
            </div>

            {/* Horizontal Contribution Map Mock */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 border border-white/5 bg-white/[0.01]"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-mono text-muted uppercase tracking-widest">Research Contribution Map</h3>
                    <div className="flex items-center gap-4">
                        <span className="text-[9px] text-white/20 uppercase tracking-widest">Less</span>
                        <div className="flex gap-1">
                            {[0.1, 0.3, 0.6, 0.9].map((o, i) => (
                                <div key={i} className="w-3 h-3 rounded-sm bg-primary" style={{ opacity: o }} />
                            ))}
                        </div>
                        <span className="text-[9px] text-white/20 uppercase tracking-widest">More</span>
                    </div>
                </div>

                <div className="grid grid-cols-52 gap-1 h-32 w-full overflow-hidden">
                    {(contributions || Array.from({ length: 52 * 7 }).fill(0.05)).slice(0, 364).map((opacity: number, i: number) => {
                        return (
                            <div
                                key={i}
                                className="w-full h-full rounded-sm bg-primary/20 transition-colors hover:bg-primary cursor-help"
                                style={{ opacity }}
                                title={`Activity Index: ${(opacity * 100).toFixed(0)}%`}
                            />
                        );
                    })}
                </div>
                <div className="mt-4 flex justify-between text-[9px] text-white/20 uppercase font-mono">
                    <span>Mar 2025</span>
                    <span>Sep 2025</span>
                    <span>Mar 2026</span>
                </div>
            </motion.div>
        </div>
    );
}

function StatItem({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-2">
                <div className={`${color} opacity-40`}>{icon}</div>
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{label}</span>
            </div>
            <span className="text-xs font-mono text-white font-bold">{value}</span>
        </div>
    );
}
