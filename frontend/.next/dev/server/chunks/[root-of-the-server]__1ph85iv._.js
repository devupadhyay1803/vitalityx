module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/supabase/admin.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createAdminClient",
    ()=>createAdminClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
;
function createAdminClient() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://pxrrhxgspipzodzzumig.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    });
}
}),
"[project]/app/api/admin/bootstrap/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/admin.ts [app-route] (ecmascript)");
;
;
/**
 * One-time / idempotent bootstrap:
 *   1. Seed the two demo users (Member + Coach) in auth.users
 *   2. Assign roles in profiles
 *   3. Link member -> coach
 *   4. Seed a small amount of demo data (protocol items, biomarkers, lab result, sessions)
 *   5. Create the 'lab-pdfs' storage bucket
 *
 * Call: GET /api/admin/bootstrap?token=BOOTSTRAP_TOKEN
 */ const BOOTSTRAP_TOKEN = process.env.BOOTSTRAP_TOKEN || "vx-bootstrap-2026";
const DEMO_MEMBER_EMAIL = process.env.DEMO_MEMBER_EMAIL || "dev.upadhyay@vitalityx.com";
const DEMO_COACH_EMAIL = process.env.DEMO_COACH_EMAIL || "dr.vance@vitalityx.com";
const DEMO_MEMBER_PASSWORD = process.env.DEMO_MEMBER_PASSWORD || "VitalityDemo2026!";
const DEMO_COACH_PASSWORD = process.env.DEMO_COACH_PASSWORD || "CoachDemo2026!";
async function GET(req) {
    const token = req.nextUrl.searchParams.get("token");
    if (token !== BOOTSTRAP_TOKEN) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "Forbidden"
    }, {
        status: 403
    });
    const admin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAdminClient"])();
    const out = {
        steps: []
    };
    async function upsertUser(email, password, full_name, role) {
        // Try to find existing
        const { data: list } = await admin.auth.admin.listUsers();
        const existing = list?.users?.find((u)=>u.email === email);
        let userId;
        if (existing) {
            userId = existing.id;
            // Force password (so demo switcher works) and confirm email
            await admin.auth.admin.updateUserById(userId, {
                password,
                email_confirm: true,
                user_metadata: {
                    full_name,
                    role
                }
            });
            out.steps.push(`User exists: ${email} → password reset`);
        } else {
            const { data, error } = await admin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    full_name,
                    role
                }
            });
            if (error || !data.user) {
                out.steps.push(`FAILED create ${email}: ${error?.message}`);
                throw new Error(error?.message);
            }
            userId = data.user.id;
            out.steps.push(`User created: ${email}`);
        }
        // Ensure profile row & role
        await admin.from("profiles").upsert({
            id: userId,
            full_name,
            email,
            role
        }, {
            onConflict: "id"
        });
        return userId;
    }
    try {
        const memberId = await upsertUser(DEMO_MEMBER_EMAIL, DEMO_MEMBER_PASSWORD, "Dev Upadhyay", "Member");
        const coachId = await upsertUser(DEMO_COACH_EMAIL, DEMO_COACH_PASSWORD, "Dr. Sara Vance", "Coach");
        // Ensure client_record for member exists and assign coach
        await admin.from("client_records").upsert({
            member_id: memberId,
            assigned_coach_id: coachId,
            consented: true,
            consented_at: new Date().toISOString(),
            consent_version: "1.0"
        }, {
            onConflict: "member_id"
        });
        // Storage bucket for lab PDFs
        const buckets = await admin.storage.listBuckets();
        if (!buckets.data?.find((b)=>b.name === "lab-pdfs")) {
            await admin.storage.createBucket("lab-pdfs", {
                public: true
            });
            out.steps.push("Created storage bucket: lab-pdfs");
        } else {
            out.steps.push("Storage bucket exists: lab-pdfs");
        }
        // Seed protocol items if none
        const { count: itemCount } = await admin.from("protocol_items").select("*", {
            count: "exact",
            head: true
        }).eq("member_id", memberId);
        if (!itemCount) {
            await admin.from("protocol_items").insert([
                {
                    member_id: memberId,
                    title: "Zone 2 cardio 45 min",
                    why_text: "Mitochondrial biogenesis + improves VO₂ base. 3×/week target.",
                    created_by: coachId
                },
                {
                    member_id: memberId,
                    title: "Strength session 45 min",
                    why_text: "Maintain lean mass; key driver of metabolic health.",
                    created_by: coachId
                },
                {
                    member_id: memberId,
                    title: "Omega-3 2.4g (EPA+DHA)",
                    why_text: "Targets omega-3 index ≥ 8% — lowers cardiovascular and cognitive risk.",
                    created_by: coachId
                },
                {
                    member_id: memberId,
                    title: "Sleep window 22:30 – 06:30",
                    why_text: "Consistent 8h window stabilises HRV and glucose response.",
                    created_by: coachId
                },
                {
                    member_id: memberId,
                    title: "Sunlight 10 min within 1h of waking",
                    why_text: "Anchors circadian rhythm; improves sleep latency that night.",
                    created_by: coachId
                }
            ]);
            out.steps.push("Seeded 5 protocol items");
        }
        // Seed lab result + biomarkers
        const { count: labCount } = await admin.from("lab_results").select("*", {
            count: "exact",
            head: true
        }).eq("member_id", memberId);
        if (!labCount) {
            const { data: lab } = await admin.from("lab_results").insert({
                member_id: memberId,
                biological_age: 38.6,
                tested_at: "2026-01-05",
                uploaded_by: coachId
            }).select().single();
            await admin.from("lab_results").insert([
                {
                    member_id: memberId,
                    biological_age: 41.2,
                    tested_at: "2025-10-01",
                    uploaded_by: coachId
                },
                {
                    member_id: memberId,
                    biological_age: 42.5,
                    tested_at: "2025-07-01",
                    uploaded_by: coachId
                }
            ]);
            await admin.from("biomarkers").insert([
                {
                    member_id: memberId,
                    lab_result_id: lab?.id,
                    name: "ApoB",
                    value: 76,
                    unit: "mg/dL",
                    target_min: 50,
                    target_max: 80,
                    status: "optimal",
                    tested_at: "2026-01-05"
                },
                {
                    member_id: memberId,
                    lab_result_id: lab?.id,
                    name: "hs-CRP",
                    value: 0.7,
                    unit: "mg/L",
                    target_min: 0,
                    target_max: 1,
                    status: "optimal",
                    tested_at: "2026-01-05"
                },
                {
                    member_id: memberId,
                    lab_result_id: lab?.id,
                    name: "Fasting glucose",
                    value: 96,
                    unit: "mg/dL",
                    target_min: 70,
                    target_max: 90,
                    status: "borderline",
                    tested_at: "2026-01-05"
                },
                {
                    member_id: memberId,
                    lab_result_id: lab?.id,
                    name: "HbA1c",
                    value: 5.3,
                    unit: "%",
                    target_min: 4.5,
                    target_max: 5.5,
                    status: "optimal",
                    tested_at: "2026-01-05"
                },
                {
                    member_id: memberId,
                    lab_result_id: lab?.id,
                    name: "Vitamin D 25-OH",
                    value: 38,
                    unit: "ng/mL",
                    target_min: 40,
                    target_max: 60,
                    status: "borderline",
                    tested_at: "2026-01-05"
                }
            ]);
            out.steps.push("Seeded lab result + 5 biomarkers + 3 historical bio-age points");
        }
        // Seed upcoming session
        const { count: sessCount } = await admin.from("sessions").select("*", {
            count: "exact",
            head: true
        }).eq("member_id", memberId);
        if (!sessCount) {
            const next = new Date();
            next.setDate(next.getDate() + 4);
            next.setHours(15, 0, 0, 0);
            await admin.from("sessions").insert({
                member_id: memberId,
                coach_id: coachId,
                scheduled_at: next.toISOString(),
                status: "upcoming"
            });
            out.steps.push("Seeded upcoming session");
        }
        // Seed a couple of messages
        const { count: msgCount } = await admin.from("messages").select("*", {
            count: "exact",
            head: true
        }).or(`and(sender_id.eq.${memberId},receiver_id.eq.${coachId}),and(sender_id.eq.${coachId},receiver_id.eq.${memberId})`);
        if (!msgCount) {
            await admin.from("messages").insert([
                {
                    sender_id: coachId,
                    receiver_id: memberId,
                    content: "Welcome to VitalityX! Your intake looks great. Reviewing your labs now and will publish v1 of the protocol today."
                },
                {
                    sender_id: memberId,
                    receiver_id: coachId,
                    content: "Thanks Dr. Vance — looking forward to it. Glucose has crept up a little since last quarter, curious what you suggest."
                }
            ]);
            out.steps.push("Seeded 2 demo messages");
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true,
            memberId,
            coachId,
            ...out
        });
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: e?.message,
            ...out
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1ph85iv._.js.map