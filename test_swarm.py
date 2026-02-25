import asyncio
from core.cognition import CognitionCore

async def test():
    core = CognitionCore()
    res = await core.swarm.execute_swarm_objective("Architect a complete authenticating proxy server. Give me main.py for the FastAPI entry point, auth.py for the JWT logic, and a README.md")
    print("Result:", res)

asyncio.run(test())
