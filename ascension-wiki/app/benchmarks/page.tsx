"use client";

export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { RoleGate } from "@/components/auth/RoleGate";
import {
    generateAccuracyOverTime, generateVersionComparison,
    generateCalibrationCurve, generateHeuristicPromotion,
    REGRESSION_LOGS, AB_TEST_DATA, CATEGORIES,
} from "@/lib/mock-data";
import { useBenchmarkStore } from "@/lib/store";

const COLORS = { math: "#00e5ff", logic: "#a78bfa", planning: "#34d399", "tool-use": "#f472b6" };
const VERSION_COLORS = ["#00e5ff", "#a78bfa", "#34d399"];

const TABS = ["Accuracy", "Versions", "Calibration", "Heuristics", "Regressions", "A/B Tests"];

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={`glass-card rounded-2xl border border-white/5 p-6 ${className}`}>
            {children}
        </motion.div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h2 className="text-sm font-mono text-muted uppercase tracking-widest mb-4">{children}</h2>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-surface/90 backdrop-blur border border-white/10 rounded-xl p-3 text-xs font-mono shadow-xl">
            <p className="text-muted mb-1">{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.color }}>{p.name}: <span className="text-white">{typeof p.value === "number" ? (p.value * 100).toFixed(1) + "%" : p.value}</span></p>
            ))}
        </div>
    );
};

export default function BenchmarksPage() {
    const [activeTab, setActiveTab] = useState("Accuracy");
    const { activeCategory, setCategory } = useBenchmarkStore();

    const accuracyData = useMemo(() => {
        const raw = generateAccuracyOverTime();
        const latest = raw.filter((d) => d.version === "v0.1.0-alpha");
        return latest;
    }, []);

    const versionData = useMemo(() => generateVersionComparison(), []);
    const calibData = useMemo(() => generateCalibrationCurve(), []);
    const heuristicData = useMemo(() => generateHeuristicPromotion(), []);

    return (
        <RoleGate allowedRole="researcher">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <div className="text-xs font-mono text-primary uppercase tracking-widest mb-2">Research Analytics</div>
                    <h1 className="text-4xl font-bold text-white">Benchmark Dashboard</h1>
                    <p className="text-muted mt-1">Statistical performance of the cognitive framework across versions</p>
                </motion.div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {TABS.map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-mono transition-all ${activeTab === tab ? "bg-primary/20 text-primary border border-primary/40" : "text-muted hover:text-white bg-white/5 border border-white/5"}`}>
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Category Filter */}
                {(activeTab === "Accuracy" || activeTab === "Versions") && (
                    <div className="flex gap-2 mb-6">
                        <button onClick={() => setCategory("all")}
                            className={`px-3 py-1 rounded-lg text-xs font-mono border transition-all ${activeCategory === "all" ? "bg-white/20 text-white border-white/30" : "text-muted border-white/10 hover:text-white"}`}>
                            All
                        </button>
                        {CATEGORIES.map((cat) => (
                            <button key={cat} onClick={() => setCategory(cat)}
                                className={`px-3 py-1 rounded-lg text-xs font-mono border transition-all`}
                                style={{ borderColor: activeCategory === cat ? COLORS[cat] : "rgba(255,255,255,0.1)", color: activeCategory === cat ? COLORS[cat] : "rgba(255,255,255,0.5)", background: activeCategory === cat ? COLORS[cat] + "18" : "" }}>
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* Accuracy Over Time */}
                {activeTab === "Accuracy" && (
                    <Card>
                        <SectionTitle>Accuracy Over Time · v0.1.0-alpha</SectionTitle>
                        <ResponsiveContainer width="100%" height={340}>
                            <LineChart data={accuracyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="step" stroke="#4a5568" tick={{ fill: "#718096", fontSize: 11 }} />
                                <YAxis tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} domain={[0.5, 1]} stroke="#4a5568" tick={{ fill: "#718096", fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12, color: "#718096" }} />
                                {(activeCategory === "all" ? CATEGORIES : [activeCategory]).map((cat) => (
                                    <Line key={cat} type="monotone" dataKey={cat} stroke={COLORS[cat]}
                                        strokeWidth={2} dot={{ fill: COLORS[cat], r: 3 }} activeDot={{ r: 5 }} />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                )}

                {/* Version Comparison */}
                {activeTab === "Versions" && (
                    <Card>
                        <SectionTitle>Version Comparison</SectionTitle>
                        <ResponsiveContainer width="100%" height={340}>
                            <BarChart data={versionData} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="version" stroke="#4a5568" tick={{ fill: "#718096", fontSize: 11 }} />
                                <YAxis tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} domain={[0.5, 1]} stroke="#4a5568" tick={{ fill: "#718096", fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12, color: "#718096" }} />
                                {(activeCategory === "all" ? [...CATEGORIES, "overall"] : [activeCategory]).map((cat, i) => (
                                    <Bar key={cat} dataKey={cat} fill={COLORS[cat as keyof typeof COLORS] ?? "#6b7280"} radius={[4, 4, 0, 0]} />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                )}

                {/* Calibration Curve */}
                {activeTab === "Calibration" && (
                    <Card>
                        <SectionTitle>Confidence Calibration Curve</SectionTitle>
                        <ResponsiveContainer width="100%" height={340}>
                            <AreaChart data={calibData}>
                                <defs>
                                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="predicted" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} stroke="#4a5568" tick={{ fill: "#718096", fontSize: 11 }} />
                                <YAxis tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} stroke="#4a5568" tick={{ fill: "#718096", fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12, color: "#718096" }} />
                                <Line type="monotone" dataKey="ideal" stroke="#4a5568" strokeDasharray="4 4" strokeWidth={1} dot={false} name="Ideal" />
                                <Area type="monotone" dataKey="actual" stroke="#00e5ff" fill="url(#actualGrad)" strokeWidth={2} name="Actual" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                )}

                {/* Heuristic Promotion */}
                {activeTab === "Heuristics" && (
                    <Card>
                        <SectionTitle>Heuristic Activity</SectionTitle>
                        <ResponsiveContainer width="100%" height={340}>
                            <BarChart data={heuristicData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="week" stroke="#4a5568" tick={{ fill: "#718096", fontSize: 11 }} />
                                <YAxis stroke="#4a5568" tick={{ fill: "#718096", fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12, color: "#718096" }} />
                                <Bar dataKey="tested" fill="#6b7280" radius={[2, 2, 0, 0]} name="Tested" />
                                <Bar dataKey="promoted" fill="#00e5ff" radius={[2, 2, 0, 0]} name="Promoted" />
                                <Bar dataKey="demoted" fill="#f87171" radius={[2, 2, 0, 0]} name="Demoted" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                )}

                {/* Regression Log */}
                {activeTab === "Regressions" && (
                    <Card>
                        <SectionTitle>Regression Detection Log</SectionTitle>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-white/5">
                                    {["ID", "Version", "Category", "Delta", "Date", "Severity"].map((h) => (
                                        <th key={h} className="text-left py-2 px-3 text-xs font-mono text-muted uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr></thead>
                                <tbody>
                                    {REGRESSION_LOGS.map((r) => (
                                        <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-3 px-3 font-mono text-xs text-muted">{r.id}</td>
                                            <td className="py-3 px-3 font-mono text-xs text-white">{r.version}</td>
                                            <td className="py-3 px-3 font-mono text-xs text-primary">{r.category}</td>
                                            <td className="py-3 px-3 font-mono text-xs text-red-400">{(r.delta * 100).toFixed(1)}%</td>
                                            <td className="py-3 px-3 font-mono text-xs text-muted">{r.date}</td>
                                            <td className="py-3 px-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-mono border ${r.severity === "error" ? "bg-red-500/10 text-red-400 border-red-500/20" : r.severity === "warning" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : "bg-white/5 text-muted border-white/10"}`}>{r.severity}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* A/B Tests */}
                {activeTab === "A/B Tests" && (
                    <Card>
                        <SectionTitle>A/B Testing Results</SectionTitle>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-white/5">
                                    {["Experiment", "Math", "Logic", "Planning", "Tool-Use", "Winner"].map((h) => (
                                        <th key={h} className="text-left py-2 px-3 text-xs font-mono text-muted uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr></thead>
                                <tbody>
                                    {AB_TEST_DATA.map((row, i) => (
                                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-3 px-3 text-xs text-white">{row.experiment}</td>
                                            {(["math", "logic", "planning", "tool-use"] as const).map((cat) => (
                                                <td key={cat} className="py-3 px-3 font-mono text-xs" style={{ color: COLORS[cat] }}>{(row[cat] * 100).toFixed(1)}%</td>
                                            ))}
                                            <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-xs font-mono bg-primary/10 text-primary border border-primary/20">{row.winner}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>
        </RoleGate>
    );
}
