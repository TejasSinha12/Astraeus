# Ascension Intelligence Platform 🌐 (v2.0.0)

> The primary research interface and mission control for the Project Ascension Autonomous Code Swarm.

This is a production-grade Next.js 15+ (App Router) interface designed for real-time observation, orchestration, and scientific verification of AGI cognitive processes.

---

## 🔬 Intelligence Research Features

- **Benchmarks Dashboard**: High-fidelity Recharts visualization of model performance milestones and fitness trajectories.
- **Evolution Timeline**: An interactive history of structural self-refactoring and intelligence gains over time.
- **Agent Arena (React Flow)**: A live Directed Acyclic Graph (DAG) visualizing inter-agent communication and hierarchical reasoning transitions within the swarm.
- **Mission Archive Explorer**: An IDE-like sidebar for visualizing and downloading generated multi-file codebases as ZIP archives from previous sandbox missions.
- **Experiment Workbench**: Control interface for hypothesis tagging, A/B evolution triggering, and plateau detection.
- **Cognition Map**: Interactive system architecture visualization illustrating the data flow between core components.

---

## 🏗️ Platform Architecture

The website acts as a secure frontend consumer for the **Project Ascension Platform API**:

- **Secure Execution Gateway**: All requests are routed through a FastAPI intermediary (`/api`) to protect the Ascension Core from direct public exposure.
- **Role-Based Access (Clerk)**:
  - **Public**: Basic execution and documentation access.
  - **Researcher**: Access to benchmarks, arena, and longitudinal studies.
  - **Admin**: Full control over swarm governance, refactoring, and experiment parameters.
- **Token Accounting**: Real-time integration with the backend token meter, displaying user balances and session costs.

---

## 🛠️ Development & Installation

### Prerequisites
- Node.js 20+
- A [Clerk](https://clerk.com) account (for Auth and RBAC)

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env.local` file:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# API Connection
NEXT_PUBLIC_PLATFORM_API_URL=http://localhost:8000
```

### Run the Interface
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the Intelligence Platform.

---

## 🛡️ Security & Privacy
- **JWT-Gated Routing**: Clerk handles all authentication and secure session management.
- **Sanitized Telemetry**: Live log streams (SSE) are filtered to prevent leaking sensitive system prompts or environment keys.
- **Evolution Isolation**: All autonomous refactoring takes place in isolated branches, with the frontend acting as the validation gate.
