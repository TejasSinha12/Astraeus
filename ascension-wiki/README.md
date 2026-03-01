# Ascension Intelligence Platform 🌐 (v5.0.0)

> The centralized gateway for institutional research, commercial AGI execution, and decentralized intelligence validation.

This is a production-grade Next.js 15+ interface designed for the **Project Ascension Ecosystem**. It serves as the visual command center for both autonomous research cycles and monetizable infrastructure management.

---

## 🔬 Institutional & Research Features

- **Grant Automation Dashboard**: Visual interface for tracking AI-generated research proposals and funding alignment.
- **Tournament Arena**: Real-time visualization of competitive swarm evolution and institutional benchmark challenges.
- **Validation Tracker**: Interface for decentralized nodes to monitor and verify intelligence artifacts.
- **Benchmarks Dashboard**: High-fidelity Recharts visualization of model performance milestones and fitness trajectories.
- **Agent Arena (React Flow)**: A live Directed Acyclic Graph (DAG) visualizing communication within the swarm.

---

## 💎 Commercial & Developer Tools

- **Developer Billing Portal**: Integrated Stripe interface for top-ups, transaction history, and token usage analytics.
- **API Key Management**: Secure console for generating, revoking, and scoping programmatic access keys.
- **Mission Archive**: IDE-like explorer for visualizing and downloading generated codebases as ZIP archives.
- **Usage Telemetry**: Real-time instrumentation dashboard showing OpenTelemetry traces and request auditing.

---

## 🏗️ Technical Architecture

The Wiki acts as the primary consumer for the **Project Ascension API**:

- **Next.js 15 (App Router)**: Optimized for high-performance data streaming and SEO.
- **Role-Based Access (Clerk)**:
  - **Public**: Basic execution and documentation.
  - **Researcher**: Access to benchmarks, arena, and institutional tools.
  - **Enterprise**: Custom organization control and high-performance swarm priority.
  - **Admin**: Full system governance and billing management.
- **PostgreSQL Persistence**: All mission data and billing records are stored via the backend at Neon.tech.

---

## 🛠️ Configuration

### Environment Setup
Create a `.env.local` file:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# API Connection
NEXT_PUBLIC_PLATFORM_API_URL=https://astraeus-r4pf.onrender.com
```

---

## 🛡️ Privacy & Compliance
- **JWT-Gated Security**: All sensitive actions are protected by Clerk-authenticated session tokens.
- **Immutable Ledgers**: Economic data displayed in the dashboard is synced with the cryptographically signed backend ledger.
- **Sanitized Streams**: Logs and telemetry are filtered to protect proprietary system prompts and keys.
