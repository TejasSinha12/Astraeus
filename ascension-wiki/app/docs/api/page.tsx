"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function APIDocsPage() {
    const [isLoading, setIsLoading] = useState(true);
    // Default to production API URL if NEXT_PUBLIC_PLATFORM_API_URL isn't set
    const [apiUrl, setApiUrl] = useState("https://astraeus-r4pf.onrender.com");

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_PLATFORM_API_URL) {
            setApiUrl(process.env.NEXT_PUBLIC_PLATFORM_API_URL);
        }
    }, []);

    return (
        <div className="w-full h-[calc(100vh-64px)] pt-16 flex flex-col md:flex-row bg-background">
            <div className="w-full md:w-[450px] bg-white/[0.02] border-r border-white/10 p-6 overflow-y-auto space-y-8 custom-scrollbar">
                <div>
                    <h2 className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Scoped Keys Access</h2>
                    <p className="text-xs text-muted mb-3">API Keys natively restrict execution constraints via architecture RBAC. Provide <code className="text-white bg-white/5 px-1 rounded">["execute"]</code> or <code className="text-white bg-white/5 px-1 rounded">["read-only"]</code> arrays.</p>
                    <div className="bg-black/50 p-3 rounded-lg border border-white/5 font-mono text-[10px] text-green-400 break-all leading-relaxed shadow-inner">
                        curl -X POST /v1/keys/generate \<br/>
                        -H "Authorization: Bearer ast_token" \<br/>
                        -d '&#123;"label": "CI_CD", "scopes": ["read-only"]&#125;'
                    </div>
                </div>

                <div>
                    <h2 className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Dynamic Economy Surge</h2>
                    <p className="text-xs text-muted mb-3">Poll the platform orchestrator for live execution loads before large AST ingestions. Max cap bound natively to <span className="text-red-400 font-mono">3.00x</span>.</p>
                    <div className="bg-black/50 p-3 rounded-lg border border-white/5 font-mono text-[10px] text-green-400 break-all shadow-inner">
                        curl -X GET /v1/economy/pricing/current
                    </div>
                </div>

                <div>
                    <h2 className="text-xs font-bold text-primary uppercase tracking-widest mb-2">GitHub Webhook Pipeline (.YAML)</h2>
                    <p className="text-xs text-muted mb-3">Push source changes securely by hooking Github Actions directly into the Forge layer. Pass the HMAC cryptographic hash signature.</p>
                    <div className="bg-black/50 p-3 rounded-lg border border-white/5 font-mono text-[10px] text-white/70 shadow-inner">
                        <span className="text-blue-400">headers:</span><br/>
                        &nbsp;&nbsp;<span className="text-green-400">X-Hub-Signature-256:</span> sha256=1bc2...<br/>
                        &nbsp;&nbsp;<span className="text-green-400">Content-Type:</span> application/json
                    </div>
                </div>
            </div>

            <div className="flex-1 relative bg-white">
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background text-primary">
                        <Loader2 className="w-8 h-8 animate-spin mb-4" />
                        <p className="font-mono text-sm">Loading Interactive Swagger Registry...</p>
                    </div>
                )}
                <iframe
                    src={`${apiUrl}/docs`}
                    className="w-full h-full border-none"
                    onLoad={() => setIsLoading(false)}
                    title="Astraeus API Documentation"
                />
            </div>
        </div>
    );
}
