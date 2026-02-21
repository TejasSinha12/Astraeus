/**
 * Global Zustand state for the AGI Research Lab interface.
 * Three slices: agent simulation, experiments, benchmark filters.
 */
import { create } from "zustand";

// ─── Agent Simulation ───────────────────────────────────────────────────────
interface TraceStep {
    id: string;
    type: "plan" | "decide" | "tool" | "reflect" | "complete" | "fail";
    label: string;
    detail: string;
    confidence: number;
    timestamp: number;
}

interface AgentSimState {
    selectedAgent: "Researcher_01" | "Coder_01" | "Executive_Alpha";
    compareAgent: "Researcher_01" | "Coder_01" | "Executive_Alpha" | null;
    compareMode: boolean;
    isRunning: boolean;
    task: string;
    traceSteps: TraceStep[];
    confidence: number[];
    setAgent: (agent: AgentSimState["selectedAgent"]) => void;
    setCompareAgent: (agent: AgentSimState["compareAgent"]) => void;
    toggleCompareMode: () => void;
    setTask: (task: string) => void;
    startSim: () => void;
    stopSim: () => void;
    pushStep: (step: TraceStep) => void;
    pushConfidence: (val: number) => void;
    reset: () => void;
}

export const useAgentSimStore = create<AgentSimState>((set) => ({
    selectedAgent: "Researcher_01",
    compareAgent: null,
    compareMode: false,
    isRunning: false,
    task: "",
    traceSteps: [],
    confidence: [],
    setAgent: (agent) => set({ selectedAgent: agent }),
    setCompareAgent: (agent) => set({ compareAgent: agent }),
    toggleCompareMode: () => set((s) => ({ compareMode: !s.compareMode })),
    setTask: (task) => set({ task }),
    startSim: () => set({ isRunning: true, traceSteps: [], confidence: [] }),
    stopSim: () => set({ isRunning: false }),
    pushStep: (step) => set((s) => ({ traceSteps: [...s.traceSteps, step] })),
    pushConfidence: (val) => set((s) => ({ confidence: [...s.confidence, val] })),
    reset: () => set({ isRunning: false, traceSteps: [], confidence: [] }),
}));

// ─── Experiment Workbench ────────────────────────────────────────────────────
interface ExperimentState {
    temperature: number;
    enabledTools: Record<string, boolean>;
    heuristicToggles: Record<string, boolean>;
    selectedDataset: "math" | "logic" | "planning" | "tool-use";
    isRunning: boolean;
    progress: number;
    results: { before: number; after: number; category: string }[];
    setTemperature: (t: number) => void;
    toggleTool: (tool: string) => void;
    toggleHeuristic: (rule: string) => void;
    setDataset: (d: ExperimentState["selectedDataset"]) => void;
    runExperiment: () => void;
    setProgress: (p: number) => void;
    setResults: (r: ExperimentState["results"]) => void;
}

export const useExperimentStore = create<ExperimentState>((set) => ({
    temperature: 0.7,
    enabledTools: { web_search: true, file_system: true, python_execution: true },
    heuristicToggles: {
        "Validate tool args before dispatch": true,
        "Increase search depth on low confidence": true,
        "Trigger reflection on FAIL": true,
        "Prefer memory over web search": false,
        "Force TASK_COMPLETE after 10 steps": true,
    },
    selectedDataset: "math",
    isRunning: false,
    progress: 0,
    results: [],
    setTemperature: (temperature) => set({ temperature }),
    toggleTool: (tool) =>
        set((s) => ({ enabledTools: { ...s.enabledTools, [tool]: !s.enabledTools[tool] } })),
    toggleHeuristic: (rule) =>
        set((s) => ({ heuristicToggles: { ...s.heuristicToggles, [rule]: !s.heuristicToggles[rule] } })),
    setDataset: (selectedDataset) => set({ selectedDataset }),
    runExperiment: () => set({ isRunning: true, progress: 0, results: [] }),
    setProgress: (progress) => set({ progress }),
    setResults: (results) => set({ results, isRunning: false, progress: 100 }),
}));

// ─── Benchmark Filters ───────────────────────────────────────────────────────
interface BenchmarkState {
    activeCategory: "all" | "math" | "logic" | "planning" | "tool-use";
    setCategory: (c: BenchmarkState["activeCategory"]) => void;
}

export const useBenchmarkStore = create<BenchmarkState>((set) => ({
    activeCategory: "all",
    setCategory: (activeCategory) => set({ activeCategory }),
}));
