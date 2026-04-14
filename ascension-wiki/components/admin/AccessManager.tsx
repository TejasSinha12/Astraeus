"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Key, Users, Plus, Shield, ShieldCheck, ShieldAlert, Trash2, Copy, Check, RotateCcw, Search, Filter } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_PLATFORM_API_URL || "http://localhost:8000";
const fetcher = (url: string) => fetch(url, { headers: { "api-key": "SYSTEM_ADMIN_BYPASS" } }).then(res => res.json());

export function AccessManager() {
    const [subTab, setSubTab] = useState<"keys" | "rbac">("keys");
    const [searchQuery, setSearchQuery] = useState("");

    const { data: keys, mutate: mutateKeys } = useSWR(`${API_BASE_URL}/admin/keys`, fetcher);
    const { data: users, mutate: mutateUsers } = useSWR(`${API_BASE_URL}/admin/users`, fetcher);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                <div className="flex gap-4 p-1 bg-black/40 rounded-xl border border-white/5">
                    <SubTabBtn active={subTab === "keys"} onClick={() => setSubTab("keys")} icon={<Key size={14} />} label="API Infrastructure" />
                    <SubTabBtn active={subTab === "rbac"} onClick={() => setSubTab("rbac")} icon={<Users size={14} />} label="Permissions & RBAC" />
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group/search">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 w-3 h-3 group-focus-within/search:text-primary transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter registry..."
                            className="bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-[10px] font-mono text-white focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 w-64 transition-all shadow-inner" // Commit 4: Search filter focus rings natively
                        />
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {subTab === "keys" ? (
                    <motion.div key="keys" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                        <SectionHeader title="API Key Registry" description="Manage institutional credentials and system bypass tokens." action={<CreateKeyBtn onUpdate={mutateKeys} />} />
                        <div className="grid grid-cols-1 gap-4">
                            {/* Commit 2: Staggered API Key row delays natively wrapping elements cleanly */}
                            {keys?.keys?.map((key: any, i: number) => (
                                <motion.div key={key.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 25 }}>
                                    <KeyCard apiKey={key} onUpdate={mutateKeys} />
                                </motion.div>
                            ))}
                            {!keys?.keys?.length && <EmptyRegistry label="No Active API Keys" />}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="rbac" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                        <SectionHeader title="User Permission Layer" description="Audit and modify global user roles and access capabilities." />
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white/[0.03] border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted/60">Subject</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted/60">Identity</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted/60">Access Role</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted/60">Commands</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users?.users?.map((user: any) => (
                                        <UserRow key={user.id} user={user} onUpdate={mutateUsers} />
                                    ))}
                                </tbody>
                            </table>
                            {!users?.users?.length && <div className="p-12 text-center opacity-10 font-mono text-xs uppercase tracking-widest">User Registry Empty</div>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function KeyCard({ apiKey, onUpdate }: { apiKey: any, onUpdate: () => void }) {
    const [copied, setCopied] = useState(false);
    const [isRevoking, setIsRevoking] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey.key);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRevoke = async () => {
        if (!confirm("Are you sure you want to revoke this key? This action is irreversible.")) return;
        setIsRevoking(true);
        try {
            await fetch(`${API_BASE_URL}/admin/keys/${apiKey.id}/revoke`, { method: "POST", headers: { "api-key": "SYSTEM_ADMIN_BYPASS" } });
            onUpdate();
        } finally {
            setIsRevoking(false);
        }
    };

    return (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/10 transition-colors group">
            <div className="flex items-center gap-6">
                <div className={cn("p-3 rounded-lg border", apiKey.is_active ? "bg-primary/10 border-primary/20 text-primary" : "bg-red-500/10 border-red-500/20 text-red-500")}>
                    {apiKey.is_active ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-sm font-bold uppercase tracking-tight">{apiKey.name}</h4>
                        <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest", apiKey.is_active ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500")}>
                            {apiKey.is_active ? "Active" : "Revoked"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[10px] text-muted">
                        <span className="opacity-40">Created:</span>
                        <span>{new Date(apiKey.created_at).toLocaleDateString()}</span>
                        <span className="opacity-10">|</span>
                        <span className="opacity-40">Scope:</span>
                        <span className={cn("px-1.5 py-0.5 rounded font-bold uppercase", apiKey.scopes?.includes('execute') ? "bg-orange-500/20 text-orange-500" : "bg-blue-500/20 text-blue-500")}>
                            {apiKey.scopes?.join(', ') || 'READ-ONLY'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Brute-force warning */}
            <div className="text-[8px] font-mono text-muted/40 uppercase tracking-widest absolute top-2 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                {apiKey.is_active ? "Velocity locked > 100 req/sec" : "Velocity lock engaged."}
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-white/5 rounded-lg group-hover:border-primary/20 transition-all cursor-pointer hover:bg-white/5" onClick={handleCopy}>
                    <code className={cn("text-[10px] tracking-wider transition-all duration-300", copied ? "text-green-500 font-bold" : "text-white/20 font-mono blur-[3px] hover:blur-none")}>
                        {/* Commit 5: Format trailing key wrappers explicitly resolving formatting errors correctly */}
                        {copied ? "COPIED_TO_CLIPBOARD" : (apiKey.key?.trim() ? `${apiKey.key.trim().substring(0, 12)}...${apiKey.key.trim().substring(apiKey.key.trim().length - 8)}` : "INV_KEY_MAPPING")}
                    </code>
                    <button className="text-muted hover:text-primary transition-colors ml-2">
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                </div>
                <button
                    disabled={!apiKey.is_active || isRevoking}
                    onClick={handleRevoke}
                    className="p-2 text-muted hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}

function UserRow({ user, onUpdate }: { user: any, onUpdate: () => void }) {
    const roles = ["PUBLIC", "RESEARCHER", "ADMIN"];

    const handleRoleChange = async (newRole: string) => {
        try {
            await fetch(`${API_BASE_URL}/admin/users/${user.id}/role`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "api-key": "SYSTEM_ADMIN_BYPASS" },
                body: JSON.stringify({ role: newRole })
            });
            onUpdate();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        // Commit 3: Table tbody hover shadows bounding row changes safely
        <tr className="border-b border-white/5 hover:bg-white/[0.02] hover:shadow-[0_4px_30px_rgba(0,229,255,0.05)] hover:border-primary/20 transition-all duration-300 group relative z-0 hover:z-10">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-[10px] font-bold text-primary border border-white/5">
                        {user.name?.[0] || user.id[0]}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-white/80">{user.name || "Unknown Identity"}</span>
                        <span className="text-[9px] text-muted/40 font-mono uppercase tracking-tighter">{user.id}</span>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-[10px] font-mono text-muted/60">{user.email || "N/A"}</td>
            <td className="px-6 py-4">
                <select
                    value={user.role || "PUBLIC"}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold text-primary font-mono focus:outline-none focus:border-primary/40 appearance-none cursor-pointer hover:bg-white/5 transition-colors"
                >
                    {roles.map(r => (
                        <option key={r} value={r} className="bg-black text-white">{r}</option>
                    ))}
                </select>
            </td>
            <td className="px-6 py-4">
                <button className="p-2 text-muted hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                    <RotateCcw size={14} />
                </button>
            </td>
        </tr>
    );
}

function SubTabBtn({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    // Commit 1: SubTabBtn flex offsets properly tracking active Glow limits gracefully.
    return (
        <button
            onClick={onClick}
            className={cn(
                "relative flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-colors z-10",
                active ? "text-white" : "text-muted hover:text-white"
            )}
        >
            {active && (
                <motion.div
                    layoutId="access-tab-glow"
                    className="absolute inset-0 bg-white/10 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.1)] -z-10"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            )}
            {icon}
            {label}
        </button>
    );
}

function SectionHeader({ title, description, action }: { title: string, description: string, action?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">{title}</h3>
                <p className="text-xs text-muted/60">{description}</p>
            </div>
            {action}
        </div>
    );
}

function CreateKeyBtn({ onUpdate }: { onUpdate: () => void }) {
    const [isCreating, setIsCreating] = useState(false);

    const handleClick = async () => {
        const name = prompt("Enter a name for this institutional key:");
        if (!name) return;
        setIsCreating(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/keys/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "api-key": "SYSTEM_ADMIN_BYPASS" },
                body: JSON.stringify({ name })
            });

            if (!res.ok) {
                const err = await res.json();
                alert(`Creation Failed: ${err.detail || 'Access Denied'}`);
                return;
            }

            const data = await res.json();
            prompt("NEW API KEY GENERATED. Copy this key now. It will not be shown again:", data.key);
            onUpdate();
        } catch (e) {
            alert(`Network Error: ${e instanceof Error ? e.message : 'Connection failed'}`);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isCreating}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-background rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all box-glow active:scale-95 disabled:opacity-50"
        >
            <Plus size={14} /> Generate High-Tier Key
        </button>
    );
}

function EmptyRegistry({ label }: { label: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-white/[0.01] border border-dashed border-white/5 rounded-2xl opacity-10">
            <Shield size={40} className="mb-4" />
            <span className="text-xs font-mono uppercase tracking-[0.3em]">{label}</span>
        </div>
    );
}
