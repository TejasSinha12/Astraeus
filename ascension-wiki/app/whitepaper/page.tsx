"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const TOC = [
    { id: "cognitive-loop", label: "1. Cognitive Loop Architecture" },
    { id: "heuristic-algo", label: "2. Heuristic Promotion Algorithm" },
    { id: "confidence", label: "3. Confidence Calibration" },
    { id: "memory", label: "4. Memory Compression" },
    { id: "benchmarks", label: "5. Benchmark Methodology" },
    { id: "swarm", label: "6. Swarm Orchestration" },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
    return (
        <section id={id} className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-3">{title}</h2>
            <div className="space-y-4 text-muted leading-relaxed">{children}</div>
        </section>
    );
}

function Math({ children }: { children: React.ReactNode }) {
    return (
        <div className="my-4 p-4 rounded-xl bg-white/5 border border-white/10 font-mono text-sm text-primary overflow-x-auto">
            {children}
        </div>
    );
}

function Code({ children }: { children: React.ReactNode }) {
    return <code className="px-1.5 py-0.5 rounded bg-white/10 text-primary font-mono text-sm">{children}</code>;
}

function Alert({ children }: { children: React.ReactNode }) {
    return <div className="p-4 rounded-xl border-l-4 border-primary bg-primary/5 text-sm text-muted italic">{children}</div>;
}

export default function WhitepaperPage() {
    const [activeSection, setActiveSection] = useState("cognitive-loop");

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 flex gap-12">
            {/* Sticky TOC */}
            <aside className="hidden lg:block w-56 shrink-0">
                <div className="sticky top-24">
                    <p className="text-xs font-mono text-muted uppercase tracking-widest mb-4">Contents</p>
                    <nav className="space-y-1">
                        {TOC.map((item) => (
                            <a key={item.id} href={`#${item.id}`} onClick={() => setActiveSection(item.id)}
                                className={`flex items-center gap-2 text-xs font-mono py-1.5 px-2 rounded-lg transition-all ${activeSection === item.id ? "text-primary bg-primary/10" : "text-muted hover:text-white"}`}>
                                <ChevronRight size={10} className={activeSection === item.id ? "text-primary" : "text-muted"} />
                                {item.label}
                            </a>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Content */}
            <main className="flex-1 max-w-3xl">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                    <div className="text-xs font-mono text-primary uppercase tracking-widest mb-2">Technical Documentation</div>
                    <h1 className="text-4xl font-bold text-white mb-2">Project Ascension Whitepaper</h1>
                    <p className="text-muted">v0.1.0-alpha · February 2026</p>
                </motion.div>

                <Section id="cognitive-loop" title="1. Cognitive Loop Architecture">
                    <p>The Ascension cognitive architecture separates the process of goal execution into five distinct asynchronous phases: <Code>Decomposition</Code>, <Code>Reasoning</Code>, <Code>Decision</Code>, <Code>Execution</Code>, and <Code>Reflection</Code>. This separation enables independent optimization of each component without architectural coupling.</p>
                    <p>Each task in the execution graph is processed by the <Code>CognitionCore</Code>, which orchestrates the following sequence:</p>
                    <Math>
                        {`Goal → GoalPlanner(DAG) → [TaskDefinition₁, ..., Taskₙ] → ∀ task: _execute_task(task)`}
                    </Math>
                    <p>Within <Code>_execute_task</Code>, a bounded loop executes up to <Code>MAX_PLANNING_STEPS</Code> (default: 10) decision iterations. Each iteration queries the <Code>DecisionEngine</Code> to determine the optimal next action:</p>
                    <Math>
                        {`action ∈ { USE_TOOL(tool_name, args), TASK_COMPLETE(summary), FAIL(reason) }`}
                    </Math>
                    <Alert>The cognitive loop is intentionally stateless between tasks, relying exclusively on the accumulated working memory string to avoid cross-task contamination.</Alert>
                    <p>Working memory accumulates tool results via string concatenation, forming a compressed episodic record that the DecisionEngine uses for context-aware action selection in subsequent steps.</p>
                </Section>

                <Section id="heuristic-algo" title="2. Heuristic Promotion Algorithm">
                    <p>Heuristic rules are candidate modifications to the system prompt that empirically improve benchmark performance. A rule is generated by the Reflection module after analyzing task execution traces, and must survive a multi-round A/B validation before promotion.</p>
                    <p>A candidate rule <em>r</em> is tested against a held-out benchmark set <em>B</em> with current baseline rules <em>R₀</em>:</p>
                    <Math>
                        {`Δacc(r) = acc(R₀ ∪ {r}, B) - acc(R₀, B)`}
                    </Math>
                    <p>Promotion requires statistical significance using Welch's t-test across 3 independent evaluation rounds:</p>
                    <Math>
                        {`t = (μ₁ - μ₂) / √(s₁²/n₁ + s₂²/n₂) , p < 0.05`}
                    </Math>
                    <p>Additionally, the rule must not cause regression in any category by more than 2% (the <em>safe regression bound</em>):</p>
                    <Math>
                        {`∀ c ∈ Categories: acc(R₀ ∪ {r}, B_c) ≥ acc(R₀, B_c) - δ_safe , where δ_safe = 0.02`}
                    </Math>
                    <Alert>Rules that pass A/B testing are appended to the system prompt with a weight that decays over time using exponential moving average, preventing prompt bloat.</Alert>
                </Section>

                <Section id="confidence" title="3. Confidence Calibration">
                    <p>A well-calibrated model produces confidence scores <em>p</em> that match the empirical accuracy of its predictions. The calibration quality is measured using Expected Calibration Error (ECE):</p>
                    <Math>
                        {`ECE = Σ (|Bₘ| / n) · |acc(Bₘ) - conf(Bₘ)|`}
                    </Math>
                    <p>where <em>Bₘ</em> are confidence bins and <em>n</em> is total samples. The Ascension framework achieved ECE reduction from <strong className="text-white">0.18</strong> to <strong className="text-white">0.09</strong> after applying Platt scaling calibration:</p>
                    <Math>
                        {`p_calibrated = σ(A · f(x) + B) , where σ is sigmoid`}
                    </Math>
                    <p>Parameters A and B are fit via maximum likelihood estimation on a calibration validation set of 200 held-out task evaluations.</p>
                    <p>The Meta-Cognitive Calibration module compares the declared confidence of each DecisionEngine action against the empirical success rate of that action type across historical executions, adjusting the scaling factor dynamically.</p>
                </Section>

                <Section id="memory" title="4. Memory Compression Strategy">
                    <p>Raw execution traces accumulate at approximately 400 tokens per task step. Without compression, episodic memory would exceed context limits within 5-8 task executions. The Memory Optimizer applies a composite quality scoring function:</p>
                    <Math>
                        {`Q(e) = α·relevance(e) + β·recency(e) + γ·uniqueness(e) - δ·cost(e)`}
                    </Math>
                    <p>Where default weights are <Code>α=0.4, β=0.3, γ=0.2, δ=0.1</Code>. Entries with <Code>Q(e) &lt; 0.3</Code> are pruned. Survivors are compressed via extractive summarization using a secondary LLM call with strict token budget enforcement.</p>
                    <p>The FAISS vector index uses L2 distance for nearest-neighbor retrieval. On memory insertion, the new embedding is compared to existing embeddings using cosine similarity; if a duplicate with similarity &gt; 0.92 exists, the new entry replaces the older one to prevent semantic redundancy.</p>
                </Section>

                <Section id="benchmarks" title="5. Statistical Benchmark Methodology">
                    <p>Each benchmark category (math, logic, planning, tool-use) contains 40 deterministic test prompts with known correct outputs. Evaluation uses an exact-match or structured-match grading function depending on the output type.</p>
                    <p>Version comparison uses paired two-sample t-tests to determine if accuracy differences between versions are statistically significant at p &lt; 0.05:</p>
                    <Math>
                        {`H₀: μ(vₙ) = μ(vₙ₋₁)`}
                    </Math>
                    <p>Regression is flagged when a new version shows a statistically significant drop in any single category. Regressions block automatic heuristic promotion until the root cause is diagnosed and a fix is merged.</p>
                    <Alert>All benchmark evaluations are run deterministically with temperature=0 and seed=42 to ensure reproducibility across hardware configurations.</Alert>
                </Section>

                <Section id="swarm" title="6. Swarm Orchestration Design">
                    <p>The multi-agent coordinator implements a simple priority queue for task assignment. Each <Code>AutonomousAgent</Code> runs an independent <Code>CognitionCore</Code> instance on a separate asyncio task. The coordinator pattern is:</p>
                    <Math>
                        {`Route(task) → min_load_agent(capability_match(task, agents))`}
                    </Math>
                    <p>Agent specialization via profiles prevents context pollution: the <Code>Researcher_01</Code> profile has access only to <Code>web_search</Code>, preventing it from accidentally running dangerous code. The <Code>Executive_Alpha</Code> has no tool access at all — its sole capability is inter-agent task delegation.</p>
                    <p>The REST API exposes <Code>/swarm/halt</Code> which broadcasts a <Code>SIGKILL</Code> signal to all active asyncio tasks within 500ms. Emergency halt bypasses all in-flight tasks and resets the coordinator state machine to <em>IDLE</em>.</p>
                    <p>Future work includes implementing a distributed coordinator using Redis pub/sub for multi-process agent deployment across separate machines, enabling horizontal scaling of the swarm.</p>
                </Section>
            </main>
        </div>
    );
}
