# Astraeus Frontend — Swarm Management Console 🌐

> The administrative and developer interface for the [Astraeus Intelligence Platform](https://astraeus-livid.vercel.app).

---

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/coding` | **Workspace** | Professional IDE with split-pane editor, live HTML preview, SSE telemetry meters, mission DAG, and diff comparison |
| `/arena` | **Agent Arena** | Real-time agent simulation with reasoning traces, confidence graphs, evolution genealogy, federation topology, and researcher profile |
| `/archive` | **Mission Archive** | Browse, inspect, and export all swarm-generated code artifacts with multi-file support |
| `/control/governance` | **Governance Console** | Admin dashboard: system health, revenue analytics, audit logs, access control, and team billing |

---

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Authentication**: Clerk (JWT-based RBAC)
- **Visualization**: Framer Motion, Recharts, React Flow, Lucide Icons
- **State Management**: Zustand + SWR
- **Styling**: Custom CSS with glassmorphism design system

---

## Setup

```bash
npm install

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_PLATFORM_API_URL=https://astraeus-r4pf.onrender.com
EOF

npm run dev
```

---

## Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `GovernanceDashboard` | `components/admin/` | Tab-based admin console (Health, Revenue, Audit, Access, Team Billing) |
| `TeamBilling` | `components/admin/` | Institutional credit pool management |
| `AccessManager` | `components/admin/` | API key and user role management |
| `ResearcherProfile` | `components/admin/` | GitHub-style radar chart and contribution map |
| `TelemetryMeters` | `components/coding/` | Real-time token, latency, confidence, and cost gauges |
| `TraceSidebar` | `components/coding/` | Live execution logs and reasoning step inspector |
| `MissionDAG` | `components/coding/` | React Flow visualization of swarm reasoning steps |
| `RoleGate` | `components/auth/` | Clerk-based RBAC wrapper for protected routes |

---

## Deployment

Deploy to [Vercel](https://vercel.com):
1. Connect the `ascension-wiki` directory as the root
2. Set environment variables in Vercel dashboard
3. Deploy — auto-builds on every push to `main`

**Live**: [astraeus-livid.vercel.app](https://astraeus-livid.vercel.app)
