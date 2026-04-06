import httpx
import base64
import json
from typing import Dict, Optional
from utils.logger import logger

class GitHubService:
    """
    Handles repository mutations and Pull Request orchestration via the GitHub REST API.
    """
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.headers = {
            "Authorization": f"token {self.access_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        self.base_url = "https://api.github.com"

    @staticmethod
    def verify_webhook_signature(payload_body: bytes, secret_token: str, signature_header: str) -> bool:
        """
        Validates the authenticity of inbound HTTPS Webhooks using HMAC SHA-256.
        """
        import hmac
        import hashlib
        if not signature_header:
            return False
        
        expected_signature = "sha256=" + hmac.new(
            secret_token.encode('utf-8'),
            payload_body,
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(expected_signature, signature_header)

    async def sync_repository(self, repo_full_name: str, branch: str = "main") -> Dict[str, str]:
        """
        Downloads the latest AST footprint from a remote repository into the Swarm Orchestrator.
        """
        file_map = {}
        try:
            async with httpx.AsyncClient() as client:
                tree_url = f"{self.base_url}/repos/{repo_full_name}/git/trees/{branch}?recursive=1"
                resp = await client.get(tree_url, headers=self.headers)
                resp.raise_for_status()
                
                tree_data = resp.json()
                for item in tree_data.get("tree", []):
                    if item["type"] == "blob":
                        # Skip large binaries or locked files
                        if int(item.get("size", 0)) > 500000:
                            continue
                            
                        # Download raw file
                        file_raw_url = f"https://raw.githubusercontent.com/{repo_full_name}/{branch}/{item['path']}"
                        raw_resp = await client.get(file_raw_url, headers={"Authorization": f"token {self.access_token}"})
                        if raw_resp.status_code == 200:
                            file_map[item['path']] = raw_resp.text
                            
            logger.info(f"GITHUB: Synced {len(file_map)} source files from {repo_full_name}:{branch}")
            return file_map
        except Exception as e:
            logger.error(f"GITHUB: Repository sync failed for {repo_full_name}: {e}")
            return {}

    async def create_pull_request(
        self, 
        repo_full_name: str, 
        file_map: Dict[str, str], 
        branch_name: str, 
        title: str, 
        body: str
    ) -> Optional[str]:
        """
        Automates the entire flow:
        1. Get default branch SHA
        2. Create a new branch
        3. Commit multiple files
        4. Open a Pull Request
        """
        try:
            async with httpx.AsyncClient() as client:
                # 1. Get default branch info
                repo_resp = await client.get(f"{self.base_url}/repos/{repo_full_name}", headers=self.headers)
                repo_resp.raise_for_status()
                default_branch = repo_resp.json()["default_branch"]

                branch_resp = await client.get(f"{self.base_url}/repos/{repo_full_name}/git/refs/heads/{default_branch}", headers=self.headers)
                branch_resp.raise_for_status()
                base_sha = branch_resp.json()["object"]["sha"]

                # 2. Create new branch
                ref_payload = {
                    "ref": f"refs/heads/{branch_name}",
                    "sha": base_sha
                }
                create_ref_resp = await client.post(f"{self.base_url}/repos/{repo_full_name}/git/refs", headers=self.headers, json=ref_payload)
                if create_ref_resp.status_code == 422: # Already exists?
                    logger.warning(f"GITHUB: Branch {branch_name} already exists in {repo_full_name}")
                else:
                    create_ref_resp.raise_for_status()

                # 3. Create a Tree (Multi-file commit)
                tree_items = []
                for path, content in file_map.items():
                    tree_items.append({
                        "path": path,
                        "mode": "100644",
                        "type": "blob",
                        "content": content
                    })

                tree_payload = {
                    "base_tree": base_sha,
                    "tree": tree_items
                }
                tree_resp = await client.post(f"{self.base_url}/repos/{repo_full_name}/git/trees", headers=self.headers, json=tree_payload)
                tree_resp.raise_for_status()
                tree_sha = tree_resp.json()["sha"]

                # 4. Create Commit
                commit_payload = {
                    "message": title,
                    "tree": tree_sha,
                    "parents": [base_sha]
                }
                commit_resp = await client.post(f"{self.base_url}/repos/{repo_full_name}/git/commits", headers=self.headers, json=commit_payload)
                commit_resp.raise_for_status()
                new_commit_sha = commit_resp.json()["sha"]

                # 5. Update Branch Ref
                update_ref_payload = {"sha": new_commit_sha}
                update_ref_resp = await client.patch(f"{self.base_url}/repos/{repo_full_name}/git/refs/heads/{branch_name}", headers=self.headers, json=update_ref_payload)
                update_ref_resp.raise_for_status()

                # 6. Open Pull Request
                pr_payload = {
                    "title": title,
                    "body": body + "\n\n---\n*Generated by Astraeus Swarm Orchestrator*",
                    "head": branch_name,
                    "base": default_branch
                }
                pr_resp = await client.post(f"{self.base_url}/repos/{repo_full_name}/pulls", headers=self.headers, json=pr_payload)
                pr_resp.raise_for_status()
                
                pr_url = pr_resp.json()["html_url"]
                logger.info(f"GITHUB: PR created successfully: {pr_url}")
                return pr_url

        except Exception as e:
            logger.error(f"GITHUB FAILURE: {str(e)}")
            return None
