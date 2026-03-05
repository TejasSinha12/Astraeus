"use client";

import { motion } from "framer-motion";
import { Shield, Activity, BarChart3, Lock, Zap, MousePointer2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Sub-components
import { SystemHealth } from "./SystemHealth";
import { RevenueAnalytics } from "./RevenueAnalytics";
import { AuditExplorer } from "./AuditExplorer";
import { SystemControls } from "./SystemControls";
import { AccessManager } from "./AccessManager";
import { TeamBilling } from "./TeamBilling";

export default function GovernanceDashboard() {
    const [activeTab, setActiveTab] = useState<"overview" | "finance" | "security" | "controls" | "access" | "teams">("overview");
    const [systemStatus, setSystemStatus] = useState("OPERATIONAL");

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 lg:p-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg">
                            <Shield className="text-primary w-5 h-5" />
                        </div>
                        <h1 className="text-3xl font-bold uppercase tracking-tight">Governance <span className="text-primary font-light">Console</span></h1>
                    </div>
                    <p className="text-muted text-sm font-mono uppercase tracking-widest">Astraeus Institutional Oversight & Control Layer</p>
                </div>

                <div className="flex p-1 bg-white/[0.03] border border-white/5 rounded-xl overflow-x-auto custom-scrollbar">
                    <TabBtn active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={<Activity size={14} />} label="System Health" />
                    <TabBtn active={activeTab === "finance"} onClick={() => setActiveTab("finance")} icon={<BarChart3 size={14} />} label="Revenue" />
                    <TabBtn active={activeTab === "teams"} onClick={() => setActiveTab("teams")} icon={<Zap size={14} />} label="Team Billing" />
                    <TabBtn active={activeTab === "security"} onClick={() => setActiveTab("security")} icon={<Lock size={14} />} label="Audit Logs" />
                    <TabBtn active={activeTab === "access"} onClick={() => setActiveTab("access")} icon={<Shield size={14} />} label="Access Control" />
                    <TabBtn active={activeTab === "controls"} onClick={() => setActiveTab("controls")} icon={<Zap size={14} />} label="Controls" />
                </div>
            </header>

            {/* Main Content Area */}
            <main className="grid grid-cols-1 gap-8">
                {activeTab === "overview" && <SystemHealth />}
                {activeTab === "finance" && <RevenueAnalytics />}
                {activeTab === "security" && <AuditExplorer />}
                {activeTab === "access" && <AccessManager />}
                {activeTab === "controls" && <SystemControls />}
                {activeTab === "teams" && <TeamBilling />}
            </main>

            {/* Global Status Bar */}
            <footer className="fixed bottom-0 left-0 right-0 h-10 bg-black border-t border-white/5 px-6 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em]">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full animate-pulse", systemStatus === "OPERATIONAL" ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-red-500")} />
                        <span className="text-white/60">System: {systemStatus}</span>
                    </div>
                    <div className="h-3 w-[1px] bg-white/10" />
                    <span className="text-muted/40">Active Swarms: 08</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-primary/60">Institutional Key: Active</span>
                    <span className="text-muted/20 text-[8px]">v5.0.0-PROD-GOV</span>
                </div>
            </footer>
        </div>
    );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                active ? "bg-primary text-background box-glow" : "text-muted hover:text-white"
            )}
        >
            {icon}
            {label}
        </button>
    );
}
