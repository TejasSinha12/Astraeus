"""
Institutional Manager for Ascension.
Handles multi-tenant organization orchestration, RBAC, and governance policy enforcement.
"""
from typing import List, Dict, Any, Optional
import json
import uuid
from api.usage_db import SessionLocal, Organization, UserAccount
from utils.logger import logger

class InstitutionalManager:
    """
    Service for managing institutional research environments and organizational boundaries.
    """

    def create_organization(self, name: str, domain: str, sso_metadata: str = "") -> str:
        """
        Provisions a new research organization with unique isolation boundaries.
        """
        org_id = f"ORG-{str(uuid.uuid4())[:8].upper()}"
        logger.info(f"INSTITUTION: Creating organization {name} ({org_id})...")
        
        try:
            with SessionLocal() as db:
                org = Organization(
                    id=org_id,
                    name=name,
                    domain=domain,
                    sso_config=sso_metadata,
                    governance_policy=json.dumps({
                        "require_validation": True,
                        "token_cap_per_mission": 500.0,
                        "data_retention_days": 90
                    })
                )
                db.add(org)
                db.commit()
                return org_id
        except Exception as e:
            logger.error(f"INSTITUTION: Organization creation failed: {e}")
            return ""

    def onboard_user_to_org(self, user_id: str, org_id: str) -> bool:
        """
        Links a user account to an institutional organization, enabling RBAC scopes.
        """
        try:
            with SessionLocal() as db:
                user = db.query(UserAccount).filter(UserAccount.id == user_id).first()
                if not user:
                    return False
                
                user.org_id = org_id
                db.commit()
                logger.info(f"INSTITUTION: User {user_id} onboarded to {org_id}")
                return True
        except Exception as e:
            logger.error(f"INSTITUTION: User onboarding failed: {e}")
            return False

    def get_org_governance(self, org_id: str) -> Dict[str, Any]:
        """
        Retrieves the governance constraints for a specific institution.
        """
        with SessionLocal() as db:
            org = db.query(Organization).filter(Organization.id == org_id).first()
            if not org:
                return {}
            return json.loads(org.governance_policy) if org.governance_policy else {}
