"""VitalityX regression + new-feature tests (iteration 2)."""
import uuid
import datetime as dt

import pytest
import requests

BASE_URL = "https://health-platform-dev-2.preview.emergentagent.com"
SUPABASE_URL = "https://pxrrhxgspipzodzzumig.supabase.co"
SUPABASE_ANON = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4cnJoeGdzcGlwem9kenp1bWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDM2MDUsImV4cCI6MjA5ODExOTYwNX0.d48nnz-E9PWYXDRY3MfAwx7ADvb0LcBszfgxcq4iuNM"
)
MEMBER_EMAIL = "dev.upadhyay@vitalityx.com"
MEMBER_PASS = "VitalityDemo2026!"
COACH_EMAIL = "dr.vance@vitalityx.com"
COACH_PASS = "CoachDemo2026!"
COACH_UID = "15b86825-0c79-4869-a81d-fd2595f4a9aa"


def _signin(email, password):
    r = requests.post(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        headers={"apikey": SUPABASE_ANON, "Content-Type": "application/json"},
        json={"email": email, "password": password},
        timeout=30,
    )
    assert r.status_code == 200, r.text
    return r.json()


@pytest.fixture(scope="session")
def member_auth():
    return _signin(MEMBER_EMAIL, MEMBER_PASS)


@pytest.fixture(scope="session")
def coach_auth():
    return _signin(COACH_EMAIL, COACH_PASS)


def _hdrs(token):
    return {
        "apikey": SUPABASE_ANON,
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


# REGRESSION-1: profiles RLS recursion fixed
class TestRegressionProfilesRLS:
    def test_member_own_profile(self, member_auth):
        uid = member_auth["user"]["id"]
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/profiles?select=role&id=eq.{uid}",
            headers={"apikey": SUPABASE_ANON, "Authorization": f"Bearer {member_auth['access_token']}"},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        assert r.json()[0]["role"] == "Member"

    def test_coach_own_profile(self, coach_auth):
        uid = coach_auth["user"]["id"]
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/profiles?select=role,full_name&id=eq.{uid}",
            headers={"apikey": SUPABASE_ANON, "Authorization": f"Bearer {coach_auth['access_token']}"},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        assert r.json()[0]["role"] == "Coach"
        assert "Vance" in r.json()[0]["full_name"]

    def test_coach_lists_profiles(self, coach_auth):
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/profiles?select=id,role,full_name",
            headers={"apikey": SUPABASE_ANON, "Authorization": f"Bearer {coach_auth['access_token']}"},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        assert len(r.json()) >= 2


# REGRESSION/NEW-8: Stripe checkout
class TestStripeCheckout:
    def test_returns_checkout_url(self):
        r = requests.post(
            f"{BASE_URL}/api/stripe/checkout",
            json={"items": [{"id": "omega-3-concentrate", "quantity": 1}], "origin": BASE_URL},
            timeout=60,
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["url"].startswith("https://checkout.stripe.com")
        assert d["session_id"].startswith("cs_")

    def test_rejects_empty(self):
        r = requests.post(f"{BASE_URL}/api/stripe/checkout", json={"items": [], "origin": BASE_URL}, timeout=30)
        assert r.status_code == 400


# NEW-2: sessions
class TestSessions:
    def test_member_inserts_session(self, member_auth):
        uid = member_auth["user"]["id"]
        future = (dt.datetime.utcnow() + dt.timedelta(days=7)).isoformat() + "Z"
        r = requests.post(
            f"{SUPABASE_URL}/rest/v1/sessions",
            headers=_hdrs(member_auth["access_token"]),
            json=[{"member_id": uid, "coach_id": COACH_UID,
                   "scheduled_at": future, "status": "upcoming", "notes": "TEST_session"}],
            timeout=30,
        )
        assert r.status_code in (200, 201), r.text
        row = r.json()[0]
        assert row["status"] == "upcoming"
        requests.delete(f"{SUPABASE_URL}/rest/v1/sessions?id=eq.{row['id']}",
                        headers=_hdrs(member_auth["access_token"]), timeout=30)


# NEW-3: daily_checkins
class TestCheckin:
    def test_member_inserts_checkin(self, member_auth):
        uid = member_auth["user"]["id"]
        r = requests.post(
            f"{SUPABASE_URL}/rest/v1/daily_checkins",
            headers=_hdrs(member_auth["access_token"]),
            json=[{"member_id": uid, "sleep_score": 8, "energy_score": 7, "mood_score": 7}],
            timeout=30,
        )
        assert r.status_code in (200, 201), r.text
        row = r.json()[0]
        requests.delete(f"{SUPABASE_URL}/rest/v1/daily_checkins?id=eq.{row['id']}",
                        headers=_hdrs(member_auth["access_token"]), timeout=30)


# NEW-4: messages
class TestMessages:
    def test_member_sends_message(self, member_auth):
        uid = member_auth["user"]["id"]
        r = requests.post(
            f"{SUPABASE_URL}/rest/v1/messages",
            headers=_hdrs(member_auth["access_token"]),
            json=[{"sender_id": uid, "receiver_id": COACH_UID,
                   "content": f"TEST_msg_{uuid.uuid4().hex[:6]}"}],
            timeout=30,
        )
        assert r.status_code in (200, 201), r.text
        row = r.json()[0]
        assert row["content"].startswith("TEST_msg_")
        requests.delete(f"{SUPABASE_URL}/rest/v1/messages?id=eq.{row['id']}",
                        headers=_hdrs(member_auth["access_token"]), timeout=30)


# NEW-5: protocol_items by coach
class TestProtocolBuilder:
    def test_coach_inserts_protocol_item(self, coach_auth, member_auth):
        member_id = member_auth["user"]["id"]
        title = f"TEST_protocol_{uuid.uuid4().hex[:6]}"
        r = requests.post(
            f"{SUPABASE_URL}/rest/v1/protocol_items",
            headers=_hdrs(coach_auth["access_token"]),
            json=[{"member_id": member_id, "title": title,
                   "why_text": "TEST", "created_by": coach_auth["user"]["id"], "active": True}],
            timeout=30,
        )
        assert r.status_code in (200, 201), r.text
        row = r.json()[0]
        assert row["title"] == title
        # GET verifies persistence
        g = requests.get(
            f"{SUPABASE_URL}/rest/v1/protocol_items?id=eq.{row['id']}&select=title,why_text",
            headers=_hdrs(coach_auth["access_token"]), timeout=30,
        )
        assert g.status_code == 200 and g.json()[0]["title"] == title
        requests.delete(f"{SUPABASE_URL}/rest/v1/protocol_items?id=eq.{row['id']}",
                        headers=_hdrs(coach_auth["access_token"]), timeout=30)


# NEW-6: lab_results + biomarkers metadata
class TestLabs:
    def test_coach_inserts_lab_and_biomarker(self, coach_auth, member_auth):
        member_id = member_auth["user"]["id"]
        r = requests.post(
            f"{SUPABASE_URL}/rest/v1/lab_results",
            headers=_hdrs(coach_auth["access_token"]),
            json=[{"member_id": member_id, "biological_age": 38.4,
                   "tested_at": dt.date.today().isoformat(),
                   "uploaded_by": coach_auth["user"]["id"]}],
            timeout=30,
        )
        assert r.status_code in (200, 201), r.text
        lab_id = r.json()[0]["id"]
        rb = requests.post(
            f"{SUPABASE_URL}/rest/v1/biomarkers",
            headers=_hdrs(coach_auth["access_token"]),
            json=[{"member_id": member_id, "lab_result_id": lab_id,
                   "name": f"TEST_marker_{uuid.uuid4().hex[:4]}",
                   "value": 1.23, "unit": "mg/L", "status": "optimal",
                   "tested_at": dt.date.today().isoformat()}],
            timeout=30,
        )
        assert rb.status_code in (200, 201), rb.text
        bio_id = rb.json()[0]["id"]
        requests.delete(f"{SUPABASE_URL}/rest/v1/biomarkers?id=eq.{bio_id}",
                        headers=_hdrs(coach_auth["access_token"]), timeout=30)
        requests.delete(f"{SUPABASE_URL}/rest/v1/lab_results?id=eq.{lab_id}",
                        headers=_hdrs(coach_auth["access_token"]), timeout=30)


# NEW-7: staff_access_logs — writes happen server-side via service role inside
# /app/frontend/app/staff/clients/[id]/page.tsx (uses `admin` Supabase client).
# Direct user-level inserts MUST be denied by RLS (security expectation).
class TestStaffAccessLogs:
    def test_direct_coach_insert_denied_by_rls(self, coach_auth, member_auth):
        """Verify RLS blocks direct user-token writes to staff_access_logs."""
        member_id = member_auth["user"]["id"]
        r = requests.post(
            f"{SUPABASE_URL}/rest/v1/staff_access_logs",
            headers=_hdrs(coach_auth["access_token"]),
            json=[{"staff_id": coach_auth["user"]["id"], "member_id": member_id,
                   "resource_type": "client_overview"}],
            timeout=30,
        )
        # 401/403 expected — table is service-role-write-only by design
        assert r.status_code in (401, 403), f"Expected RLS denial, got {r.status_code} {r.text}"


# NEW-10: protocol_completions
class TestProtocolCompletions:
    def test_member_toggles_completion(self, member_auth):
        uid = member_auth["user"]["id"]
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/protocol_items?member_id=eq.{uid}&select=id&limit=1",
            headers={"apikey": SUPABASE_ANON, "Authorization": f"Bearer {member_auth['access_token']}"},
            timeout=30,
        )
        items = r.json()
        if not items:
            pytest.skip("no protocol_items seeded")
        pid = items[0]["id"]
        ri = requests.post(
            f"{SUPABASE_URL}/rest/v1/protocol_completions",
            headers=_hdrs(member_auth["access_token"]),
            json=[{"member_id": uid, "item_id": pid}],
            timeout=30,
        )
        assert ri.status_code in (200, 201), ri.text
        row_id = ri.json()[0]["id"]
        requests.delete(f"{SUPABASE_URL}/rest/v1/protocol_completions?id=eq.{row_id}",
                        headers=_hdrs(member_auth["access_token"]), timeout=30)


# NEW-9: legal pages
@pytest.mark.parametrize("path", ["/terms", "/privacy", "/gina", "/help", "/forgot-password"])
def test_legal_pages_load(path):
    r = requests.get(f"{BASE_URL}{path}", timeout=60)
    assert r.status_code == 200
    assert "<html" in r.text.lower()


# Sanity: signup endpoint reachable
def test_signup_endpoint_reachable():
    r = requests.post(
        f"{SUPABASE_URL}/auth/v1/signup",
        headers={"apikey": SUPABASE_ANON, "Content-Type": "application/json"},
        json={"email": MEMBER_EMAIL, "password": "AnyPass1234!"},
        timeout=30,
    )
    assert r.status_code < 500, r.text
