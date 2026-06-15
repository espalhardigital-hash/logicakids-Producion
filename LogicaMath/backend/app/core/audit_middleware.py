import json
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from ..db.session import AsyncSessionLocal
from ..models.audit import AuditLog

class AuditMiddleware(BaseHTTPMiddleware):
    """
    Middleware that intercepts all mutating requests (POST, PUT, PATCH, DELETE)
    to /admin/* endpoints and logs them to the AuditLog table for compliance.
    """
    async def dispatch(self, request: Request, call_next):
        # We only care about /admin paths
        if request.url.path.startswith("/admin") and request.method in ["POST", "PUT", "PATCH", "DELETE"]:
            # Capture request body (up to 2000 chars to avoid huge payloads)
            body = b""
            try:
                body = await request.body()
            except Exception:
                pass
            
            payload_summary = body.decode("utf-8", errors="ignore")[:2000] if body else None
            
            # Re-inject the body so the actual endpoint can read it
            async def receive():
                return {"type": "http.request", "body": body}
            request._receive = receive
            
            response = await call_next(request)
            
            # Note: getting the admin_id from the token is tricky inside a middleware
            # because dependencies haven't run yet. For simplicity in this demo,
            # we'll log it as "SYSTEM_OR_ADMIN" unless we can decode the JWT manually.
            # In a real app, we'd decode the Authorization header.
            auth_header = request.headers.get("Authorization", "")
            admin_id = "UNKNOWN"
            if auth_header.startswith("Bearer "):
                admin_id = "ADMIN_TOKEN_USED" # Placeholder for decoded ID

            # Save the log
            async with AsyncSessionLocal() as session:
                audit_entry = AuditLog(
                    admin_id=admin_id,
                    action=f"{request.method} {request.url.path}",
                    endpoint=request.url.path,
                    method=request.method,
                    payload_summary=payload_summary,
                    ip_address=request.client.host if request.client else "UNKNOWN"
                )
                session.add(audit_entry)
                await session.commit()
                
            return response
        else:
            return await call_next(request)
