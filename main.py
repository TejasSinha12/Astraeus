"""
Project Ascension CLI Entrypoint.
Launch interactive reasoning loops directly from the terminal.
"""
import sys
import asyncio
from dotenv import load_dotenv

# Ensure .env is loaded (for OpenAI API key)
load_dotenv()

from agents.profiles import create_researcher_agent, create_coder_agent
from utils.logger import logger

async def interactive_shell():
    print("========================================")
    print("🚀 PROJECT ASCENSION - AGI TERMINAL")
    print("========================================")
    print("Available Agents:")
    print("1) Researcher_01 (WebSearch)")
    print("2) Coder_01 (FileSystem + PythonSandbox)")
    print("----------------------------------------")
    
    choice = input("Select Agent [1 or 2]: ").strip()
    
    if choice == "1":
        agent = create_researcher_agent()
        print(f"\n[+] Booted {agent.agent_id} ({agent.role})")
    elif choice == "2":
        agent = create_coder_agent(sandbox_dir="./sandbox")
        print(f"\n[+] Booted {agent.agent_id} ({agent.role})")
        print("[!] Warning: Coder_01 has direct python execution capability.")
    else:
        print("Invalid choice. Exiting.")
        sys.exit(1)

    print("----------------------------------------")
    print("Type 'exit' to quit at any time (or Ctrl+C).")
    
    while True:
        try:
            goal = input("\n[USER] > ").strip()
            if not goal:
                continue
            if goal.lower() in ["exit", "quit", "q"]:
                print("Shutting down...")
                break
                
            print(f"\n[{agent.agent_id} IS THINKING...]")
            # Note: actual execution requires the LLM loop implementation to be wired
            # internally. This triggers the highest-level plan generation:
            result = await agent.core.execute_goal(goal)
            
            print("\n========================================")
            print("[+] MISSION COMPLETE")
            print("========================================")
            print(result)
            
        except KeyboardInterrupt:
            print("\nShutting down due to interrupt...")
            break
        except Exception as e:
            logger.error(f"Fatal error during execution: {e}")
            print(f"\n[!] SYSTEM ERROR: {e}")

if __name__ == "__main__":
    try:
        asyncio.run(interactive_shell())
    except KeyboardInterrupt:
        pass
