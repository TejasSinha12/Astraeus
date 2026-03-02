"use client";

import { motion } from "framer-motion";
import { Search, Filter, ShieldAlert, FileText, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const MOCK_LOGS = [
    { id: 1, user: "user_2p8...", action: "API_KEY_CREATED", status: "SUCCESS", time: "2 mins ago", severity: "LOW" },
    { id: 2, user: "admin_X9a...", action: "RATE_LIMIT_OVERRIDE", status: "SUCCESS", time: "15 mins ago", severity: "MEDIUM" },
    { id: 3, user: "user_4m1...", action: "FAILED_LOGIN", status: "DENIED", time: "1 hour ago", severity: "HIGH" },
    { id: 4, user: "system_root", action: "SWARM_TERMINATED", status: "SUCCESS", time: "2 hours ago", severity: "CRITICAL" },
    { id: 5, user: "user_q3r...", action: "CREDIT_TOP_UP", status: "SUCCESS", time: "5 hours ago", severity: "LOW" },
];

export function AuditExplorer() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/40" size={14} />
                    <input
                        placeholder="Search audit trail (Action, User, IP)..."
                        className="w-full bg-white/[0.03] border border-white/5 rounded-lg py-2 pl-10 pr-4 text-xs font-mono focus:outline-none focus:border-primary/40 text-white placeholder:text-muted/30"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white/[0.03] border border-white/5 rounded-lg text-[10px] uppercase tracking-widest text-muted hover:text-white transition-all flex items-center gap-2">
                        <Filter size={12} /> Filter
                    </button>
                    <button className="px-4 py-2 bg-white/[0.03] border border-white/5 rounded-lg text-[10px] uppercase tracking-widest text-muted hover:text-white transition-all flex items-center gap-2">
                        <Download size={12} /> Export CSV
                    </button>
                </div>
            </div>

            <div className="glass-card border border-white/5 bg-white/[0.01] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <Th>Event ID</Th>
                            <Th>Actor</Th>
                            <Th>Action</Th>
                            <Th>Status</Th>
                            <Th>Severity</Th>
                            <Th>Timestamp</Th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {MOCK_LOGS.map((log) => (
                            <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                                <Td><span className="text-muted/40 font-mono">#00{log.id}</span></Td>
                                <Td><span className="text-white/60 font-mono">{log.user}</span></Td>
                                <Td><span className="text-white font-bold">{log.action}</span></Td>
                                <Td>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter",
                                        log.status === "SUCCESS" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-500"
                                    )}>
                                        {log.status}
                                    </span>
                                </Td>
                                <Td>
                                    <span className={cn(
                                        "text-[9px] font-bold flex items-center gap-1",
                                        log.severity === "CRITICAL" ? "text-red-500" :
                                            log.severity === "HIGH" ? "text-orange-500" :
                                                log.severity === "MEDIUM" ? "text-yellow-500" : "text-primary/60"
                                    )}>
                                        {log.severity === "CRITICAL" && <ShieldAlert size={10} />}
                                        {log.severity}
                                    </span>
                                </Td>
                                <Td><span className="text-muted/40 text-[10px]">{log.time}</span></Td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[10px] text-muted">
                    <span>Showing 5 of 1,242 historical events</span>
                    <div className="flex gap-4">
                        <button className="hover:text-primary transition-colors">Previous</button>
                        <button className="hover:text-primary transition-colors">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Th({ children }: { children: React.ReactNode }) {
    return (
        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">{children}</th>
    );
}

function Td({ children }: { children: React.ReactNode }) {
    return (
        <td className="px-6 py-4 text-xs font-mono">{children}</td>
    );
}
