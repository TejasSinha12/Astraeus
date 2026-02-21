"""
Code Intelligence Layer for structural reasoning.
Parses Python source using AST to extract functions, classes, dependencies, and complexity.
"""
import ast
from typing import List, Dict, Any, Optional
from utils.logger import logger

class CodeIntelligence:
    """
    Analyzes code structure to provide metadata summaries for the AGI core.
    Allows reasoning over architecture instead of raw text.
    """

    @staticmethod
    def parse_source(source_code: str) -> Dict[str, Any]:
        """
        Parses Python source and returns a structural metadata dictionary.
        """
        try:
            tree = ast.parse(source_code)
        except SyntaxError as e:
            logger.error(f"AST Parsing failed: {e}")
            return {"error": f"SyntaxError: {e}"}

        metadata = {
            "functions": [],
            "classes": [],
            "imports": [],
            "complexity": 0,
            "summary": ""
        }

        for node in ast.walk(tree):
            # Extract Functions
            if isinstance(node, ast.FunctionDef):
                metadata["functions"].append({
                    "name": node.name,
                    "args": [arg.arg for arg in node.args.args],
                    "lineno": node.lineno,
                    "docstring": ast.get_docstring(node)
                })
                # Basic complexity estimation (count branches)
                metadata["complexity"] += 1 

            # Extract Classes
            elif isinstance(node, ast.ClassDef):
                metadata["classes"].append({
                    "name": node.name,
                    "bases": [ast.unparse(base) if hasattr(ast, 'unparse') else str(base) for base in node.bases],
                    "methods": [n.name for n in node.body if isinstance(n, ast.FunctionDef)]
                })

            # Extract Imports
            elif isinstance(node, ast.Import):
                for alias in node.names:
                    metadata["imports"].append(alias.name)
            elif isinstance(node, ast.ImportFrom):
                metadata["imports"].append(f"{node.module}.{node.names[0].name}")

            # Complexity increments for branches
            elif isinstance(node, (ast.If, ast.While, ast.For, ast.With, ast.ExceptHandler)):
                metadata["complexity"] += 1

        metadata["summary"] = CodeIntelligence.generate_text_summary(metadata)
        return metadata

    @staticmethod
    def generate_text_summary(metadata: Dict[str, Any]) -> str:
        """
        Generates a token-efficient text summary of the code metadata.
        """
        if "error" in metadata:
            return f"Error: {metadata['error']}"

        summary = f"Functions: {', '.join([f['name'] for f in metadata['functions']])}\n"
        summary += f"Classes: {', '.join([c['name'] for c in metadata['classes']])}\n"
        summary += f"Imports: {len(metadata['imports'])} items\n"
        summary += f"Complexity Score: {metadata['complexity']}\n"
        
        return summary
