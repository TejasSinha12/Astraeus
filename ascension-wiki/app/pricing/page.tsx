"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Shield, Zap, Sparkles, Building2, ChevronDown, Flame } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 md:px-12 lg:px-20 max-w-7xl mx-auto font-inter">

            {/* Dynamic Background Glow */}
            <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-secondary/10 blur-[120px] rounded-full pointer-events-none -z-10" />

            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                    Pricing for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Intelligence</span>
                </h1>
                <p className="text-lg text-muted">
                    Swarm execution costs scale based on reasoning depth and objective complexity. Choose the tier that fits your engineering needs.
                </p>
            </div>

            {/* Pricing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">

                {/* Free Tier */}
                <PricingCard
                    tier="Free"
                    price="$0"
                    subtitle="Perfect for exploring the API"
                    icon={<Zap size={24} className="text-muted" />}
                    features={[
                        { text: "5,000 Starting Credits", included: true },
                        { text: "Standard Reasoning Depth", included: true },
                        { text: "Community Support", included: true },
                        { text: "Up to 3 concurrent agents", included: true },
                        { text: "The Forge (Multi-Branch)", included: false },
                        { text: "Team Billing", included: false },
                    ]}
                    cta="Start Exploring"
                    href="/sign-up"
                    highlight={false}
                />

                {/* Researcher Tier */}
                <PricingCard
                    tier="Researcher"
                    price="Pay-As-You-Go"
                    subtitle="$5.00 min top-up"
                    icon={<Sparkles size={24} className="text-primary" />}
                    features={[
                        { text: "Purchase Top-Up Credits", included: true },
                        { text: "Up to 10 concurrent agents", included: true },
                        { text: "Deep Reasoning Modes", included: true },
                        { text: "The Forge (Multi-Branch)", included: true },
                        { text: "Chronos Replay Engine", included: true },
                        { text: "Team Billing", included: false },
                    ]}
                    cta="Create Account"
                    href="/sign-up"
                    highlight={true}
                />

                {/* Institutional Tier */}
                <PricingCard
                    tier="Institutional"
                    price="Custom"
                    subtitle="For research labs & enterprises"
                    icon={<Building2 size={24} className="text-secondary" />}
                    features={[
                        { text: "Shared Organization Pouches", included: true },
                        { text: "Unlimited concurrent agents", included: true },
                        { text: "Dedicated Swarm Clusters", included: true },
                        { text: "The Forge + Chronos Engine", included: true },
                        { text: "Custom Governance Policies", included: true },
                        { text: "SLA Guarantees", included: true },
                    ]}
                    cta="Contact Sales"
                    href="mailto:enterprise@ascension.ai"
                    highlight={false}
                />
            </div>

            {/* Token Calculator */}
            <TokenCalculator />

            {/* Trust Section */}
            <div className="max-w-4xl mx-auto glass rounded-2xl p-8 md:p-12 border border-white/10 flex flex-col md:flex-row items-center gap-8 shadow-2xl mb-20">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex flex-shrink-0 items-center justify-center">
                    <Shield className="text-primary w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Cryptographically Signed Billing</h3>
                    <p className="text-muted leading-relaxed">
                        Every token deduction is chained on our PostgreSQL HMAC-SHA256 ledger. We guarantee absolute financial transparency for institutional and individual usage. Execution failures are automatically refunded by the consensus engine.
                    </p>
                </div>
            </div>

            {/* FAQ Section */}
            <section className="max-w-3xl mx-auto mb-16">
                <h2 className="text-2xl font-bold text-white text-center mb-10">Billing <span className="text-primary">FAQ</span></h2>
                <div className="space-y-4">
                    <FAQItem q="What happens if a mission fails?" a="If the swarm encounters a critical error or the reasoning confidence drops below the threshold, the execution is halted and your credits are automatically refunded via the signed ledger." />
                    <FAQItem q="How are tokens priced?" a="Token costs are dynamically calculated based on objective complexity, active cluster load, and reasoning depth. Simple tasks cost ~50-100 tokens, complex multi-file generations cost ~200-500 tokens." />
                    <FAQItem q="Can I set a spending limit?" a="Yes. In the Developer Settings, you can configure monthly quotas on your API keys. The platform will automatically reject requests that exceed your configured limits." />
                    <FAQItem q="Do Forge sessions cost more?" a="Forge sessions run 3 parallel swarms, so they cost approximately 3x a standard execution. However, the architectural diversity and benchmark data often save engineering hours." />
                    <FAQItem q="How does team billing work?" a="Institutional accounts use shared Organization Credit Pouches. All team members draw from the same balance, with admin-level visibility into per-user consumption." />
                </div>
            </section>

        </div>
    );
}

function PricingCard({ tier, price, subtitle, icon, features, cta, href, highlight }: any) {
    return (
        <motion.div
            className={`relative p-8 rounded-3xl flex flex-col h-full bg-surface border ${highlight ? "border-primary/50 box-glow" : "border-white/10"
                }`}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
            {highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-background text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                    Most Popular
                </div>
            )}

            <div className="flex items-center gap-3 mb-4">
                {icon}
                <h3 className={`text-xl font-bold ${highlight ? "text-primary" : "text-white"}`}>{tier}</h3>
            </div>

            <div className="mb-2">
                <span className="text-4xl font-extrabold text-white">{price}</span>
            </div>
            <p className="text-sm text-muted mb-8 pb-8 border-b border-white/10">{subtitle}</p>

            <ul className="flex flex-col gap-4 mb-10 flex-grow">
                {features.map((f: any, i: number) => (
                    <li key={i} className={`flex items-start gap-3 text-sm ${f.included ? "text-text-main" : "text-muted/50"}`}>
                        {f.included ? (
                            <Check size={18} className="text-green-400 mt-0.5" />
                        ) : (
                            <X size={18} className="text-red-400/50 mt-0.5" />
                        )}
                        <span>{f.text}</span>
                    </li>
                ))}
            </ul>

            <Link href={href} className="w-full mt-auto">
                <button
                    className={`w-full py-3.5 rounded-xl font-bold transition-all ${highlight
                            ? "bg-primary text-background hover:bg-primary/90 shadow-[0_0_20px_rgba(0,229,255,0.2)]"
                            : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                        }`}
                >
                    {cta}
                </button>
            </Link>
        </motion.div>
    );
}

function TokenCalculator() {
    const [amount, setAmount] = useState(5);
    const tokens = amount * 10000;

    const estimates = [
        { label: "Simple Tasks", count: Math.floor(tokens / 80), desc: "API endpoints, utilities" },
        { label: "Standard Missions", count: Math.floor(tokens / 200), desc: "Full components, modules" },
        { label: "Complex Projects", count: Math.floor(tokens / 450), desc: "Multi-file architectures" },
        { label: "Forge Sessions", count: Math.floor(tokens / 600), desc: "3-branch parallel duels" },
    ];

    return (
        <section className="max-w-4xl mx-auto mb-20">
            <div className="glass rounded-2xl p-8 md:p-12 border border-white/10">
                <div className="flex items-center gap-3 mb-8">
                    <Flame size={20} className="text-orange-400" />
                    <h3 className="text-xl font-bold text-white">Token Calculator</h3>
                </div>

                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-mono text-muted uppercase tracking-widest">Top-Up Amount</label>
                        <span className="text-2xl font-bold text-primary">${amount}</span>
                    </div>
                    <input
                        type="range"
                        min={5}
                        max={100}
                        step={5}
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-[9px] text-muted/60 font-mono mt-2">
                        <span>$5</span>
                        <span>{tokens.toLocaleString()} tokens</span>
                        <span>$100</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {estimates.map(e => (
                        <div key={e.label} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                            <div className="text-2xl font-bold text-white mb-1">~{e.count}</div>
                            <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{e.label}</div>
                            <div className="text-[9px] text-muted/70">{e.desc}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FAQItem({ q, a }: { q: string; a: string }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-white/5 rounded-2xl overflow-hidden bg-surface hover:border-white/10 transition-all">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left"
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
