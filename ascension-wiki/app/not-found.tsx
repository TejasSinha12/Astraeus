"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, Home, Terminal } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 text-center px-4 relative">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative"
            >
                <div className="text-[120px] md:text-[180px] font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-b from-primary/30 to-primary/5 leading-none select-none">
                    404
                </div>
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
            >
                <h1 className="text-2xl md:text-3xl font-bold text-white">System Path Not Found</h1>
                <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
                    The route you requested does not exist in the Astraeus framework architecture. The swarm cannot locate the requested resource.
                </p>
            </motion.div>

            {/* Terminal-style error */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-card rounded-xl p-4 max-w-md w-full border border-white/10"
            >
                <div className="flex items-center gap-2 mb-3">
                    <Terminal size={12} className="text-primary" />
                    <span className="text-[9px] font-mono text-muted/40 uppercase tracking-widest">Error Trace</span>
                </div>
                <pre className="text-[11px] font-mono text-red-400/80 text-left">
{`> GET /unknown_path
> Status: 404 NOT_FOUND
> Swarm: No agent matched this route
> Suggestion: Return to base`}
                </pre>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex gap-4 mt-2"
            >
                <Link href="/" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-background text-sm font-bold hover:bg-primary/90 transition-all box-glow">
                    <Home size={16} />
                    Return to Base
                </Link>
                <Link href="/coding" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-all">
                    <ArrowLeft size={16} />
                    Workspace
                </Link>
            </motion.div>
        </div>
    );
}
