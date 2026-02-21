# Project Ascension 🚀

> A purely modular, statistically-backed AGI research framework designed for autonomous reasoning, iterative self-improvement, and multi-agent expansion.

Ascension is not just an LLM wrapper. It is a structured environment that separates intention, execution, memory retrieval, and self-evaluation into distinct asynchronous pipelines, creating a continuous quantitative learning loop.

## 🔬 AGI Research Laboratory Interface

The project has been upgraded to a full research environment with advanced visualization and telemetry tools:

- **Benchmarks Dashboard**: Real-time statistical tracking of model performance across versions, including calibration curves and A/B test results.
- **Evolution Timeline**: A vertical, animated history of heuristic promotions, system updates, and architectural milestones.
- **Agent Arena**: A live simulation workbench with a React Flow-powered Reasoning DAG to observe cognitive loops in real time.
- **Experiment Workbench**: Admin control panel for tweaking cognitive temperature, tool permissions, and heuristic rule injection.
- **Cognition Map**: An interactive system diagram illustrating the high-level data flow between core modules.
- **Live Event Stream**: A real-time terminal-style log system powered by Server-Sent Events (SSE).
- **Technical Whitepaper**: MDX documentation with KaTeX math rendering for cognitive algorithms and statistical methodologies.

---

## 🏗️ Architecture Design

Ascension isolates functionality into specialized boundary layers:

### Core Cognition (`/core`)
- **Structural Reasoning Engine**: Uses AST parsing to extract Python metadata (functions, deps, complexity), allowing the AGI to reason over architecture rather than raw text.
- **Token Budget Controller**: Enforces hard token limits per task and implements adaptive context compression (Goal > Task > Short Memory > Long Memory).
- **Iterative Refinement Loop**: Coordinates multi-pass code generation (Analysis -> Draft -> Critique -> Optimize) with measurable quality tracking.
- **Goal Planner**: Deconstructs user input into Directed Acyclic Graphs (DAGs) of executable subtasks.
- **Decision Engine**: Multi-cognitive selection of tools, reflections, or completions based on structural context.

### Memory Systems (`/memory`)
- **Short Term Memory**: Rotating temporal context preventing buffer overflow.
- **Vector Store**: Local FAISS implementation supporting scalable semantic search.
- **Indexer & Optimizer**: Condenses noisy episodes into hard facts. Automatically purges low-signal, high-retrieval memories.

### Tool Boundaries (`/tools`)
- **Base Tool Interface**: Requires all tools to publish precise JSON schemas.
- **Tool Executor**: Acts as a try/catch sandbox generating strings for short term ingestion.
- **Hardened Code Execution Sandbox**: Isolated subprocess execution with strict timeouts, memory limits, restricted imports, and token-light exception summarization.
- **Concrete Tool Suite**:
  - `WebSearchTool` — DuckDuckGo async search
  - `FileSystemTool` — Sandboxed async file read/write/list

### Learning & Evals (`/learning`, `/evals`, `/optimization`)
- **Feedback & Reflection**: Evaluates execution traces to generate new hypothesized heuristics (rules).
- **Benchmark Sandbox**: Runs deterministic tests (`math`, `logic`, `planning`) against static AGI versions.
- **Heuristic Optimizer**: A/B tests proposed rules numerically. Promotes rules to the System Prompt only if they empirically improve benchmark scores without triggering regression.

### Security Layers (`/safety`)
- **Sandbox**: Restricts commands by regex and limits file access to specific directories.
- **Ethical Firewall**: Moderates proposed dangerous actions using a constrained secondary AI check.
- **Versioning**: Snapshot and cleanly rollback FAISS vectors and heuristic rules.

---

## 🌐 Website & Frontend (`/ascension-wiki`)

A production-grade Next.js 16 (App Router) main website built with:

| Feature | Implementation |
|---|---|
| Framework | Next.js 16 + TypeScript |
| Styling | Tailwind CSS 4 + Glassmorphism |
| Animations | Framer Motion + CSS Neural Pulses |
| Visualization | React Flow (DAGs) + Recharts (Analytics) |
| State | Zustand (Global Sync) |
| Streaming | Server-Sent Events (SSE) |
| Auth / Roles | Clerk (admin > researcher > viewer) |
| Math | KaTeX + remark-math + rehype-katex |

### Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Animated landing page with magnetic cursor |
| `/dashboard` | Protected | AGI Command Center dashboard |
| `/benchmarks` | Researcher | Interactive Recharts dashboard |
| `/evolution` | Public | Animated vertical history timeline |
| `/arena` | Researcher | Live Agent Reasoning DAG (React Flow) |
| `/experiments` | Admin | Workbench for cognitive tweaking |
| `/cognition-map` | Public | Interactive system architecture diagram |
| `/logs` | Admin | Real-time terminal SSE log stream |
| `/whitepaper` | Viewer | Technical documentation with math |
| `/docs/[slug]` | Public | MDX documentation wiki |
| `/control` | Admin | Emergency halt & version control |

---

## 🛠️ Getting Started

### AGI Core (Python Backend)

#### Prerequisites
- Python 3.12+
- OpenAI API Key

#### Installation

```bash
git clone https://github.com/TejasSinha12/Astraeus.git
cd Astraeus
pip install -r requirements.txt
```

Create a `.env` file:
```env
OPENAI_API_KEY=your_api_key_here
```

#### Running the CLI
```bash
python main.py
```

---

### Website (Next.js Frontend)

#### Prerequisites
- Node.js 20+
- A free [Clerk](https://clerk.com) account

#### Installation

```bash
cd ascension-wiki
npm install
```

Create `ascension-wiki/.env.local`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🧪 Development & Evaluation

To extend the AGI:
1. Inherit `BaseTool` in `/tools` and implement `execute()`.
2. Register your tool with `ToolRegistry`.
3. Add domain-specific datasets into `/evals/datasets/` to drive the Continuous Learning loop.
4. Use an Agent Profile in `/agents/profiles.py` or create a new one.
