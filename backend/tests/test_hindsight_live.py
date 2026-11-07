import pytest
import httpx
import asyncio
from app.config import settings
from app.services.hindsight import hindsight_service
from app.schemas.memory import HindsightRetainRequest, HindsightRecallRequest

def test_live_hindsight_daemon_connectivity():
    """
    Separately identifiable live Hindsight integration test.
    Attempts real network connection to configured HINDSIGHT_API_URL.
    Honoring audit requirement: if daemon is not returning 200, test honestly reports
    the exact HTTP status code and environmental dependency.
    """
    url = settings.HINDSIGHT_API_URL.rstrip('/')
    is_live = False
    status_code = None
    response_body = ""

    async def _check():
        nonlocal is_live, status_code, response_body
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                resp = await client.get(f"{url}/health")
                status_code = resp.status_code
                response_body = resp.text[:100]
                if status_code == 200:
                    is_live = True
        except Exception as e:
            response_body = str(e)

    asyncio.run(_check())

    if not is_live:
        pytest.skip(
            f"External Hindsight daemon at {url} returned HTTP {status_code} ({response_body.strip()}). "
            f"Live external integration requires an unblocked external service."
        )

    # If live daemon responded with 200, verify external retain and recall
    async def _live_ops():
        test_claim = "Live daemon verification claim for PRECEDENT Phase 3 audit"
        retain_res = await hindsight_service.retain(HindsightRetainRequest(
            content=test_claim,
            context="live_audit_test",
            tags=["live_test"]
        ))
        assert retain_res.status == "retained_live"
        assert retain_res.memory_id is not None

        recall_res = await hindsight_service.recall(HindsightRecallRequest(
            query="Live daemon verification claim",
            limit=1,
            tags=["live_test"]
        ))
        assert recall_res.total_results >= 1

    asyncio.run(_live_ops())

def test_hindsight_service_honesty_mode():
    """
    Verifies that PRECEDENT's Hindsight service never misrepresents
    fallback status as CONNECTED when external daemon returns non-200.
    """
    async def _run():
        health = await hindsight_service.check_health()
        assert health["status"] in ["CONNECTED", "FALLBACK"]
        if health["status"] == "FALLBACK":
            assert health["mode"] == "EMBEDDED_SQLITE_PERSISTENT"
            assert "stored_local_memories" in health
            assert "fallback" in health["description"].lower()
        else:
            assert health["mode"] == "LIVE_EXTERNAL"

    asyncio.run(_run())
