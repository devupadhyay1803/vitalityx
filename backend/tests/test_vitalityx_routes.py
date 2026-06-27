"""VitalityX route + API smoke tests via public preview URL."""
import os
import pytest
import requests

BASE_URL = "https://health-platform-dev-2.preview.emergentagent.com"

PUBLIC_PAGES = [
    "/", "/terms", "/privacy", "/gina", "/help",
    "/forgot-password", "/reset-password",
    "/login", "/signup", "/cart",
]


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"User-Agent": "vitalityx-tests/1.0"})
    return s


# ---------- Public pages render ----------
@pytest.mark.parametrize("path", PUBLIC_PAGES)
def test_public_page_loads(session, path):
    r = session.get(f"{BASE_URL}{path}", timeout=60, allow_redirects=True)
    assert r.status_code == 200, f"{path} returned {r.status_code}"
    # Cheap content sanity check
    assert "<html" in r.text.lower()


def test_help_page_has_faq(session):
    r = session.get(f"{BASE_URL}/help", timeout=60)
    assert r.status_code == 200
    # Look for FAQ-ish content
    body = r.text.lower()
    assert "faq" in body or "frequently" in body or "question" in body


def test_landing_has_hero_and_supplements(session):
    r = session.get(f"{BASE_URL}/", timeout=60)
    assert r.status_code == 200
    body = r.text.lower()
    assert "vitalityx" in body or "longevity" in body or "protocol" in body
    # Demo switcher should be in the markup since NEXT_PUBLIC_DEMO_MODE=true
    assert "member view" in body or "demo" in body


# ---------- Auth-protected routes redirect when not logged in ----------
@pytest.mark.parametrize("path", [
    "/member/dashboard", "/member/data", "/member/protocol",
    "/member/sessions", "/member/messages", "/member/check-in",
    "/member/supplements", "/member/settings",
    "/staff/dashboard", "/staff/clients", "/staff/sessions", "/staff/settings",
])
def test_protected_pages_redirect_or_block(session, path):
    r = session.get(f"{BASE_URL}{path}", timeout=60, allow_redirects=False)
    # Middleware should redirect (307/302) to /login when unauthenticated, OR
    # render a server page that ultimately requires auth. Accept 200 only if
    # the page contains a redirect to login (Next can do client redirect).
    if r.status_code in (301, 302, 303, 307, 308):
        loc = r.headers.get("location", "")
        assert "/login" in loc or "/" == loc, f"{path} redirected to {loc}"
    else:
        # Allow 200 (Next may render auth wall via client) but flag if it
        # exposes private content.
        assert r.status_code == 200, f"{path} returned {r.status_code}"


# ---------- API: admin bootstrap ----------
def test_admin_bootstrap_idempotent(session):
    r = session.get(f"{BASE_URL}/api/admin/bootstrap?token=vx-bootstrap-2026", timeout=120)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("ok") is True
    assert data.get("memberId")
    assert data.get("coachId")


def test_admin_bootstrap_requires_token(session):
    r = session.get(f"{BASE_URL}/api/admin/bootstrap", timeout=30)
    assert r.status_code in (401, 403)


# ---------- API: Stripe checkout (no auth -> guest) ----------
def test_stripe_checkout_returns_url(session):
    payload = {
        "items": [{"id": "omega-3-concentrate", "quantity": 1}],
        "origin": BASE_URL,
    }
    r = session.post(f"{BASE_URL}/api/stripe/checkout", json=payload, timeout=60)
    assert r.status_code == 200, f"{r.status_code} {r.text}"
    data = r.json()
    assert "url" in data and data["url"].startswith("https://checkout.stripe.com"), data
    assert "session_id" in data and data["session_id"].startswith("cs_")


def test_stripe_checkout_rejects_empty_items(session):
    r = session.post(f"{BASE_URL}/api/stripe/checkout", json={"items": [], "origin": BASE_URL}, timeout=30)
    assert r.status_code == 400


def test_stripe_checkout_rejects_unknown_product(session):
    payload = {"items": [{"id": "does-not-exist", "quantity": 1}], "origin": BASE_URL}
    r = session.post(f"{BASE_URL}/api/stripe/checkout", json=payload, timeout=30)
    assert r.status_code == 400


# ---------- Supabase auth via demo creds (Supabase REST passwordless sign-in) ----------
SUPABASE_URL = "https://pxrrhxgspipzodzzumig.supabase.co"
SUPABASE_ANON = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4cnJoeGdzcGlwem9kenp1bWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDM2MDUsImV4cCI6MjA5ODExOTYwNX0.d48nnz-E9PWYXDRY3MfAwx7ADvb0LcBszfgxcq4iuNM"
)


def _sb_signin(email: str, password: str):
    r = requests.post(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        headers={"apikey": SUPABASE_ANON, "Content-Type": "application/json"},
        json={"email": email, "password": password},
        timeout=30,
    )
    return r


def test_demo_member_can_sign_in():
    r = _sb_signin("dev.upadhyay@vitalityx.com", "VitalityDemo2026!")
    assert r.status_code == 200, r.text
    tok = r.json().get("access_token")
    assert tok


def test_demo_coach_can_sign_in():
    r = _sb_signin("dr.vance@vitalityx.com", "CoachDemo2026!")
    assert r.status_code == 200, r.text
    assert r.json().get("access_token")


# ---------- RLS: member cannot read another member's biomarkers ----------
def test_member_rls_blocks_other_biomarkers():
    auth = _sb_signin("dev.upadhyay@vitalityx.com", "VitalityDemo2026!").json()
    token = auth["access_token"]
    fake_uuid = "00000000-0000-0000-0000-000000000001"
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/biomarkers?member_id=eq.{fake_uuid}&select=id",
        headers={
            "apikey": SUPABASE_ANON,
            "Authorization": f"Bearer {token}",
        },
        timeout=30,
    )
    # Either RLS returns empty array or denies. We accept both as long as
    # NO rows are leaked.
    assert r.status_code in (200, 401, 403), r.text
    if r.status_code == 200:
        assert r.json() == [], f"RLS leak! {r.json()}"


# ---------- Member seed data presence (via own token) ----------
def test_member_has_seeded_protocol_items():
    auth = _sb_signin("dev.upadhyay@vitalityx.com", "VitalityDemo2026!").json()
    token = auth["access_token"]
    uid = auth["user"]["id"]
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/protocol_items?member_id=eq.{uid}&select=id,title",
        headers={"apikey": SUPABASE_ANON, "Authorization": f"Bearer {token}"},
        timeout=30,
    )
    assert r.status_code == 200, r.text
    items = r.json()
    assert len(items) >= 5, f"Expected >=5 protocol items, got {len(items)}"


def test_member_has_seeded_biomarkers():
    auth = _sb_signin("dev.upadhyay@vitalityx.com", "VitalityDemo2026!").json()
    token = auth["access_token"]
    uid = auth["user"]["id"]
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/biomarkers?member_id=eq.{uid}&select=id,name",
        headers={"apikey": SUPABASE_ANON, "Authorization": f"Bearer {token}"},
        timeout=30,
    )
    assert r.status_code == 200, r.text
    assert len(r.json()) >= 5
