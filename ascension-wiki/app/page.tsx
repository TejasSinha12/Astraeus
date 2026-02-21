"use client";

export const dynamic = "force-dynamic";

import { motion } from "framer-motion";
import { ArrowRight, Terminal } from "lucide-react";
import { StatusPanel } from "@/components/ui/StatusPanel";
import { ArchitectureExplorer } from "@/components/ArchitectureExplorer";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-8 md:px-12 lg:px-20 max-w-7xl mx-auto flex flex-col items-center relative overflow-hidden">
      {/* Background Decorative Pulses */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] neural-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-[80px] neural-pulse pointer-events-none" style={{ animationDelay: "1s" }} />

      {/* Hero Section */}
      <motion.section
        className="w-full flex flex-col items-center text-center mt-10 md:mt-20 mb-24"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-mono uppercase tracking-widest mb-8 box-glow"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          System Operational • v0.1.0-alpha
        </motion.div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6 drop-shadow-[0_0_30px_rgba(0,229,255,0.2)]">
          Engineering <span className="text-primary text-glow">Autonomous</span><br />Intelligence
        </h1>

        <p className="text-lg md:text-xl text-muted max-w-3xl mx-auto mb-10 leading-relaxed">
          A purely modular, statistically-backed AGI research framework designed for autonomous reasoning, iterative self-improvement, and multi-agent expansion.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-lg bg-primary text-background font-bold flex items-center gap-2 transition-all hover:bg-primary/90 box-glow w-full sm:w-auto justify-center"
            >
              Enter Research Portal
              <ArrowRight size={18} />
            </motion.button>
          </Link>
          <Link href="/docs/core">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-lg bg-surface border border-white/10 text-white font-medium flex items-center gap-2 hover:bg-surface-hover transition-all w-full sm:w-auto justify-center"
            >
              <Terminal size={18} />
              Read Architecture
            </motion.button>
          </Link>
        </div>
      </motion.section>

      {/* Telemetry Section */}
      <motion.section
        className="w-full mb-24"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <StatusPanel />
      </motion.section>

      {/* Interactive Explorer Section */}
      <motion.section
        className="w-full mb-20"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <ArchitectureExplorer />
      </motion.section>

    </div>
  );
}
