"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Terminal, Zap, Shield, Cpu, Play, CheckCircle2, Loader2, Flame, Github, Twitter, Linkedin, ChevronDown, Copy, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function Home() {
  const [demoState, setDemoState] = useState<"idle" | "running" | "completed">("idle");
  const [demoLogs, setDemoLogs] = useState<string[]>([]);

  useEffect(() => {
    if (demoState !== "running") return;

    setDemoLogs([]);
    const executionLogs = [
      { text: "> SYSTEM: Initializing Swarm Cluster...", delay: 200 },
      { text: "> COORD: Dispatched [Architect, Implementer, Auditor]", delay: 800 },
      { text: "> ARCHITECT: Analyzing objective structure...", delay: 1500 },
      { text: "> IMPLEMENTER: Generating secure authentication payload.", delay: 2200 },
      { text: "> AUDITOR: Validating generated payload. Status: PASS.", delay: 3100 },
      { text: "> LEDGER: Verifying Cryptographic Signature. OK.", delay: 3500 },
      { text: "> SYSTEM: Mission Completed successfully.", delay: 4200 },
    ];

    let timeouts: NodeJS.Timeout[] = [];
    executionLogs.forEach((log) => {
      const timeout = setTimeout(() => {
        setDemoLogs((prev) => [...prev, log.text]);
        if (log.text.includes("Mission Completed")) {
          setTimeout(() => setDemoState("completed"), 800);
        }
      }, log.delay);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach((t) => clearTimeout(t));
  }, [demoState]);

  return (
    <div className="min-h-screen pt-20 pb-0 px-4 sm:px-8 md:px-12 lg:px-20 max-w-7xl mx-auto flex flex-col items-center relative overflow-hidden font-inter">

      {/* Dynamic Background Glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse-slow" />

      {/* 🔥 New Feature Announcement Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl mx-auto mb-8"
      >
        <Link href="/arena" className="block">
          <div className="flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500/10 via-primary/10 to-purple-500/10 border border-primary/20 hover:border-primary/40 transition-all group cursor-pointer relative overflow-hidden">
            <motion.div 
              animate={{ x: ["-100%", "200%"] }} 
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent pointer-events-none"
            />
            <Flame size={16} className="text-orange-400 group-hover:scale-125 transition-transform" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Global Patch:</span>
            <span className="text-[10px] text-muted font-mono">The Forge — Deployment Evolution live</span>
            <ArrowRight size={14} className="text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </motion.div>

      {/* Hero Section */}
      <motion.section
        className="w-full flex flex-col items-center text-center mt-6 md:mt-16 mb-24"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-[11px] font-mono uppercase tracking-widest mb-8 backdrop-blur-md box-glow"
          whileHover={{ scale: 1.05 }}
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Astraeus v5.3.0 is Live
        </motion.div>

        <h1 className="text-5xl sm:text-7xl md:text-[5.5rem] font-extrabold tracking-tight text-white mb-6 leading-tight">
          Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Swarm AGI</span>
        </h1>

        <p className="text-base md:text-lg text-muted/80 max-w-3xl mx-auto mb-12 leading-relaxed font-sans">
          Deploy production-grade multi-agent reasoning. Replace brittle LLM calls with a high-performance Swarm Execution API featuring deterministic logs, structured telemetry, and enterprise billing.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 items-center">
          <Link href="/sign-up">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(0,229,255,0.4)" }}
              whileTap={{ scale: 0.95 }}
              aria-label="Get started with Astraeus for free"
              className="px-8 py-4 rounded-xl bg-primary text-background font-bold flex items-center gap-2 transition-all box-glow text-lg"
            >
              Start Building Free
              <ArrowRight size={20} aria-hidden="true" />
            </motion.button>
          </Link>
          <Link href="/docs/api">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.05)" }}
              whileTap={{ scale: 0.95 }}
              aria-label="View API Documentation"
              className="px-8 py-4 rounded-xl glass border border-white/10 text-white font-medium flex items-center gap-2 transition-all text-lg"
            >
              <Terminal size={20} aria-hidden="true" />
              Read the Docs
            </motion.button>
          </Link>
        </div>

        {/* Scroll Discover Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-24 flex flex-col items-center gap-3"
        >
          <span className="text-[10px] font-mono text-muted/40 uppercase tracking-[0.3em]">Discover Swarm Flow</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-primary/50 to-transparent relative">
            <motion.div 
              animate={{ y: [0, 48] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full box-glow"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Live Interactive Demo Section */}
      <motion.section
        className="w-full max-w-4xl mx-auto mb-32"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
      >
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
          <div className="bg-black/50 border-b border-white/5 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-4 text-xs font-mono text-muted">astraeus-terminal — zsh</span>
            </div>
            <button
              onClick={() => demoState === "idle" || demoState === "completed" ? setDemoState("running") : null}
              disabled={demoState === "running"}
              className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 hover:bg-primary/20 rounded-lg font-mono text-xs text-primary border border-primary/30 font-bold transition-colors disabled:opacity-50"
            >
              {demoState === "running" ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
              {demoState === "running" ? "EXECUTING..." : "RUN DEMO"}
            </button>
          </div>
          <div className="p-6 bg-[#0a0f1a] min-h-[280px] font-mono text-sm">
            <div className="text-white/70 mb-4 flex items-center justify-between group/code">
              <div className="flex items-center gap-2">
                <span className="text-green-400">user@ascension</span>
                <span className="text-white/40">~ %</span>
                <span className="text-blue-300 lang="bash"">curl -X POST /v1/execute/swarm -d &apos;&#123; &quot;objective&quot;: &quot;build_auth&quot; &#125;&apos;</span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText("curl -X POST https://api.astraeus.ai/v1/execute/swarm -d '{\"objective\": \"build_auth\"}'");
                  toast.success("Command copied to clipboard");
                }}
                className="opacity-0 group-hover/code:opacity-100 p-1.5 hover:bg-white/10 rounded transition-all text-white/40 hover:text-primary"
                title="Copy Command"
              >
                <Copy size={14} />
              </button>
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {demoLogs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-start gap-2 ${log.includes("PASS") || log.includes("OK") || log.includes("successfully") ? "text-green-400" : log.includes("SYSTEM") ? "text-primary" : "text-muted"}`}
                  >
                    <span>{log}</span>
                  </motion.div>
                ))}
              </AnimatePresence>

              {demoState === "completed" && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                  className="mt-6 p-4 rounded bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} />
                    <span>Response Generated: 4 files created. (Cost: 0.05 credits)</span>
                  </div>
                  <Link href="/sign-up" className="text-xs underline hover:text-green-300">View in Workspace &rarr;</Link>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Pillars Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-32" aria-labelledby="pillars-heading"><h2 id="pillars-heading" className="sr-only">Platform Capabilities</h2>
        <PillarCard
          icon={<Cpu className="text-primary" />}
          title="Swarm Execution API"
          description="Move beyond brittle single-shot LLM calls. Astraeus orchestrates Planners, Architects, and Auditors concurrently to solve complex logic."
          features={["Multi-Agent Consensus", "Atomic Execution Flow", "Fitness-Gated Validation"]}
        />
        <PillarCard
          icon={<Zap className="text-primary" />}
          title="Developer Infrastructure"
          description="Build it right from day one. Managed API keys, real-time usage telemetry, automated Stripe billing, and mission persistence."
          features={["Scoped Key Management", "Token Rate Limiting", "Stripe Billing Bridge"]}
        />
        <PillarCard
          icon={<Shield className="text-primary" />}
          title="Institutional Governance"
          description="Auditability by design. Immutable ledgers, cryptographically signed logs, Team Billing, and OTel-compatible telemetry exports."
          features={["Signed Billing Ledger", "Organization Credit Pools", "Security Audit Logs"]}
        />
      </section>

      {/* Trusted By / Social Proof */}
      <motion.section
        className="w-full mb-32"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <p className="text-center text-[10px] font-mono text-muted/40 uppercase tracking-[0.4em] mb-8">Powering Intelligence Infrastructure</p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-30 px-6">
          {["OpenAI", "Vercel", "Neon", "Stripe", "Clerk", "Render"].map(name => (
            <span key={name} className="text-sm md:text-lg font-bold text-white tracking-widest uppercase">{name}</span>
          ))}
        </div>
      </motion.section>

      {/* FAQ Section */}
      <section className="w-full max-w-3xl mx-auto mb-32">
        <h2 className="text-2xl font-bold text-white text-center mb-10">Frequently Asked <span className="text-primary">Questions</span></h2>
        <div className="space-y-4">
          <FAQItem q="How does the token billing work?" a="Every swarm execution is priced dynamically based on objective complexity and cluster load. Costs are deducted from your signed ledger in real-time. Failed executions are automatically refunded." />
          <FAQItem q="What is The Forge?" a="The Forge spawns 3 parallel swarms with different architectural biases (Performance, Scalability, Elegance) for the same objective. A side-by-side Performance Duel benchmarks all three and suggests the optimal branch." />
          <FAQItem q="Can I use this with my existing codebase?" a="Yes. The Swarm Execution API accepts any objective via REST. Generated code can be deployed directly to GitHub via our integration, or exported as a ZIP archive." />
          <FAQItem q="Is my data secure?" a="Absolutely. All transactions are HMAC-SHA256 signed, sessions use Clerk JWT authentication, and execution runs in hardened sandboxes with restricted egress." />
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="w-screen -mx-4 sm:-mx-8 md:-mx-12 lg:-mx-20 border-t border-white/5 bg-black/40 backdrop-blur-md mt-auto">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-primary rounded-full box-glow" />
                <span className="text-sm font-bold tracking-widest text-white">ASCENSION</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Autonomous Swarm-as-a-Service. Production-grade multi-agent AI for institutional engineering.
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Product</h4>
              <ul className="space-y-3">
                <li><Link href="/coding" className="text-sm text-muted hover:text-primary transition-colors hover:underline underline-offset-4">Workspace</Link></li>
                <li><Link href="/arena" className="text-sm text-muted hover:text-primary transition-colors hover:underline underline-offset-4">Agent Arena</Link></li>
                <li><Link href="/pricing" className="text-sm text-muted hover:text-primary transition-colors hover:underline underline-offset-4">Pricing</Link></li>
                <li><Link href="/archive" className="text-sm text-muted hover:text-primary transition-colors hover:underline underline-offset-4">Mission Archive</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Developers</h4>
              <ul className="space-y-3">
                <li><Link href="/docs/api" className="text-sm text-muted hover:text-primary transition-colors hover:underline underline-offset-4">API Reference</Link></li>
                <li><Link href="/settings/developer" className="text-sm text-muted hover:text-primary transition-colors hover:underline underline-offset-4">API Keys</Link></li>
                <li><Link href="/docs/core" className="text-sm text-muted hover:text-primary transition-colors hover:underline underline-offset-4">Documentation</Link></li>
                <li><Link href="/whitepaper" className="text-sm text-muted hover:text-primary transition-colors hover:underline underline-offset-4">Whitepaper</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Connect</h4>
              <div className="flex gap-4">
                <a href="https://github.com/TejasSinha12/Astraeus" target="_blank" rel="noopener noreferrer" aria-label="Visit Github Repository" className="p-2 rounded-lg bg-white/5 text-muted hover:text-white hover:bg-white/10 transition-all">
                  <Github size={18} aria-hidden="true" />
                </a>
                <a href="https://twitter.com/ascension_ai" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Twitter" className="p-2 rounded-lg bg-white/5 text-muted hover:text-white hover:bg-white/10 transition-all">
                  <Twitter size={18} aria-hidden="true" />
                </a>
                <a href="https://linkedin.com/company/ascension-ai" target="_blank" rel="noopener noreferrer" aria-label="Connect on LinkedIn" className="p-2 rounded-lg bg-white/5 text-muted hover:text-white hover:bg-white/10 transition-all">
                  <Linkedin size={18} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-muted/40 font-mono uppercase tracking-widest">
              © 2026 Ascension Intelligence. All rights reserved.
            </p>
            <p className="text-[10px] text-muted/40 font-mono uppercase tracking-widest">
              v5.3.0 — Built with 🧬 by Tejas Sinha
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PillarCard({ icon, title, description, features }: any) {
  return (
    <motion.div
      className="p-8 rounded-2xl bg-surface border border-white/5 hover:border-primary/20 transition-all flex flex-col gap-6"
      whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,229,255,0.1)" }}
    >
      <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center box-glow">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-sm text-muted leading-relaxed mb-6">{description}</p>
        <ul className="flex flex-col gap-3">
          {features.map((f: string) => (
            <li key={f} className="text-[12px] font-mono text-muted/70 flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40 box-glow" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-white/5 rounded-2xl overflow-hidden bg-surface hover:border-white/10 transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left" aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-white pr-4">{q}</span>
        <ChevronDown size={18} className={`text-muted shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
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
            <p className="px-6 pb-6 text-sm text-muted leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
