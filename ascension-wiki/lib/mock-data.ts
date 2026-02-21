/**
 * Mock data generators for the AGI Research Lab interface.
 */

// ─── Benchmark Data ──────────────────────────────────────────────────────────
export const VERSIONS = ["v0.0.8-pre", "v0.0.9-pre", "v0.1.0-alpha"];

export const CATEGORIES = ["math", "logic", "planning", "tool-use"] as const;
export type Category = (typeof CATEGORIES)[number];

export function generateAccuracyOverTime() {
    return VERSIONS.flatMap((version) =>
        Array.from({ length: 8 }, (_, i) => ({
            step: i + 1,
            version,
            math: parseFloat((0.6 + Math.random() * 0.35 + i * 0.01).toFixed(3)),
            logic: parseFloat((0.55 + Math.random() * 0.4 + i * 0.01).toFixed(3)),
            planning: parseFloat((0.5 + Math.random() * 0.45 + i * 0.01).toFixed(3)),
            "tool-use": parseFloat((0.65 + Math.random() * 0.3 + i * 0.01).toFixed(3)),
        }))
    );
}

export function generateVersionComparison() {
    return VERSIONS.map((version) => ({
        version,
        math: parseFloat((0.65 + Math.random() * 0.3).toFixed(3)),
        logic: parseFloat((0.6 + Math.random() * 0.35).toFixed(3)),
        planning: parseFloat((0.55 + Math.random() * 0.4).toFixed(3)),
        "tool-use": parseFloat((0.7 + Math.random() * 0.25).toFixed(3)),
        overall: parseFloat((0.62 + Math.random() * 0.33).toFixed(3)),
    }));
}

export function generateCalibrationCurve() {
    return Array.from({ length: 10 }, (_, i) => {
        const predicted = parseFloat(((i + 1) * 0.1).toFixed(1));
        const actual = parseFloat((predicted + (Math.random() - 0.5) * 0.12).toFixed(3));
        return { predicted, actual, ideal: predicted };
    });
}

export function generateHeuristicPromotion() {
    return Array.from({ length: 12 }, (_, i) => ({
        week: `W${i + 1}`,
        promoted: Math.floor(Math.random() * 3),
        demoted: Math.floor(Math.random() * 2),
        tested: Math.floor(Math.random() * 8) + 2,
    }));
}

export const REGRESSION_LOGS = [
    { id: "R001", version: "v0.0.9-pre", category: "math", delta: -0.038, date: "2026-02-14", severity: "warning" },
    { id: "R002", version: "v0.0.9-pre", category: "tool-use", delta: -0.011, date: "2026-02-15", severity: "info" },
    { id: "R003", version: "v0.1.0-alpha", category: "planning", delta: -0.052, date: "2026-02-20", severity: "error" },
    { id: "R004", version: "v0.1.0-alpha", category: "logic", delta: -0.007, date: "2026-02-21", severity: "info" },
];

export const AB_TEST_DATA = [
    { experiment: "Heuristic A vs B (Memory)", math: 0.88, logic: 0.79, planning: 0.71, "tool-use": 0.84, winner: "A" },
    { experiment: "Temp 0.5 vs 0.7", math: 0.91, logic: 0.83, planning: 0.76, "tool-use": 0.82, winner: "B" },
    { experiment: "Search Depth 3 vs 5", math: 0.87, logic: 0.85, planning: 0.80, "tool-use": 0.79, winner: "B" },
    { experiment: "Reflection Loop ON/OFF", math: 0.89, logic: 0.81, planning: 0.73, "tool-use": 0.88, winner: "A" },
];

// ─── Evolution Timeline ──────────────────────────────────────────────────────
export type TimelineType = "release" | "heuristic" | "memory" | "calibration" | "swarm";

export interface TimelineEvent {
    id: string;
    date: string;
    type: TimelineType;
    title: string;
    summary: string;
    detail: string;
}

export const TIMELINE_EVENTS: TimelineEvent[] = [
    {
        id: "T001", date: "2026-01-15", type: "release", title: "v0.0.8-pre Initial Prototype",
        summary: "First functional cognitive loop with basic tool execution.",
        detail: "Completed core cognition stack: ReasoningEngine, GoalPlanner, DecisionEngine. Basic tool routing implemented without executor sandbox.",
    },
    {
        id: "T002", date: "2026-01-22", type: "memory", title: "Short-Term Memory v1",
        summary: "Rotating context buffer added to prevent overflow.",
        detail: "Implemented ShortTermMemory with configurable window size. Prevents hallucinations caused by unbounded token accumulation in long tasks.",
    },
    {
        id: "T003", date: "2026-01-29", type: "heuristic", title: "First Heuristic Batch Promoted",
        summary: "3 empirically validated rules promoted to system prompt.",
        detail: "Rules: arg validation before dispatch (+4.2% accuracy), reflection on failure triggers (+3.1%), memory-first before web search (+1.8%). Validated on 40-task benchmark sweep.",
    },
    {
        id: "T004", date: "2026-02-04", type: "calibration", title: "Confidence Calibration System",
        summary: "Meta-cognitive calibration layer reduces overconfidence.",
        detail: "Implemented Bayesian confidence calibration using Platt scaling. Reduced ECE (Expected Calibration Error) from 0.18 to 0.09.",
    },
    {
        id: "T005", date: "2026-02-10", type: "release", title: "v0.0.9-pre Swarm Alpha",
        summary: "Multi-agent coordinator and REST interface shipped.",
        detail: "Added MultiAgentCoordinator with async task routing. FastAPI REST interface exposes /swarm/task, /swarm/status, /swarm/halt endpoints.",
    },
    {
        id: "T006", date: "2026-02-14", type: "memory", title: "FAISS Vector Store Integration",
        summary: "Semantic memory retrieval now available to all agents.",
        detail: "Integrated FAISS L2 index for episodic memory retrieval. Memory Optimizer prunes low-signal entries using composite quality score.",
    },
    {
        id: "T007", date: "2026-02-17", type: "heuristic", title: "A/B Optimizer Goes Live",
        summary: "Heuristic promotion now requires empirical benchmark uplift.",
        detail: "New rules must pass 3-round A/B test on held-out benchmark set before system prompt promotion. Reduces false promotions by ~60%.",
    },
    {
        id: "T008", date: "2026-02-19", type: "swarm", title: "Agent Profile Architecture",
        summary: "Specialized Researcher, Coder, Executive profiles launched.",
        detail: "Each profile receives constrained tool registry and role-optimized system prompt. Executive profile orchestrates sub-agent task delegation.",
    },
    {
        id: "T009", date: "2026-02-21", type: "release", title: "v0.1.0-alpha — Current",
        summary: "Production tool suite, web interface, and Clerk auth shipped.",
        detail: "Concrete tool suite (WebSearch, FileSystem, CodeExecution). Next.js main website with Clerk authentication, RBAC, dashboard, and control panel.",
    },
];

// ─── Log Entry Generator ─────────────────────────────────────────────────────
export type LogSeverity = "DEBUG" | "INFO" | "WARN" | "ERROR" | "CRITICAL";
const MODULES = ["cognition", "planner", "decision", "tool_exec", "memory", "swarm", "safety", "optimizer"];
const MESSAGES: Record<LogSeverity, string[]> = {
    DEBUG: ["Checking registry for tool...", "Cache miss on memory query.", "Step counter incremented.", "Serializing decision payload."],
    INFO: ["Task dispatched to Researcher_01.", "Tool `web_search` executed successfully.", "Heuristic weight updated: 0.82 → 0.85.", "Memory consolidation triggered."],
    WARN: ["Confidence below threshold (0.62). Triggering search depth increase.", "Token budget at 87%. Compressing context.", "Heuristic promoted without full A/B cycle."],
    ERROR: ["Tool `python_execution` subprocess timeout after 10s.", "FAISS index read failure — rebuilding from disk.", "Decision engine returned unknown action: UNKNOWN_ACT."],
    CRITICAL: ["SAFETY LAYER VIOLATION: Blocked command `rm -rf /`.", "Swarm halt triggered by admin override.", "Confidence calibration diverged — auto-rollback initiated."],
};

let logCounter = 0;
export function generateMockLog(): { id: number; timestamp: string; severity: LogSeverity; module: string; message: string } {
    const severities: LogSeverity[] = ["DEBUG", "DEBUG", "INFO", "INFO", "INFO", "WARN", "ERROR", "CRITICAL"];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const module = MODULES[Math.floor(Math.random() * MODULES.length)];
    const messages = MESSAGES[severity];
    const message = messages[Math.floor(Math.random() * messages.length)];
    return {
        id: ++logCounter,
        timestamp: new Date().toISOString(),
        severity,
        module,
        message,
    };
}

// ─── Agent Sim Trace Steps ───────────────────────────────────────────────────
export const SIM_TRACE_SEQUENCES = {
    Researcher_01: [
        { type: "plan" as const, label: "Goal Decomposition", detail: "Breaking query into 3 researchable sub-questions.", confidence: 0.91 },
        { type: "decide" as const, label: "Selecting Strategy", detail: "Decision: USE_TOOL → web_search (confidence: 0.89)", confidence: 0.89 },
        { type: "tool" as const, label: "web_search", detail: 'Querying DuckDuckGo: "latest AGI benchmark results 2026"', confidence: 0.87 },
        { type: "reflect" as const, label: "Result Synthesis", detail: "Processing 5 results. Relevance score: 0.84.", confidence: 0.84 },
        { type: "complete" as const, label: "TASK_COMPLETE", detail: "Compiled structured research summary with citations.", confidence: 0.92 },
    ],
    Coder_01: [
        { type: "plan" as const, label: "Task Analysis", detail: "Identifying code generation subtasks: write → save → execute.", confidence: 0.88 },
        { type: "decide" as const, label: "Tool Selection", detail: "Decision: USE_TOOL → python_execution", confidence: 0.86 },
        { type: "tool" as const, label: "file_system", detail: "Writing code to sandbox/solution.py", confidence: 0.9 },
        { type: "tool" as const, label: "python_execution", detail: "Running sandbox/solution.py. Timeout: 10s.", confidence: 0.88 },
        { type: "reflect" as const, label: "Output Verification", detail: "STDOUT validated. No STDERR. Tests pass.", confidence: 0.95 },
        { type: "complete" as const, label: "TASK_COMPLETE", detail: "Code executed successfully. Output returned.", confidence: 0.95 },
    ],
    Executive_Alpha: [
        { type: "plan" as const, label: "Strategic Decomposition", detail: "Splitting task into Research + Implementation + Validation phases.", confidence: 0.93 },
        { type: "decide" as const, label: "Delegation Decision", detail: "Assigning Phase 1 to Researcher_01, Phase 2 to Coder_01.", confidence: 0.9 },
        { type: "reflect" as const, label: "Progress Monitoring", detail: "Researcher_01 completed. Coder_01 in progress (72%).", confidence: 0.88 },
        { type: "reflect" as const, label: "Result Integration", detail: "Merging outputs from 2 sub-agents. Coherence check: PASS.", confidence: 0.91 },
        { type: "complete" as const, label: "TASK_COMPLETE", detail: "All phases complete. Full result compiled and validated.", confidence: 0.94 },
    ],
};
