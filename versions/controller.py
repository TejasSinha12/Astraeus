"""
Manages snapshotting and rollback of the AGI's cognitive state.
"""
import shutil
import os
import json
from datetime import datetime

from core_config import config
from utils.logger import logger

class VersionController:
    """
    Saves and restores point-in-time snapshots of the VectorStore and System Heuristics.
    Critical for rolling back degraded iterations after bad benchmark A/B tests.
    """

    def __init__(self):
        self.snapshots_dir = f"{config.MEMORY_INDEX_PATH}_snapshots"
        os.makedirs(self.snapshots_dir, exist_ok=True)
        
        self.active_faiss = f"{config.MEMORY_INDEX_PATH}.faiss"
        self.active_meta = f"{config.MEMORY_INDEX_PATH}.json"
        self.active_heuristics = f"{config.MEMORY_INDEX_PATH}_v2_heuristics.json"
        
        logger.info(f"VersionController active. Snapshots mapped to {self.snapshots_dir}")

    def create_snapshot(self, version_label: str) -> bool:
        """
        Hard copies the current LTM state into a labeled directory.
        """
        target_dir = os.path.join(self.snapshots_dir, version_label)
        if os.path.exists(target_dir):
            logger.warning(f"Snapshot {version_label} already exists. Aborting overwrite.")
            return False
            
        os.makedirs(target_dir)
        
        try:
            if os.path.exists(self.active_faiss):
                shutil.copy2(self.active_faiss, os.path.join(target_dir, "index.faiss"))
            if os.path.exists(self.active_meta):
                shutil.copy2(self.active_meta, os.path.join(target_dir, "meta.json"))
            if os.path.exists(self.active_heuristics):
                shutil.copy2(self.active_heuristics, os.path.join(target_dir, "heuristics.json"))
                
            # Create manifest
            manifest = {
                "version": version_label,
                "timestamp": datetime.now().isoformat()
            }
            with open(os.path.join(target_dir, "manifest.json"), 'w') as f:
                 json.dump(manifest, f)
                 
            logger.info(f"Snapshot '{version_label}' successfully created.")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create snapshot '{version_label}': {e}")
            shutil.rmtree(target_dir, ignore_errors=True)
            return False

    def rollback_to_snapshot(self, version_label: str) -> bool:
        """
        Overwrites active LTM state with the requested snapshot.
        """
        target_dir = os.path.join(self.snapshots_dir, version_label)
        if not os.path.exists(target_dir):
            logger.error(f"Cannot rollback. Snapshot {version_label} does not exist.")
            return False
            
        logger.warning(f"INITIATING SYSTEM ROLLBACK TO {version_label}")
        
        try:
             # Warning: Destructive action
             if os.path.exists(os.path.join(target_dir, "index.faiss")):
                 shutil.copy2(os.path.join(target_dir, "index.faiss"), self.active_faiss)
             if os.path.exists(os.path.join(target_dir, "meta.json")):
                 shutil.copy2(os.path.join(target_dir, "meta.json"), self.active_meta)
             if os.path.exists(os.path.join(target_dir, "heuristics.json")):
                 shutil.copy2(os.path.join(target_dir, "heuristics.json"), self.active_heuristics)
                 
             logger.info(f"Rollback to '{version_label}' complete. Active Memory State Mutated.")
             return True
        except Exception as e:
             logger.critical(f"FATAL BLOCK DURING ROLLBACK: {e}")
             return False
        
