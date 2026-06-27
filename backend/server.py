"""
Stub backend - all real API logic lives in Next.js /app/frontend/app/api routes.
This exists only to satisfy the supervisor 'backend' service.
"""
from fastapi import FastAPI

app = FastAPI(title="VitalityX Stub Backend")


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "stub", "real_api": "next.js /api routes"}
