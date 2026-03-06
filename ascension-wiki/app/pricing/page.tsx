"use client";

import { motion } from "framer-motion";
import { Check, X, Shield, Zap, Sparkles, Building2 } from "lucide-react";
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
                        { text: "Enterprise Telemetry", included: false },
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
                        { text: "Priority Execution Queue", included: true },
                        { text: "Evolution A/B Testing", included: true },
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
                        { text: "Cryptographic Audit Exports", included: true },
                        { text: "Custom Governance Policies", included: true },
                        { text: "SLA Guarantees", included: true },
                    ]}
                    cta="Contact Sales"
                    href="mailto:enterprise@ascension.ai"
                    highlight={false}
                />
            </div>

            {/* FAQ or Trust Section */}
            <div className="max-w-4xl mx-auto glass rounded-2xl p-8 md:p-12 border border-white/10 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
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
