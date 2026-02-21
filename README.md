# Project Ascension 🚀

> A purely modular, statistically-backed AGI research framework designed for autonomous reasoning, iterative self-improvement, and multi-agent expansion.

Ascension is not just an LLM wrapper. It is a structured environment that separates intention, execution, memory retrieval, and self-evaluation into distinct asynchronous pipelines, creating a continuous quantitative learning loop.

## 📚 Live Website & Wiki

**🌐 Main Website:** [https://astraeus-livid.vercel.app](https://astraeus-livid.vercel.app)

Features available on the live site:
- Animated landing page with neural background
- Clerk-authenticated Register / Login
- Protected AGI Command Center Dashboard
- Admin-only System Control Panel
- Full MDX documentation wiki

---

## 🏗️ Architecture Design

Ascension isolates functionality into specialized boundary layers:

### Core Cognition (`/core`)
- **Reasoning Engine**: Isolates LLM generation and parsing into strict schemas (powered by Pydantic).
- **Goal Planner**: Deconstructs user input into Directed Acyclic Graphs (DAGs) of executable subtasks.
- **Decision Engine**: Chooses the immediate tactical action (Tool Use, Summary, or Failure) based on context and dynamic Multi-Cognitive confidence scores.

### Memory Systems (`/memory`)
- **Short Term Memory**: Rotating temporal context preventing buffer overflow.
- **Vector Store**: Local FAISS implementation supporting scalable semantic search.
- **Indexer & Optimizer**: Condenses noisy episodes into hard facts. Automatically purges low-signal, high-retrieval memories.

### Tool Boundaries (`/tools`)
- **Base Tool Interface**: Requires all tools to publish precise JSON schemas.
- **Tool Executor**: Acts as a try/catch sandbox generating strings for short term ingestion regardless of tool success or failure.
- **Concrete Tool Suite**: Production-ready tools:
  - `WebSearchTool` — DuckDuckGo async search
  - `FileSystemTool` — Sandboxed async file read/write/list
  - `CodeExecutionTool` — Isolated Python subprocess sandbox

### Learning & Evals (`/learning`, `/evals`, `/optimization`)
- **Feedback & Reflection**: Evaluates execution traces to generate new hypothesized heuristics (rules).
- **Benchmark Sandbox**: Runs deterministic tests (`math`, `logic`, `planning`) against static AGI versions.
- **Heuristic Optimizer**: A/B tests proposed rules numerically. Promotes rules to the System Prompt only if they empirically improve benchmark scores without triggering regression.
- **Telemetry DB**: (`/metrics`) SQLite logs tracking rule weights, component hit-rates, and confidence calibration.

### Security Layers (`/safety`)
- **Sandbox**: Restricts commands by regex and limits file access to specific directories.
- **Ethical Firewall**: Moderates proposed dangerous actions using a constrained secondary AI check.
- **Versioning**: (`/versions`) Ability to snapshot and cleanly rollback FAISS vectors and heuristic rules.

### Swarm Management (`/agents`, `/api`)
- **Agent Profiles**: Specialized swarm topologies:
  - `Researcher_01` — WebSearch only, summarization focus
  - `Coder_01` — FileSystem + Python execution
  - `Executive_Alpha` — Orchestrator, no direct tool access
- **Multi-Agent Coordinator**: Routes tasks to available asynchronous `AutonomousAgent` instances.
- **REST Interface**: Built on FastAPI to query swarm state, assign tasks, and trigger emergency global halts.

---

## 🌐 Website & Frontend (`/ascension-wiki`)

A production-grade Next.js 14 main website built with:

| Feature | Implementation |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + Glassmorphism |
| Animations | Framer Motion (hero, cards, modals) |
| Authentication | Clerk (Register, Login, UserButton) |
| Role System | `admin` > `researcher` > `viewer` via Clerk Public Metadata |
| Documentation | MDX with syntax highlighting |
| Deployment | Vercel (auto-deploy on push) |

### Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Animated landing page |
| `/docs/[slug]` | Public | MDX documentation wiki |
| `/sign-in` | Public | Themed Clerk sign-in |
| `/sign-up` | Public | Themed Clerk sign-up |
| `/dashboard` | Authenticated | AGI Command Center — metrics, agents, heuristics |
| `/control` | Admin only | Emergency halt, version rollback, optimizer toggle |

### Role Assignment

Roles are set via **Clerk Dashboard → Users → [user] → Public Metadata**:
```json
{ "role": "admin" }     // Full control panel access
{ "role": "researcher" } // Benchmark & heuristic view
{ "role": "viewer" }    // Read-only docs (default)
```

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

#### Running the API Gateway
```bash
uvicorn api.rest_interface:app --reload
```
Access the REST swagger docs at `http://localhost:8000/docs`.

#### Running the CLI
```bash
python main.py
```

---

### Website (Next.js Frontend)

#### Prerequisites
- Node.js 18+
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

#### Deploying to Vercel
1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com) — set Root Directory to `ascension-wiki`
3. Add the two Clerk env vars in **Settings → Environment Variables**
4. Deploy ✅

---

## 🧪 Development & Evaluation

To extend the AGI:
1. Inherit `BaseTool` in `/tools` and implement `execute()`.
2. Register your tool with `ToolRegistry`.
3. Add domain-specific datasets into `/evals/datasets/` to drive the Continuous Learning loop.
4. Use an Agent Profile in `/agents/profiles.py` or create a new one.
