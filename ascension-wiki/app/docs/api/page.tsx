"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, ChevronDown, ChevronRight, Zap, Key, Shield, Activity, CreditCard, GitBranch, Terminal, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Endpoint {
    method: "GET" | "POST" | "DELETE" | "PUT" | "PATCH";
    path: string;
    title: string;
    description: string;
    auth: "Bearer JWT" | "API Key" | "None";
    requestBody?: string;
    responseBody: string;
    statusCodes: { code: number; label: string }[];
}

const SECTIONS: { label: string; icon: React.ReactNode; endpoints: Endpoint[] }[] = [
    {
        label: "Swarm Execution",
        icon: <Zap size={14} className="text-primary" />,
        endpoints: [
            {
                method: "POST",
                path: "/execute/stream",
                title: "Execute Swarm (Streaming)",
                description: "Dispatches a multi-agent swarm to solve the given objective. Returns a streaming SSE response with real-time trace steps, intermediate reasoning, and the final generated code result.",
                auth: "Bearer JWT",
                requestBody: `{
  "objective": "Build a secure JWT auth system",
  "user_id": "user_abc123",
  "mode": "professional",
  "config": {
    "agents": { "auditor": true, "optimizer": true },
    "creativity": 0.5,
    "strictness": 0.8
  }
}`,
                responseBody: `{"status": "THINKING", "message": "Analyzing objective..."}
{"status": "PLANNING", "message": "Decomposing into sub-tasks..."}
{"status": "IMPLEMENT", "message": "Generating auth module..."}
{"status": "RESULT", "message": "<code>", "file_map": {...}}
{"status": "COMPLETED", "message": "Mission complete."}`,
                statusCodes: [
                    { code: 200, label: "Streaming response" },
                    { code: 402, label: "Insufficient tokens" },
                    { code: 429, label: "Rate limit exceeded" },
                ],
            },
            {
                method: "POST",
                path: "/forge/session",
                title: "Launch Forge Session",
                description: "Spawns 3 parallel evolutionary branches (Alpha, Beta, Gamma) with different architectural biases. Returns comparative metrics and code for each branch.",
                auth: "Bearer JWT",
                requestBody: `{
  "objective": "Build a real-time chat system"
}`,
                responseBody: `{
  "session_id": "forge_xyz",
  "branches": [
    { "label": "Alpha", "bias": "Performance", "code": "...", "score": 92 },
    { "label": "Beta", "bias": "Scalability", "code": "...", "score": 88 },
    { "label": "Gamma", "bias": "Elegance", "code": "...", "score": 95 }
  ]
}`,
                statusCodes: [
                    { code: 200, label: "Forge session created" },
                    { code: 402, label: "Insufficient tokens" },
                ],
            },
        ],
    },
    {
        label: "API Key Management",
        icon: <Key size={14} className="text-primary" />,
        endpoints: [
            {
                method: "POST",
                path: "/v1/keys/generate",
                title: "Generate API Key",
                description: "Creates a new scoped API key with specified permissions. Keys can be restricted to read-only, execute, or admin scopes.",
                auth: "Bearer JWT",
                requestBody: `{
  "label": "CI_CD_Pipeline",
  "scopes": ["execute", "read-only"]
}`,
                responseBody: `{
  "key": "ast_live_k1a2b3c4...",
  "label": "CI_CD_Pipeline",
  "scopes": ["execute", "read-only"],
  "created_at": "2026-04-14T12:00:00Z"
}`,
                statusCodes: [
                    { code: 201, label: "Key created" },
                    { code: 400, label: "Invalid scopes" },
                ],
            },
            {
                method: "GET",
                path: "/v1/keys/list",
                title: "List API Keys",
                description: "Returns all active API keys associated with the authenticated user, including metadata and scope information.",
                auth: "Bearer JWT",
                responseBody: `{
  "keys": [
    { "id": "key_1", "label": "CI_CD", "scopes": [...], "last_used": "..." }
  ]
}`,
                statusCodes: [{ code: 200, label: "Success" }],
            },
            {
                method: "DELETE",
                path: "/v1/keys/{key_id}",
                title: "Revoke API Key",
                description: "Permanently revokes and deletes the specified API key. This action cannot be undone.",
                auth: "Bearer JWT",
                responseBody: `{ "revoked": true }`,
                statusCodes: [
                    { code: 200, label: "Key revoked" },
                    { code: 404, label: "Key not found" },
                ],
            },
        ],
    },
    {
        label: "Platform Economy",
        icon: <CreditCard size={14} className="text-primary" />,
        endpoints: [
            {
                method: "GET",
                path: "/v1/economy/pricing/current",
                title: "Current Surge Pricing",
                description: "Returns the real-time dynamic pricing multiplier based on current platform load. The surge cap is bound to 3.00x maximum.",
                auth: "None",
                responseBody: `{
  "surge_multiplier": 1.15,
  "load_percent": 42,
  "cap": 3.0,
  "updated_at": "2026-04-14T12:00:00Z"
}`,
                statusCodes: [{ code: 200, label: "Current pricing" }],
            },
            {
                method: "GET",
                path: "/user/status",
                title: "User Account Status",
                description: "Returns the authenticated user's current token balance, plan type, and account health metrics.",
                auth: "Bearer JWT",
                responseBody: `{
  "balance": 15000,
  "plan_type": "PRO",
  "total_missions": 47
}`,
                statusCodes: [{ code: 200, label: "Account status" }],
            },
        ],
    },
    {
        label: "Mission Archive",
        icon: <GitBranch size={14} className="text-primary" />,
        endpoints: [
            {
                method: "GET",
                path: "/missions/list",
                title: "List Missions",
                description: "Returns a paginated list of all missions executed by the user, including objective, timestamps, and result availability.",
                auth: "API Key",
                responseBody: `{
  "missions": [
    {
      "id": "m_abc123",
      "objective": "Build auth system",
      "timestamp": 1712000000,
      "has_result": true
    }
  ]
}`,
                statusCodes: [{ code: 200, label: "Mission list" }],
            },
            {
                method: "GET",
                path: "/missions/{id}/source",
                title: "Get Mission Source",
                description: "Retrieves the generated source code for a specific mission, including multi-file project structures.",
                auth: "API Key",
                responseBody: `{
  "content": "// Generated code...",
  "filename": "auth.py",
  "is_multifile": false
}`,
                statusCodes: [
                    { code: 200, label: "Source retrieved" },
                    { code: 404, label: "Mission not found" },
                ],
            },
        ],
    },
    {
        label: "Security & Governance",
        icon: <Shield size={14} className="text-primary" />,
        endpoints: [
            {
                method: "GET",
                path: "/admin/audit-log",
                title: "Audit Log Stream",
                description: "Returns the cryptographically signed audit trail for all platform operations. Each entry includes an HMAC-SHA256 signature for tamper detection.",
                auth: "Bearer JWT",
                responseBody: `{
  "entries": [
    {
      "timestamp": "2026-04-14T12:00:00Z",
      "event": "KEY_CREATED",
      "actor": "user_abc",
      "signature": "sha256:a1b2c3..."
    }
  ]
}`,
                statusCodes: [
                    { code: 200, label: "Audit entries" },
                    { code: 403, label: "Not authorized" },
                ],
            },
        ],
    },
];

const METHOD_COLORS: Record<string, string> = {
    GET: "bg-green-500/20 text-green-400 border-green-500/30",
    POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
    PUT: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    PATCH: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
}

function CodeBlock({ code, language = "json" }: { code: string; language?: string }) {
    return (
        <div className="relative group">
            <button
                onClick={() => copyToClipboard(code)}
                className="absolute top-3 right-3 p-1.5 bg-white/5 border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-primary"
            >
                <Copy size={12} />
            </button>
            <pre className="bg-[#0a0f1a] border border-white/5 rounded-xl p-4 overflow-x-auto text-[11px] font-mono text-white/80 leading-relaxed">
                <code>{code}</code>
            </pre>
        </div>
    );
}

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all bg-white/[0.01]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-4 p-5 text-left group"
            >
                <span className={cn("px-3 py-1 rounded-lg text-[10px] font-bold font-mono uppercase border", METHOD_COLORS[endpoint.method])}>
                    {endpoint.method}
                </span>
                <code className="text-sm font-mono text-white/80 flex-1 group-hover:text-primary transition-colors">{endpoint.path}</code>
                <span className="text-[10px] text-muted/40 font-mono uppercase tracking-widest hidden md:block">{endpoint.auth}</span>
                {isOpen ? <ChevronDown size={16} className="text-muted shrink-0" /> : <ChevronRight size={16} className="text-muted shrink-0" />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-6 space-y-6 border-t border-white/5 pt-5">
                            <div>
                                <h4 className="text-xs font-bold text-white mb-2">{endpoint.title}</h4>
                                <p className="text-sm text-muted leading-relaxed">{endpoint.description}</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {endpoint.statusCodes.map(sc => (
                                    <span key={sc.code} className={cn(
                                        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono border",
                                        sc.code < 300 ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                        sc.code < 500 ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                                        "bg-red-500/10 text-red-400 border-red-500/20"
                                    )}>
                                        <CheckCircle2 size={10} />
                                        {sc.code} — {sc.label}
                                    </span>
                                ))}
                            </div>

                            {endpoint.requestBody && (
                                <div>
                                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-2">Request Body</span>
                                    <CodeBlock code={endpoint.requestBody} />
                                </div>
                            )}

                            <div>
                                <span className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-2">Response</span>
                                <CodeBlock code={endpoint.responseBody} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function APIDocsPage() {
    const [activeSection, setActiveSection] = useState(0);

    return (
        <div className="min-h-screen py-12 max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl">
                        <Terminal size={20} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">API Reference</h1>
                        <p className="text-sm text-muted mt-1">Swarm Execution API — v5.2.3</p>
                    </div>
                </div>
                <p className="text-muted max-w-2xl leading-relaxed">
                    Complete reference for the Ascension platform REST API. All endpoints require authentication via
                    <code className="mx-1 px-1.5 py-0.5 bg-white/5 text-primary text-xs rounded font-mono">Bearer JWT</code>
                    or scoped
                    <code className="mx-1 px-1.5 py-0.5 bg-white/5 text-primary text-xs rounded font-mono">API Key</code>
                    unless otherwise specified.
                </p>

                {/* Base URL */}
                <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-[#0a0f1a] border border-white/5 max-w-lg group">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest shrink-0">Base URL</span>
                    <code className="text-sm font-mono text-primary flex-1">https://api.astraeus.ai</code>
                    <button
                        onClick={() => copyToClipboard("https://api.astraeus.ai")}
                        className="p-1.5 bg-white/5 rounded-lg text-muted hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Copy size={12} />
                    </button>
                </div>
            </motion.div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-white/[0.02] border border-white/5 rounded-2xl">
                {SECTIONS.map((section, i) => (
                    <button
                        key={section.label}
                        onClick={() => setActiveSection(i)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all",
                            activeSection === i
                                ? "bg-primary/10 text-primary border border-primary/30"
                                : "text-muted hover:text-white hover:bg-white/5"
                        )}
                    >
                        {section.icon}
                        {section.label}
                    </button>
                ))}
            </div>

            {/* Endpoints */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                >
                    {SECTIONS[activeSection].endpoints.map((endpoint) => (
                        <EndpointCard key={endpoint.path} endpoint={endpoint} />
                    ))}
                </motion.div>
            </AnimatePresence>

            {/* Authentication Guide */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-16 p-8 rounded-2xl bg-surface border border-white/5"
            >
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Shield size={18} className="text-primary" />
                    Authentication
                </h2>
                <p className="text-sm text-muted leading-relaxed mb-6">
                    Include your authentication token in all requests. JWT tokens are obtained from Clerk authentication.
                    API keys can be generated from the Developer Settings panel.
                </p>
                <CodeBlock code={`# Using JWT (recommended for browser clients)
curl -X POST https://api.astraeus.ai/execute/stream \\
  -H "Authorization: Bearer eyJhbG..." \\
  -H "Content-Type: application/json" \\
  -d '{"objective": "Build auth system"}'

# Using API Key (recommended for server-to-server)
curl -X GET https://api.astraeus.ai/missions/list \\
  -H "api-key: ast_live_k1a2b3c4..."`} />
            </motion.div>
        </div>
    );
}
