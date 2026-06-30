# VitalityX Demo Setup Guide

This guide explains how to instantly populate your VitalityX platform with realistic demo data, enabling you to showcase all major features of the PRD without manual data entry.

## 👥 Demo Accounts

The seeding script automatically creates and manages two persistent demo accounts:

### 1. Member Account
- **Email:** `demo.member@vitalityx.ai`
- **Password:** `Demo@12345`
- **Role:** Active Member (Premium Plan)

### 2. Staff Account
- **Email:** `demo.staff@vitalityx.ai`
- **Password:** `Demo@12345`
- **Role:** Coach / Admin

---

## 🚀 Running the Seeder

The seeder is a completely idempotent Node.js script. It uses deterministic UUIDs and Supabase `upsert` functionality, meaning you can safely run it multiple times without duplicating any data. It will intelligently create missing users or update existing ones while leaving production users completely untouched.

### Execution Command

Run the script from the root of your `frontend` directory. Node.js v20+ supports the native `--env-file` flag to securely load your Supabase service role key.

```bash
node --env-file=.env.local scripts/seed-demo.js
```

*Note: Ensure your `.env.local` contains valid `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` variables.*

---

## 🔄 Resetting Demo Data

Because the seeder is idempotent and updates existing records in place, "resetting" the data is as simple as running the script again. 

If you want to perform a **hard reset** (deleting the users entirely), you can do so from your Supabase Dashboard:
1. Go to **Authentication > Users**.
2. Delete `demo.member@vitalityx.ai` and `demo.staff@vitalityx.ai`.
3. Re-run `node --env-file=.env.local scripts/seed-demo.js` to recreate everything from scratch.

---

## ✨ Features Covered & Suggested Demo Flow

Once seeded, you can immediately showcase the following PRD features without encountering any empty states:

### 1. Staff Operations & Dashboard
- Log in as `demo.staff@vitalityx.ai`.
- **Showcase:** The Staff Dashboard will display active Care Team assignments, upcoming check-ins, and audit logs proving the staff member has active oversight of the demo member.

### 2. Member Portal & Biological Age
- Log in as `demo.member@vitalityx.ai`.
- **Showcase:** The Member Dashboard will immediately render historical biological age charts (showing a chronological age of 42, but a dropping biological age of 37).

### 3. Document Management
- **Showcase:** Navigate to the Documents tab. Realistic PDF entries ("Initial Intake Form" and "Lab Results - Q1") are pre-loaded.

### 4. Booking & Appointments
- **Showcase:** Navigate to the Appointments tab. You will see historical completed onboarding sessions and upcoming scheduled check-ins with pre-generated Google Meet links.

### 5. Notifications & Audit Logs
- **Showcase:** Click the notification bell to see unread alerts (e.g., "New Lab Results"). 
- **Showcase:** The backend has already captured Consent Records and Login Audit logs verifying HIPAA-compliant activity tracking.
