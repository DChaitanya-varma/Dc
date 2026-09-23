import json
import logging
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
import asyncio

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure

from app.core.config import settings

logger = logging.getLogger("kuchipudi.db")

class DatabaseManager:
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None
        self.is_mongodb_connected: bool = False
        self._lock = asyncio.Lock()

    async def connect(self):
        """Attempts to connect to MongoDB with a short timeout.
        Falls back to local file storage if MongoDB is unavailable."""
        try:
            # 2 second server selection timeout to avoid long hangs
            self.client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=2000
            )
            # Ping database to confirm live connection
            await self.client.admin.command('ping')
            self.db = self.client[settings.DATABASE_NAME]
            self.is_mongodb_connected = True
            logger.info(f"Connected to MongoDB at {settings.MONGODB_URL} (db: {settings.DATABASE_NAME})")
        except (ServerSelectionTimeoutError, ConnectionFailure, Exception) as e:
            self.is_mongodb_connected = False
            self.client = None
            self.db = None
            logger.warning(
                f"MongoDB connection unavailable ({e}). Using resilient local JSON fallback storage at {settings.FALLBACK_DATA_FILE}."
            )

    async def disconnect(self):
        if self.client:
            self.client.close()
            self.is_mongodb_connected = False

    def get_storage_mode(self) -> str:
        return "mongodb" if self.is_mongodb_connected else "local_json"

    # ------------------ Samples API ------------------

    async def save_sample(self, sample_data: Dict[str, Any]) -> Dict[str, Any]:
        doc = dict(sample_data)
        doc.setdefault("id", str(uuid.uuid4()))
        doc.setdefault("created_at", datetime.utcnow().isoformat())

        if self.is_mongodb_connected:
            await self.db.samples.insert_one(doc)
            doc.pop("_id", None)
            return doc
        else:
            async with self._lock:
                samples = self._read_fallback_file()
                samples.append(doc)
                self._write_fallback_file(samples)
            return doc

    async def get_all_samples(self) -> List[Dict[str, Any]]:
        if self.is_mongodb_connected:
            cursor = self.db.samples.find({})
            items = []
            async for doc in cursor:
                doc.pop("_id", None)
                items.append(doc)
            return items
        else:
            async with self._lock:
                return self._read_fallback_file()

    async def get_samples(self, skip: int = 0, limit: int = 100, mudra: Optional[str] = None) -> List[Dict[str, Any]]:
        if self.is_mongodb_connected:
            query = {}
            if mudra:
                query["mudra"] = mudra
            cursor = self.db.samples.find(query).skip(skip).limit(limit)
            items = []
            async for doc in cursor:
                doc.pop("_id", None)
                items.append(doc)
            return items
        else:
            async with self._lock:
                samples = self._read_fallback_file()
                if mudra:
                    samples = [s for s in samples if s.get("mudra") == mudra]
                return samples[skip:skip + limit]

    async def get_counts_by_mudra(self) -> Dict[str, int]:
        all_samples = await self.get_all_samples()
        counts: Dict[str, int] = {}
        for s in all_samples:
            m = s.get("mudra", "unknown")
            counts[m] = counts.get(m, 0) + 1
        return counts

    async def delete_sample(self, sample_id: str) -> bool:
        if self.is_mongodb_connected:
            res = await self.db.samples.delete_one({"id": sample_id})
            return res.deleted_count > 0
        else:
            async with self._lock:
                samples = self._read_fallback_file()
                initial_len = len(samples)
                samples = [s for s in samples if s.get("id") != sample_id]
                if len(samples) < initial_len:
                    self._write_fallback_file(samples)
                    return True
                return False

    async def clear_samples(self) -> int:
        if self.is_mongodb_connected:
            res = await self.db.samples.delete_many({})
            return res.deleted_count
        else:
            async with self._lock:
                samples = self._read_fallback_file()
                count = len(samples)
                self._write_fallback_file([])
                return count

    # ------------------ Fallback Helpers ------------------

    def _read_fallback_file(self) -> List[Dict[str, Any]]:
        if not settings.FALLBACK_DATA_FILE.exists():
            return []
        try:
            with open(settings.FALLBACK_DATA_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

    def _write_fallback_file(self, data: List[Dict[str, Any]]):
        settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
        with open(settings.FALLBACK_DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

db_manager = DatabaseManager()
