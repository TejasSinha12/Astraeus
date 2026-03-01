# Ascension Platform Gateway 🌐 (v5.0.0)

> **The Swarm Management Console**: A production-grade interface for managing API execution, real-time telemetry, and enterprise-grade governance.

This is the primary developer and administrator interface for the **Project Ascension Ecosystem**. It provides high-fidelity visualization and control over the Swarm Execution API and its underlying infrastructure.

---

## � Platform Pillars

### 1. Swarm Execution API
- **Execution Arena**: Real-time visualization of multi-agent reasoning flows and agent orchestration.
- **Mission Archive**: Full persistence layer for every swarm execution, with ZIP artifact bundling and code visualization.
- **Benchmarks Dashboard**: High-fidelity tracking of model performance, token efficiency, and fitness deltas.

### 2. Developer Infrastructure
- **API Key Console**: Secure management of programmatic access keys with granular, scoped permissions.
- **Billing Portal**: Integrated Stripe bridge for real-time credit top-ups, transaction history, and metering analytics.
- **Usage Telemetry**: Integrated OpenTelemetry dashboard showcasing live request spans and execution traces.

### 3. Enterprise Governance
- **Audit Logs**: Cryptographically signed records of all administrative and execution actions.
- **RBAC Management**: Multi-tenant organization control with role-based visibility (Admin / Enterprise / Developer).
- **Compliance Export**: Standardized telemetry exports for external auditing and institutional reporting.

---

## 🏗️ Technical Stack

The gateway is built as a highly optimized consumer for the **Project Ascension REST API**:

- **Framework**: Next.js 15+ (App Router)
- **Authentication**: Clerk JWT-based RBAC
- **Visualization**: Framer Motion, Recharts, React Flow
- **Observability**: OpenTelemetry / Structured Logging

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

## 🛡️ Operational Security
- **JWT-Gated Security**: All API interactions are gated by Clerk-authenticated session tokens.
- **Immutable Ledgers**: Economic and execution data is synced from the cryptographically signed PostgreSQL backend.
- **Sanitized Streams**: Live logs and telemetry are filtered to protect system prompts and environment keys.
