# Project Ascension 🚀

> A purely modular, statistically-backed AGI research framework designed for autonomous reasoning, iterative self-improvement, and multi-agent expansion.

Ascension is not just an LLM wrapper. It is a structured environment that separates intention, execution, memory retrieval, and self-evaluation into distinct asynchronous pipelines, creating a continuous quantitative learning loop.

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
- **Base Tool Interface**: Requires all tools to publish precise json schemas.
- **Tool Executor**: Acts as a try/catch sandbox generating strings for short term ingestion regardless of tool success or failure.

### Learning & Evals (`/learning` & `/evals` & `/optimization`)
- **Feedback & Reflection**: Evaluates execution traces to generate new hypothesized heuristics (rules).
- **Benchmark Sandbox**: Runs deterministic tests (`math`, `logic`, `planning`) against static AGI versions.
- **Heuristic Optimizer**: *A/B tests* proposed rules numerically. Promotes rules to the System Prompt only if they empirically improve benchmark scores without triggering regression.
- **Telemetry DB**: (`/metrics`) SQLite logs tracking rule weights, component hit-rates, and confidence calibration.

### Security Layers (`/safety`)
- **Sandbox**: Restricts commands by regex and limits file access to specific directories.
- **Ethical Firewall**: Moderates proposed dangerous actions using a constrained secondary AI check.
- **Versioning**: (`/versions`) Ability to snapshot and cleanly rollback FAISS vectors and heuristic rules.

### Swarm Management (`/agents` & `/api`)
- **Multi-Agent Coordinator**: Routes tasks to available asynchronous `AutonomousAgent` instances.
- **REST Interface**: Built on FastAPI to query swarm state, assign tasks, and trigger emergency global halts.

## 🛠️ Getting Started

### Prerequisites
- Python 3.12+
- OpenAI API Key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/TejasSinha12/Astraeus.git
cd Astraeus
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Setup environment variables:
Create a `.env` file in the root directory and add:
```env
OPENAI_API_KEY=your_api_key_here
```

### Running the API Gateway
```bash
uvicorn api.rest_interface:app --reload
```
Access the REST swagger docs at `http://localhost:8000/docs`.

## 🧪 Development & Evaluation

To customize the AGI:
1. Wrap new capabilities by inheriting `BaseTool` (in `/tools`).
2. Register them to the `ToolRegistry`.
3. Add domain-specific test configurations into `/evals/datasets/` to ensure the Continuous Learning loop optimizes for your specific use-cases.
