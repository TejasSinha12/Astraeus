# Astraeus Intelligence Platform 🧬

> **Autonomous Swarm-as-a-Service** — A production-grade multi-agent AI execution platform with institutional billing, federated orchestration, and cryptographically signed governance.

[![Live Platform](https://img.shields.io/badge/Platform-Live-00e5ff?style=for-the-badge)](https://astraeus-livid.vercel.app)
[![API Gateway](https://img.shields.io/badge/API-Online-34d399?style=for-the-badge)](https://astraeus-r4pf.onrender.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-15+-000?style=for-the-badge&logo=next.js)](https://nextjs.org)

---

## Overview

Astraeus replaces raw LLM API calls with a high-performance **Swarm Execution API**. Multiple specialized AI agents (Planner, Architect, Implementer, Critic, Optimizer, Auditor) collaborate through structured JSON protocols to produce production-quality code, with full observability and enterprise billing built in.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│            Next.js Frontend (Vercel)         │
│  Workspace · Arena · Archive · Governance    │
└──────────────────┬──────────────────────────┘
                   │ HTTPS / SSE
┌──────────────────▼──────────────────────────┐
│           FastAPI Gateway (Render)            │
│  RBAC Middleware · Token Metering · CORS     │
├──────────────────────────────────────────────┤
│  Swarm Orchestrator · Agent Spawner          │
│  Global Coordinator · Federation Protocol    │
├──────────────────────────────────────────────┤
│  Token Accounting · Signed Ledger · Stripe   │
│  Abuse Detection · Adaptive Pricing          │
├──────────────────────────────────────────────┤
│  PostgreSQL (Neon.tech) · ChromaDB · FAISS   │
└──────────────────────────────────────────────┘
```

---

## ✨ Key Features

### Multi-Agent Swarm Execution
- **6 Specialized Agent Roles**: Planner, Architect, Implementer, Critic, Optimizer, Auditor
- **Consensus-Based Merging**: Conflict resolution with agreement scoring
- **Multi-File Codebase Generation**: Full project scaffolding with ZIP export
- **SSE Streaming**: Real-time execution trace delivered to the frontend

### Federated Swarm Infrastructure
- **Distributed Clusters**: Regional swarm instances with expertise-based routing
- **Global Coordinator**: Intelligent mission dispatch across the federation
- **Federation Protocol**: Signed telemetry exchange between clusters
- **Automatic Rollback**: Federation-wide instability detection and recovery

### Intelligence Economy
- **Dual-Token System**: Consumable credits + non-transferable reputation
- **HMAC-SHA256 Signed Ledger**: Every transaction is cryptographically chained
- **Adaptive Pricing**: Dynamic cost scaling based on cluster load and complexity
- **Stripe Integration**: Real-time credit top-ups via webhook bridge

### Institutional Multi-Tenancy
- **Organization Shared Credit Pools**: Teams draw from a collective balance
- **Institutional Billing Console**: Admin UI for managing team credits
- **Org-Level RBAC**: Middleware-enforced solvency and permission checks
- **Scoped API Keys**: Granular access control with monthly quotas

### Scientific Verification
- **A/B Evolution Testing**: Parallel runs against control branches
- **Hypothesis Tagging**: Agents declare measurable targets before modification
- **Intelligence Drift Detection**: Plateau detection and calibration tracking
- **Research Publication Pipeline**: Automated report compilation with integrity signing

### Enterprise Governance
- **OpenTelemetry Tracing**: Distributed observability across the full request lifecycle
- **Audit Explorer**: Filterable compliance logs with structured metadata
- **System Health Dashboard**: Real-time monitoring of platform vitals
- **Revenue Analytics**: Token flow visualization and billing metrics

---

## 🖥️ Platform Pages

| Page | Description |
|------|-------------|
| **Workspace** (`/coding`) | Professional IDE with split-pane editor, live preview, SSE telemetry, and mission DAG |
| **Agent Arena** (`/arena`) | Real-time agent simulation with reasoning traces, confidence graphs, and genealogy DAG |
| **Mission Archive** (`/archive`) | Browse, inspect, and export all swarm-generated artifacts |
| **Governance Console** (`/control/governance`) | Admin dashboard with system health, revenue, audit logs, access control, and team billing |

---

## 🛠️ Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (Neon.tech recommended)
- OpenAI API Key
- Clerk Account (Authentication)
- Stripe Account (Billing)

### Backend Setup
```bash
cd project_ascension
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys and DATABASE_URL

# Run locally
uvicorn api.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd ascension-wiki
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with Clerk keys and API URL

npm run dev
```

### Production Deployment
1. **Frontend**: Deploy `ascension-wiki/` to [Vercel](https://vercel.com)
2. **Backend**: Deploy root project to [Render](https://render.com) with `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
3. **Database**: Provision PostgreSQL on [Neon.tech](https://neon.tech) and set `DATABASE_URL`

---

## 📡 API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/execute/stream` | `POST` | Execute a swarm mission with SSE streaming |
| `/estimate` | `POST` | Get token cost estimate for an objective |
| `/user/status` | `GET` | Current balance, reputation, and tier |
| `/missions/list` | `GET` | List all persisted mission artifacts |
| `/missions/{id}/source` | `GET` | Retrieve source code for a mission |
| `/missions/{id}/export` | `GET` | Download mission as ZIP archive |
| `/missions/lineage` | `GET` | Evolution genealogy graph |
| `/admin/metrics/health` | `GET` | System health telemetry |
| `/admin/metrics/revenue` | `GET` | Revenue and billing analytics |
| `/admin/organizations` | `GET` | List all institutional accounts |

---

## 📁 Project Structure

```
project_ascension/
├── api/                    # FastAPI Gateway
│   ├── main.py             # Application entry point
│   ├── admin.py            # Governance & admin endpoints
│   ├── middleware.py        # RBAC & token metering
│   ├── missions.py         # Mission CRUD & export
│   ├── token_accounting.py # Balance management
│   ├── usage_db.py         # SQLAlchemy models & schema
│   ├── stripe_bridge.py    # Payment webhook handler
│   └── billing_exporter.py # Invoice & usage reports
├── core/                   # Intelligence Engine
│   ├── reasoning_engine.py # LLM abstraction layer
│   ├── swarm_orchestrator.py # Multi-agent lifecycle
│   ├── global_coordinator.py # Federation routing
│   ├── token_ledger.py     # Signed transaction ledger
│   ├── marketplace.py      # Capability marketplace
│   ├── abuse_detector.py   # Anomaly detection
│   └── meta_governance.py  # Orchestration policy engine
├── ascension-wiki/         # Next.js Frontend
│   ├── app/                # Pages (coding, arena, archive, governance)
│   └── components/         # UI components (admin, coding, auth)
├── tools/                  # Agent tooling (git, code execution)
├── metrics/                # Intelligence index & benchmarks
└── requirements.txt        # Python dependencies
```

---

## 🔒 Security

- **Clerk JWT Authentication**: All requests are gated by verified session tokens
- **RBAC Middleware**: Path-based access control (Public → Researcher → Admin)
- **HMAC-SHA256 Ledger**: Financial records are cryptographically chained and tamper-evident
- **Hardened Sandbox**: Code execution runs in isolated environments with strict resource limits
- **Institutional Solvency Gates**: Organization balance pre-checks before expensive operations

---

## 📄 License

This project is proprietary software. All rights reserved.

---

<p align="center">
  <b>Built with 🧬 by <a href="https://github.com/TejasSinha12">Tejas Sinha</a></b><br>
  <sub>Autonomous Intelligence Infrastructure</sub>
</p>
