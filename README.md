# Project Ascension 🚀 (v2.0.0)

> A statistically governed **Autonomous Code Swarm** designed for measurable intelligence evolution, self-directed refactoring, and secure production-grade AGI orchestration.

Ascension is a multi-agent evolutionary ecosystem. It moves beyond standard LLM agents by implementing a **Swarm Orchestrator** that coordinates specialized cognitive roles (Planner, Architect, Critic, etc.) under strict **Statistical Governance** and **Scientific Verification** protocols.

---

## 🐝 Autonomous Code Swarm

Project Ascension leverages a distributed workforce of specialized agents:

- **Planner**: Deconstructs objectives into measurable mission DAGs.
- **Architect**: Designs structural solutions with AST/Code Graph awareness.
- **Implementer**: Generates high-efficiency, sandboxed code.
- **Critic & Optimizer**: Performs analytical auditing and performance tuning.
- **Auditor**: Validates security constraints and compliance.

---

## 🛡️ Governance & Stability Tier

To ensure safe and deterministic evolution, Ascension enforces a three-tier governance model:

- **Observe Mode**: Passive monitoring; the swarm proposes but never modifies.
- **Simulated Mode**: Proposed refactors are executed in **Isolated Git Branches**. full benchmark suites and **Fitness Diff** analysis are performed before merging.
- **Commit Mode**: Automatic code integration gated by statistical confidence thresholds and human-defined promotion rules.

### Performance Indicators (Codebase Fitness)
Every evolutionary cycle computes a composite **Fitness Score** based on:
- **Structural Entropy**: Reduction in architectural complexity.
- **Token Efficiency**: Improvement in logic density per token used.
- **Maintainability Index**: Longitudinal tracking of codebase health.
- **Benchmark Stability**: Deterministic replay validation.

---

## 🔬 Scientific Intelligence Verification

Ascension is built for falsifiability. It treats every architectural change as a scientific experiment:

- **A/B Evolution**: Parallel runs against a static control branch to validate intelligence gains.
- **Hypothesis Tagging**: Agents must declare measurable targets (e.g., "Reduce entropy by 12%") before modification.
- **Validation Audit**: Automatically generates reports comparing **Predicted vs. Actual** deltas with calibration accuracy metrics.
- **Intelligence Drift Detection**: Prevents metric gaming and protects against plateauing mutation strategies.

---

## �️ Core Architecture

### Platform API Gateway (`/api`)
- **FastAPI Core**: Secure execution layer separating the Swarm from the public web.
- **Clerk Auth**: JWT-based Role-Based Access Control (Admin > Researcher > Public).
- **Token Accounting**: Comprehensive metering of request costs with persistent usage logs.

### Cognition Tier (`/core`)
- **Swarm Orchestrator**: Manages agent lifecycles and inter-agent communication protocols.
- **Refactoring Engine**: AST-aware system that autonomously detects and fixes complexity bottlenecks.
- **Evolution Manager**: System state snapshotting ("DNA" persistence) for longitudinal analysis.

---

### Production Cloud Stack 🌐
- **Frontend**: [Vercel](https://astraeus-livid.vercel.app)
- **Backend**: [Render.com](https://astraeus-r4pf.onrender.com)
- **Database**: [Neon.tech](https://neon.tech) (PostgreSQL)

---

## 🛠️ Getting Started

### Prerequisites
- Python 3.10+
- OpenAI API Key
- Neon.tech PostgreSQL (for production)
- Clerk Account (for Auth)

### Platform Settings
1. **Frontend**: Set `NEXT_PUBLIC_PLATFORM_API_URL` to your Render backend.
2. **Backend**: Set `DATABASE_URL` (Neon) and `OPENAI_API_KEY`.

---

## 💎 System Administration

### Admin Token Management
As a Platform Administrator (Role: `ADMIN`), you can recharge user token balances directly via the API:

```bash
curl -X POST "https://astraeus-r4pf.onrender.com/admin/topup" \
     -H "Content-Type: application/json" \
     -H "x-clerk-user-role: ADMIN" \
     -d '{"user_id": "USER_ID", "amount": 50000}'
```

---

## 🧬 Evolutionary Ethics & Security
- **Hardened Sandbox**: Code execution is isolated with strict timeouts and resource caps.
- **Atomic Accounting**: Token balances are managed with Row-Level Locking (PostgreSQL) to prevent race conditions.
- **Rollback Triggers**: Automatic system rollback if evolutionary regressions exceed statistical bounds.
