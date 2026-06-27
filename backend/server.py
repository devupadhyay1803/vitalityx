"""
Thin proxy: forward all /api/* requests to Next.js running on localhost:3000.
This is needed because the Emergent k8s ingress routes /api/* to this FastAPI service.
"""
import httpx
from fastapi import FastAPI, Request, Response
from fastapi.responses import StreamingResponse

NEXT_BASE = "http://localhost:3000"

app = FastAPI(title="VitalityX FastAPI → Next.js proxy")

# Lazy-init shared client (HTTP/1.1 keepalive)
_client: httpx.AsyncClient | None = None

async def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(base_url=NEXT_BASE, timeout=60.0)
    return _client


@app.get("/api/_proxy_health")
async def proxy_health():
    return {"status": "ok", "proxy_target": NEXT_BASE}


@app.api_route(
    "/api/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
)
async def proxy(path: str, request: Request):
    client = await _get_client()
    body = await request.body()

    # Strip hop-by-hop / problematic headers
    skip_in = {"host", "content-length", "connection", "accept-encoding"}
    fwd_headers = {k: v for k, v in request.headers.items() if k.lower() not in skip_in}

    upstream_url = f"/api/{path}"
    if request.url.query:
        upstream_url += f"?{request.url.query}"

    try:
        upstream = await client.request(
            request.method, upstream_url, content=body, headers=fwd_headers
        )
    except httpx.HTTPError as e:
        return Response(content=f"Upstream error: {e}", status_code=502)

    skip_out = {"content-encoding", "transfer-encoding", "connection", "content-length"}
    out_headers = {k: v for k, v in upstream.headers.items() if k.lower() not in skip_out}

    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        headers=out_headers,
        media_type=upstream.headers.get("content-type"),
    )
