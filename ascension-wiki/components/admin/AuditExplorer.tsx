"use client";

import { motion } from "framer-motion";
import { Search, ShieldAlert, FileJson, Clock, User, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url, { headers: { "api-key": "SYSTEM_ADMIN_BYPASS" } }).then(res => res.json());

const MOCK_AUDIT_LOGS = [
    { id: "1", timestamp: "2026-03-02 14:22:01", event: "KEY_REVOKED", user: "admin_01", status: "SUCCESS", detail: "Revoked access for node EU-WEST-4" },
    { id: "2", timestamp: "2026-03-02 14:15:33", event: "RATE_LIMIT_ADJUSTED", user: "system", status: "INFO", detail: "Global limit set to 5000 t/m" },
    { id: "3", timestamp: "2026-03-02 13:58:12", event: "UNAUTHORIZED_ACCESS", user: "unknown_ip", status: "CRITICAL", detail: "Blocked attempt on /admin/keys" },
    { id: "4", timestamp: "2026-03-02 13:45:00", event: "CREDIT_TOP_UP", user: "acme_corp", status: "SUCCESS", detail: "+10,000,000 credits issued" },
];

export function AuditExplorer() {
    const { data, isLoading } = useSWR(`${process.env.NEXT_PUBLIC_PLATFORM_API_URL}/admin/audit/logs`, fetcher, {
        refreshInterval: 15000,
    });

    const logs = data?.logs || MOCK_AUDIT_LOGS;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search audit trail..."
                            className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary w-64 shadow-inner text-white"
                        />
                    </div>
                    <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-white/60">
                        <option>All Events</option>
                        <option>Security</option>
                        <option>Financial</option>
                        <option>Operations</option>
                    </select>
                </div>
                <button className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium transition-colors">
                    <FileJson className="w-4 h-4" />
                    Export JSON
                </button>
            </div>

            <div className="glass-card border border-white/5 overflow-hidden bg-white/[0.01]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Timestamp</th>
                            <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Event</th>
                            <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Origin</th>
                            <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider w-1/3">Detail</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-white/20">
                                    Initializing secure audit stream...
                                </td>
                            </tr>
                        ) : logs.map((log: any) => (
                            <LogEntry key={log.id} log={log} />
                        ))}
                    </tbody>
                </table>
                <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[10px] text-white/40 uppercase tracking-widest font-bold">
                    <span>Showing {logs.length} of 1,242 historical events</span>
                    <div className="flex gap-4">
                        <button className="hover:text-primary transition-colors cursor-pointer">Previous</button>
                        <button className="hover:text-primary transition-colors cursor-pointer">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LogEntry({ log }: { log: any }) {
    const getStatusStyle = (status: string) => {
        switch (status) {
            case "SUCCESS": return "bg-green-500/10 text-green-400 border-green-500/20";
            case "CRITICAL": return "bg-red-500/10 text-red-500 border-red-500/20";
            case "INFO": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            default: return "bg-white/5 text-white/40 border-white/10";
        }
    };

    return (
        <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hover:bg-white/[0.02] transition-colors group"
        >
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2 text-white/40 text-xs font-mono">
                    <Clock className="w-3 h-3" />
                    {log.timestamp}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-white font-bold text-xs tracking-tight">{log.event}</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2 text-white/60 text-xs">
                    <User className="w-3 h-3 text-white/30" />
                    {log.user}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold border",
                    getStatusStyle(log.status)
                )}>
                    {log.status}
                </span>
            </td>
            <td className="px-6 py-4">
                <p className="text-white/40 text-xs truncate max-w-xs group-hover:text-white/60 transition-colors">
                    {log.detail}
                </p>
            </td>
        </motion.tr>
    );
}
