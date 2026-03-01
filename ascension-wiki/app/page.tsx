"use client";

export const dynamic = "force-dynamic";

import { motion } from "framer-motion";
import { ArrowRight, Terminal, Zap, Shield, BarChart3, Lock, Cpu, Database } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-8 md:px-12 lg:px-20 max-w-7xl mx-auto flex flex-col items-center relative overflow-hidden font-inter">
      {/* Hero Section */}
      <motion.section
        className="w-full flex flex-col items-center text-center mt-10 md:mt-20 mb-24"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-muted text-[10px] font-mono uppercase tracking-widest mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Production API • v5.0.0
        </motion.div>

        <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight text-white mb-6">
          Swarm-as-a-<span className="text-primary">Service</span>
        </h1>

        <p className="text-base md:text-lg text-muted max-w-2xl mx-auto mb-10 leading-relaxed font-fira-code">
          Deploy production-grade multi-agent reasoning. Reliable swarm execution with deterministic logs, structured telemetry, and enterprise-grade observability.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/sign-up">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-lg bg-primary text-background font-bold flex items-center gap-2 transition-all hover:bg-primary/90 box-glow"
            >
              Get API Key
              <ArrowRight size={18} />
            </motion.button>
          </Link>
          <Link href="/docs/core">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-lg bg-surface border border-white/5 text-white font-medium flex items-center gap-2 hover:bg-surface-hover transition-all"
            >
              <Terminal size={18} />
              View Docs
            </motion.button>
          </Link>
        </div>
      </motion.section>

      {/* Pillars Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-32">
        <PillarCard
          icon={<Cpu className="text-primary" />}
          title="Swarm Execution API"
          description="High-performance multi-agent reasoning endpoints. Move beyond direct LLM calls with deterministic, validated agent orchestration."
          features={["Reasoning Swarm Clusters", "Atomic Execution Flow", "Fitness-Gated Promotion"]}
        />
        <PillarCard
          icon={<Zap className="text-primary" />}
          title="Developer Infrastructure"
          description="Build it right from day one. Managed API keys, real-time usage telemetry, automated Stripe billing, and mission persistence."
          features={["Scoped Key Management", "Cost-Aware Metering", "Stripe Billing Bridge"]}
        />
        <PillarCard
          icon={<Shield className="text-primary" />}
          title="Enterprise Governance"
          description="Auditability by default. Immutable ledgers, cryptographically signed logs, RBAC, and OTel-compatible telemetry exports."
          features={["Signed Billing Ledger", "RBAC / Multi-tenancy", "Security Audit Logs"]}
        />
      </section>

      {/* Technical Detail / CTA Section */}
      <motion.section
        className="w-full py-16 px-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold text-white mb-4">Scalable Auditability</h2>
          <p className="text-muted mb-8 leading-relaxed">
            Ascension instrumented the entire request lifecycle with OpenTelemetry. Signal to your enterprise partners that every token used and every decision made is traceable and auditable.
          </p>
          <Link href="/whitepaper">
            <button className="text-primary font-mono text-xs flex items-center gap-2 hover:underline">
              REQUEST ENTERPRISE ACCESS <ArrowRight size={14} />
            </button>
          </Link>
        </div>
        <div className="w-full md:w-auto p-6 bg-black/40 rounded-xl border border-white/5 font-mono text-[11px] text-primary/70">
          <pre>
            {`$ curl -H "x-api-key: \${KEY}" \\
   -X POST /v1/execute/swarm \\
   -d '{"objective": "refactor_auth"}'

> STATUS: EXECUTING [DEPTH: 5]
> TRACE_ID: b4f1a...
> LEDGER: SIGNED_AND_COMMITTED`}
          </pre>
        </div>
      </motion.section>
    </div>
  );
}

function PillarCard({ icon, title, description, features }: any) {
  return (
    <motion.div
      className="p-8 rounded-2xl bg-surface border border-white/5 hover:border-primary/20 transition-all flex flex-col gap-6"
      whileHover={{ y: -5 }}
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-sm text-muted leading-relaxed mb-6">{description}</p>
        <ul className="flex flex-col gap-2">
          {features.map((f: string) => (
            <li key={f} className="text-[11px] font-mono text-muted/60 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary/40" />
              {f.toUpperCase()}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
