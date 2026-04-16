"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Key, Plus, Trash2, Copy, Check, ShieldAlert, Cpu, Database, Network, Github, Link as LinkIcon, ExternalLink, Globe, Bell, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_PLATFORM_API_URL || "http://localhost:8000";

export default function DeveloperSettings() {
    const { getToken, userId } = useAuth();
    const { user } = useUser();
    const [keys, setKeys] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [newKeyLabel, setNewKeyLabel] = useState("");
    const [freshKey, setFreshKey] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [webhookUrl, setWebhookUrl] = useState("");
    const [isSavingWebhook, setIsSavingWebhook] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    useEffect(() => {
        if (user) {
            setNotificationsEnabled(!!user.unsafeMetadata?.intelReports);
        }
    }, [user]);

    const githubAccount = user?.externalAccounts.find(a => a.provider === "github");
    const isGitHubConnected = !!githubAccount;
    const githubUser = (githubAccount as any)?.username || (githubAccount as any)?.id;

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
        if (!/^https:\/\/[^\s$.?#].[^\s]*$/.test(webhookUrl)) {
            toast.error("Invalid Webhook URL. Must be a secure https:// endpoint.");
            return;
        }

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

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    {/* Key List - Prime Column */}
                    <div className="xl:col-span-8 space-y-8">
                        <section className="bg-surface border border-white/5 rounded-[2rem] p-10 space-y-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 transition-opacity group-hover:opacity-100 opacity-50" />

                            <div className="flex items-center justify-between relative z-10">
                                <div className="space-y-1">
                                    <h2 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                                        <Database size={16} className="text-primary" /> Active Credentials
                                    </h2>
                                    <p className="text-[10px] text-muted uppercase tracking-widest">Manage your swarm-tier access tokens</p>
                                </div>
                                <span className="text-[10px] font-mono text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full uppercase">
                                    {keys.length} ACTIVE
                                </span>
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
                                                <button onClick={() => handleRevoke(k.id)} aria-label={`Revoke key ${k.label}`} className="p-2 hover:bg-red-500/10 text-muted hover:text-red-500 rounded-lg transition-all" title="Revoke Key">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Integration Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* GitHub Integration Section */}
                            <section className="bg-surface border border-white/5 rounded-[2rem] p-8 space-y-6 relative overflow-hidden group" aria-labelledby="github-integration-heading">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center justify-between relative z-10">
                                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Github size={16} className="text-primary" /> Source Control
                                    </h2>
                                    {isGitHubConnected ? (
                                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                    ) : (
                                        <div className="w-2 h-2 rounded-full bg-white/10" />
                                    )}
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                                        <div className="space-y-1">
                                            <h3 className="text-[10px] font-bold uppercase tracking-wider">GitHub OAuth</h3>
                                            <p className="text-[9px] text-muted uppercase tracking-wide leading-relaxed">
                                                {isGitHubConnected
                                                    ? `Linked to ${githubUser}`
                                                    : "Autonomous PR creation & repo mutations"}
                                            </p>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (isGitHubConnected) {
                                                    if(confirm("Are you sure you want to disconnect GitHub?")) {
                                                        try {
                                                            await githubAccount?.destroy();
                                                            toast.success("GitHub Disconnected. Refreshing...");
                                                            setTimeout(() => window.location.reload(), 1500);
                                                        } catch (err: any) {
                                                            toast.error(err.message || "Failed to disconnect GitHub");
                                                        }
                                                    }
                                                } else {
                                                    try {
                                                        const res = await user?.createExternalAccount({
                                                            strategy: "oauth_github",
                                                            redirectUrl: window.location.href
                                                        });
                                                        if (res && res.verification?.externalVerificationRedirectURL) {
                                                            window.location.href = res.verification.externalVerificationRedirectURL.toString();
                                                        }
                                                    } catch (err: any) {
                                                        toast.error(err.message || "Link failed");
                                                    }
                                                }
                                            }}
                                            className={cn(
                                                "w-full py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                                                isGitHubConnected
                                                    ? "bg-white/5 text-muted border border-white/5 hover:bg-white/10 hover:text-red-400"
                                                    : "bg-white text-black hover:bg-primary transition-all active:scale-[0.98]"
                                            )}
                                        >
                                            {isGitHubConnected ? <><Trash2 size={12} /> Disconnect</> : <><LinkIcon size={12} /> Connect</>}
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {/* Webhook Configuration Section */}
                            <section className="bg-surface border border-white/5 rounded-[2rem] p-8 space-y-6 relative overflow-hidden group" aria-labelledby="github-integration-heading">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 relative z-10">
                                    <Globe size={16} className="text-primary" /> Webhooks
                                </h2>

                                <div className="space-y-4 relative z-10">
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={webhookUrl}
                                            onChange={(e) => setWebhookUrl(e.target.value)}
                                            placeholder="HTTPS Destination URL..."
                                            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-[11px] font-mono focus:outline-none focus:border-primary/40 transition-all placeholder:text-muted/20"
                                        />
                                        <button
                                            onClick={handleSaveWebhook}
                                            disabled={isSavingWebhook}
                                            className="w-full py-3 bg-primary/10 border border-primary/20 text-primary rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                        >
                                            {isSavingWebhook ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                            Save Endpoint
                                        </button>
                                    </div>
                                    <p className="text-[8px] text-muted/40 uppercase tracking-widest leading-relaxed text-center">
                                        Dispatched on SUCCESS/FAILURE events
                                    </p>
                                </div>
                            </section>
                        </div>

                        {/* Notification Preferences */}
                        <section className="bg-surface border border-white/5 rounded-[2rem] p-8 space-y-6 relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Bell size={16} className="text-primary" />
                                    <div>
                                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em]">Intel Reports</h2>
                                        <p className="text-[9px] text-muted uppercase tracking-widest">Email Mission Summaries</p>
                                    </div>
                                </div>
                                <div 
                                    onClick={async () => {
                                        try {
                                            const newStatus = !notificationsEnabled;
                                            await user?.update({ unsafeMetadata: { ...user.unsafeMetadata, intelReports: newStatus } });
                                            setNotificationsEnabled(newStatus);
                                            toast.success(newStatus ? "Intel Reports Enabled" : "Intel Reports Disabled");
                                        } catch (e) {
                                            toast.error("Failed to update notification preferences");
                                        }
                                    }}
                                    className={`w-10 h-5 rounded-full relative p-1 cursor-pointer transition-colors ${notificationsEnabled ? 'bg-primary' : 'bg-white/20'}`}
                                >
                                    <div className={`w-3 h-3 bg-black rounded-full absolute top-1 transition-all ${notificationsEnabled ? 'right-1' : 'left-1 bg-white'}`} />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Generator Sidebar */}
                    <div className="xl:col-span-4 space-y-8">
                        <section className="bg-surface border border-white/5 rounded-[2rem] p-8 space-y-8 relative overflow-hidden">
                            <div className="space-y-1">
                                <h2 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                                    <Plus size={16} className="text-primary" /> Provision
                                </h2>
                                <p className="text-[10px] text-muted uppercase tracking-widest font-medium">Create new swarm credentials</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] text-muted uppercase tracking-widest ml-1 font-bold">Label</label>
                                    <input
                                        type="text"
                                        value={newKeyLabel}
                                        onChange={(e) => setNewKeyLabel(e.target.value)}
                                        placeholder="E.g. Production Cluster"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[11px] font-mono focus:outline-none focus:border-primary/40 transition-all placeholder:text-muted/20"
                                    />
                                </div>
                                <button
                                    onClick={handleGenerate}
                                    disabled={!newKeyLabel || isGenerating}
                                    className="w-full py-4 bg-primary text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white transition-all disabled:opacity-50 box-glow active:scale-[0.98]"
                                >
                                    {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <><Cpu size={14} /> Generate</>}
                                </button>
                            </div>
                        </section>

                        <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-8 flex flex-col gap-4 relative overflow-hidden group">
                            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700" />
                            <Network className="text-primary shrink-0 mb-1" size={24} />
                            <div className="space-y-3 relative z-10">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Integration</h3>
                                <p className="text-[9px] text-muted leading-relaxed uppercase tracking-widest font-bold opacity-70">
                                    Inject the <code className="text-white bg-white/10 px-1.5 py-0.5 rounded">api-key</code> header to authorize swarm requests.
                                </p>
                            </div>
                        </div>

                        {/* Fresh Key Reveal */}
                        <AnimatePresence>
                            {freshKey && (
                                <motion.section
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-yellow-500/10 border border-yellow-500/20 rounded-[2rem] p-8 space-y-6 relative overflow-hidden"
                                >
                                    <div className="absolute top-4 right-4">
                                        <button onClick={() => setFreshKey(null)} className="text-yellow-500/40 hover:text-yellow-500 p-2">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-yellow-500 flex items-center gap-2">
                                            <ShieldAlert size={14} /> Security Alert
                                        </h3>
                                        <p className="text-[9px] text-yellow-500/60 leading-relaxed uppercase tracking-widest font-bold">
                                            Store this key securely. It will not be shown again.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-black/60 border border-white/10 rounded-2xl p-5 group relative">
                                        <code className="text-[10px] font-mono text-white flex-1 overflow-hidden text-ellipsis pr-8">{freshKey.api_key}</code>
                                        <button onClick={() => copyToClipboard(freshKey.api_key)} aria-label="Copy new API key to clipboard" className="absolute right-4 p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-muted hover:text-white">
                                            <Copy size={16} />
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
