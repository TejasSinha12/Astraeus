"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Key, Plus, Trash2, Copy, Check, ShieldAlert, Cpu, Database, Network, Github, Link as LinkIcon, ExternalLink, Globe, Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_PLATFORM_API_URL || "http://localhost:8000";

export default function DeveloperSettings() {
    const { getToken, userId } = useAuth();
    const [keys, setKeys] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [newKeyLabel, setNewKeyLabel] = useState("");
    const [freshKey, setFreshKey] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGitHubConnected, setIsGitHubConnected] = useState(false);
    const [githubUser, setGithubUser] = useState<string | null>(null);
    const [webhookUrl, setWebhookUrl] = useState("");
    const [isSavingWebhook, setIsSavingWebhook] = useState(false);

    const fetchKeys = async () => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/v1/keys/list`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "x-clerk-user-id": userId || ""
                }
            });
            const data = await response.json();
            setKeys(data);

            // Fetch webhook settings too
            const userResp = await fetch(`${API_BASE_URL}/v1/keys/webhook`, {
                headers: { "x-clerk-user-id": userId || "" }
            });
            if (userResp.ok) {
                const userData = await userResp.json();
                setWebhookUrl(userData.webhook_url || "");
            }
        } catch (error) {
            console.error("Failed to fetch keys", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userId) fetchKeys();
    }, [userId]);

    const handleGenerate = async () => {
        if (!newKeyLabel) return;
        setIsGenerating(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/v1/keys/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "x-clerk-user-id": userId || ""
                },
                body: JSON.stringify({ label: newKeyLabel, scopes: ["execute", "research"] })
            });
            const data = await response.json();
            setFreshKey(data);
            fetchKeys();
            setNewKeyLabel("");
            toast.success("API Key Generated Successfully");
        } catch (error) {
            toast.error("Failed to generate key");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRevoke = async (id: string) => {
        if (!confirm("Are you sure? This will immediately break any integrations using this key.")) return;
        try {
            const token = await getToken();
            await fetch(`${API_BASE_URL}/v1/keys/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "x-clerk-user-id": userId || ""
                }
            });
            fetchKeys();
            toast.success("Key Revoked");
        } catch (error) {
            toast.error("Failed to revoke key");
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    const handleSaveWebhook = async () => {
        setIsSavingWebhook(true);
        try {
            const token = await getToken();
            await fetch(`${API_BASE_URL}/v1/keys/webhook`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "x-clerk-user-id": userId || ""
                },
                body: JSON.stringify({ url: webhookUrl })
            });
            toast.success("Webhook URL Updated");
        } catch (error) {
            toast.error("Failed to update webhook");
        } finally {
            setIsSavingWebhook(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 lg:p-16">
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Header */}
                <header className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl shadow-[0_0_20px_rgba(0,229,255,0.1)]">
                            <Key className="text-primary w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold uppercase tracking-widest">Developer <span className="text-primary font-light">Access Manager</span></h1>
                            <p className="text-[10px] text-muted uppercase tracking-[0.3em]">Programmatic Swarm Orchestration Interface</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Key List */}
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-surface border border-white/5 rounded-3xl p-8 space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Database size={14} className="text-primary" /> Active Credentials
                                </h2>
                                <span className="text-[10px] font-mono text-muted/40 uppercase bg-white/5 px-2 py-1 rounded">Count: {keys.length}</span>
                            </div>

                            {isLoading ? (
                                <div className="space-y-4 animate-pulse">
                                    {[1, 2].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl" />)}
                                </div>
                            ) : keys.length === 0 ? (
                                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                                    <ShieldAlert size={48} className="mx-auto text-white/10 mb-4" />
                                    <p className="text-muted text-xs uppercase tracking-widest">No keys found. Generate one to begin programmatic access.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {keys.map((k) => (
                                        <div key={k.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between hover:border-white/10 transition-all group">
                                            <div className="space-y-1">
                                                <h3 className="text-[11px] font-bold uppercase tracking-wider">{k.label}</h3>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[9px] font-mono text-muted/40 uppercase">ID: {k.id}</span>
                                                    <span className="text-[9px] font-mono text-primary/60 uppercase">Used: {k.usage.toFixed(0)} calls</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleRevoke(k.id)} className="p-2 hover:bg-red-500/10 text-muted hover:text-red-500 rounded-lg transition-all" title="Revoke Key">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 flex items-start gap-4">
                            <Network className="text-primary shrink-0" size={20} />
                            <div className="space-y-2">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Integration Guide</h3>
                                <p className="text-[10px] text-muted leading-relaxed uppercase tracking-wider">
                                    Include the header <code className="text-white bg-white/5 px-1 rounded">api-key: YOUR_KEY</code> in your requests to the platform API. Scopes are restricted based on your researcher tier.
                                </p>
                            </div>
                        </div>

                        {/* GitHub Integration Section */}
                        <section className="bg-surface border border-white/5 rounded-3xl p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Github size={14} className="text-[#333] dark:text-white" /> Source Control
                                </h2>
                                {isGitHubConnected ? (
                                    <span className="text-[10px] font-mono text-green-500 uppercase bg-green-500/10 px-2 py-1 rounded flex items-center gap-1">
                                        <Check size={10} /> Connected: {githubUser}
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-mono text-muted/40 uppercase bg-white/5 px-2 py-1 rounded">Disconnected</span>
                                )}
                            </div>

                            <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-primary/20 transition-all">
                                <div className="space-y-1">
                                    <h3 className="text-[11px] font-bold uppercase tracking-wider">GitHub OAuth</h3>
                                    <p className="text-[9px] text-muted/40 uppercase tracking-wide">Enable automated PR creation & repo mutations</p>
                                </div>
                                <button
                                    onClick={() => {
                                        // Simplified simulation for demo, in production this triggers Clerk GitHub OAuth
                                        setIsGitHubConnected(true);
                                        setGithubUser("tejas-sinha");
                                        toast.success("GitHub Account Linked");
                                    }}
                                    className={cn(
                                        "px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all",
                                        isGitHubConnected
                                            ? "bg-white/5 text-muted border border-white/5 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20"
                                            : "bg-white text-black hover:bg-white/90"
                                    )}
                                >
                                    {isGitHubConnected ? (
                                        <>Disconnect Account</>
                                    ) : (
                                        <>
                                            <LinkIcon size={14} />
                                            Connect GitHub
                                        </>
                                    )}
                                </button>
                            </div>
                        </section>

                        {/* Webhook Configuration Section */}
                        <section className="bg-surface border border-white/5 rounded-3xl p-8 space-y-6">
                            <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <Globe size={14} className="text-primary" /> Outbound Webhooks
                            </h2>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] text-muted uppercase tracking-widest ml-1">Payload Destination URL</label>
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            value={webhookUrl}
                                            onChange={(e) => setWebhookUrl(e.target.value)}
                                            placeholder="https://api.yourdomain.com/webhooks/astraeus"
                                            className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-[11px] font-mono focus:outline-none focus:border-primary/40 transition-all"
                                        />
                                        <button
                                            onClick={handleSaveWebhook}
                                            disabled={isSavingWebhook}
                                            className="px-6 bg-white/[0.05] border border-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                                        >
                                            {isSavingWebhook ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                                            Save
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[9px] text-muted/40 uppercase tracking-widest leading-relaxed">
                                    Astraeus will dispatch a POST payload to this URL on <code className="text-primary/60">MISSION_SUCCESS</code>, <code className="text-red-500/60">MISSION_FAILURE</code>, and <code className="text-yellow-500/60">QUOTA_EXCEEDED</code> events.
                                </p>
                            </div>
                        </section>

                        {/* Notification Preferences */}
                        <section className="bg-surface border border-white/5 rounded-3xl p-8 space-y-6">
                            <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <Bell size={14} className="text-primary" /> Mission Notifications
                            </h2>
                            <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                                <div className="space-y-1">
                                    <h3 className="text-[11px] font-bold uppercase tracking-wider">Email Mission Reports</h3>
                                    <p className="text-[9px] text-muted/40 uppercase tracking-wide">Receive high-fidelity HTML reports upon swarm completion</p>
                                </div>
                                <div className="w-12 h-6 bg-primary/20 rounded-full relative p-1 cursor-pointer">
                                    <div className="w-4 h-4 bg-primary rounded-full absolute right-1 shadow-[0_0_10px_rgba(0,229,255,0.5)]" />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Generator Sidebar */}
                    <div className="space-y-6">
                        <section className="bg-surface border border-white/5 rounded-3xl p-8 space-y-6">
                            <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <Plus size={14} className="text-primary" /> Generate New Key
                            </h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] text-muted uppercase tracking-widest ml-1">Key Label</label>
                                    <input
                                        type="text"
                                        value={newKeyLabel}
                                        onChange={(e) => setNewKeyLabel(e.target.value)}
                                        placeholder="Production Backend..."
                                        className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-[11px] font-mono focus:outline-none focus:border-primary/40 transition-all"
                                    />
                                </div>
                                <button
                                    onClick={handleGenerate}
                                    disabled={!newKeyLabel || isGenerating}
                                    className="w-full py-3 bg-primary text-black rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
                                >
                                    {isGenerating ? "Synthesizing..." : "Generate Credential"}
                                </button>
                            </div>
                        </section>

                        {/* Fresh Key Reveal */}
                        <AnimatePresence>
                            {freshKey && (
                                <motion.section
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-8 space-y-4 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-2">
                                        <button onClick={() => setFreshKey(null)} className="text-yellow-500/40 hover:text-yellow-500">
                                            <ShieldAlert size={14} />
                                        </button>
                                    </div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-yellow-500">Security Warning</h3>
                                    <p className="text-[9px] text-yellow-500/60 leading-relaxed uppercase tracking-wide">
                                        This key will only be shown once. Copy it to a secure location immediately.
                                    </p>
                                    <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-xl p-4 group">
                                        <code className="text-[10px] font-mono text-white flex-1 overflow-hidden text-ellipsis">{freshKey.api_key}</code>
                                        <button onClick={() => copyToClipboard(freshKey.api_key)} className="p-2 hover:bg-white/10 rounded-lg transition-all text-muted hover:text-white">
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                </motion.section>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
