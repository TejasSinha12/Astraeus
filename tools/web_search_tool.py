"""
Web Search tool allowing the AGI to pull real-time internet data.
"""
from typing import Type
from pydantic import BaseModel, Field
from duckduckgo_search import DDGS
import asyncio

from tools.base_tool import BaseTool
from utils.logger import logger

class WebSearchInput(BaseModel):
    query: str = Field(description="The exact search string to look up.")
    max_results: int = Field(default=3, description="Number of results to return. Max 10.")

class WebSearchTool(BaseTool):
    """
    Searches duckduckgo for recent information bypassing local model knowledge gaps.
    """
    _name = "web_search"
    _description = "Searches the live internet for up-to-date facts, news, or general data. Returns snippets and URLs."
    _args_schema = WebSearchInput

    @property
    def name(self) -> str:
        return self._name

    @property
    def description(self) -> str:
        return self._description

    @property
    def args_schema(self) -> Type[BaseModel]:
        return self._args_schema

    async def execute(self, **kwargs) -> str:
        query = kwargs.get("query", "")
        max_results = min(kwargs.get("max_results", 3), 10)

        if not query:
            return "Error: No query provided."

        logger.info(f"Tool {self.name} executing search: '{query}'")
        try:
             # DDGS is synchronous by default, wrapping it so it doesn't block
             def _search():
                 with DDGS() as ddgs:
                     # Using standard text search instead of deprecated methods
                     results = list(ddgs.text(query, max_results=max_results))
                     return results

             loop = asyncio.get_event_loop()
             raw_results = await loop.run_in_executor(None, _search)
             
             if not raw_results:
                 return "No search results found."
                 
             formatted = "Web Search Results:\n"
             for i, res in enumerate(raw_results, 1):
                 formatted += f"[{i}] {res.get('title', 'No Title')}\nURL: {res.get('href', 'No URL')}\nSnippet: {res.get('body', '')}\n\n"
                 
             return formatted

        except Exception as e:
            logger.error(f"WebSearchTool failed: {e}")
            return f"Error executing web search: {e}"
