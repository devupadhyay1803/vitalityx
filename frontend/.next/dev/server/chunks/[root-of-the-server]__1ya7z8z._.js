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
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[project]/lib/products.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Server-side product catalog (DO NOT trust client prices)
__turbopack_context__.s([
    "PRODUCTS",
    ()=>PRODUCTS
]);
const PRODUCTS = {
    "nmn-resveratrol": {
        id: "nmn-resveratrol",
        name: "VitalityX NMN + Resveratrol",
        description: "Cellular NAD+ booster promoting DNA repair, sirtuin activation, and mitochondrial function.",
        priceCents: 9500,
        recurring: true,
        image: "/assets/supplement_bottle.jpg",
        category: "Active Supplement",
        rating: 4.9,
        reviewCount: 128
    },
    "magnesium-l-threonate": {
        id: "magnesium-l-threonate",
        name: "Magnesium L-Threonate Stack",
        description: "Highly bioavailable magnesium engineered to cross the blood-brain barrier for cognitive health and deep sleep.",
        priceCents: 4500,
        recurring: true,
        image: "/assets/magnesium_bottle.jpg",
        category: "Active Supplement",
        rating: 4.8,
        reviewCount: 84
    },
    "dna-methylation-kit": {
        id: "dna-methylation-kit",
        name: "VitalityX DNA Methylation Kit",
        description: "Comprehensive genomic sequencing kit targeting longevity genes and biological age risk indicators.",
        priceCents: 29900,
        recurring: false,
        image: "/assets/dna_kit.jpg",
        category: "Diagnostic Assay",
        rating: 5.0,
        reviewCount: 312
    }
};
}),
"[project]/lib/supabase/server.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
;
;
async function createClient() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://pxrrhxgspipzodzzumig.supabase.co"), ("TURBOPACK compile-time value", "sb_publishable_pOCi1Bp8KQIhU7xnVwmHXQ_Ru2LMPLd") || ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4cnJoeGdzcGlwem9kenp1bWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDM2MDUsImV4cCI6MjA5ODExOTYwNX0.d48nnz-E9PWYXDRY3MfAwx7ADvb0LcBszfgxcq4iuNM"), {
        cookies: {
            getAll () {
                return cookieStore.getAll();
            },
            setAll (cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options })=>cookieStore.set(name, value, options));
                } catch  {
                // ignored in RSC
                }
            }
        }
    });
}
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
"[project]/app/api/stripe/checkout/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$stripe$2f$esm$2f$stripe$2e$esm$2e$node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/stripe/esm/stripe.esm.node.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$products$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/products.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/admin.ts [app-route] (ecmascript)");
;
;
;
;
;
async function POST(req) {
    try {
        const { items, origin } = await req.json();
        if (!Array.isArray(items) || items.length === 0) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "No items"
        }, {
            status: 400
        });
        const stripe = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$stripe$2f$esm$2f$stripe$2e$esm$2e$node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"](process.env.STRIPE_SECRET_KEY);
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        const { data: { user } } = await supabase.auth.getUser();
        // Build line_items from SERVER-SIDE catalog only
        const line_items = items.map((it)=>{
            const p = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$products$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PRODUCTS"][it.id];
            if (!p) return null;
            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: p.name,
                        description: p.description
                    },
                    unit_amount: p.priceCents,
                    ...p.recurring ? {
                        recurring: {
                            interval: "month"
                        }
                    } : {}
                },
                quantity: Math.max(1, Math.floor(it.quantity))
            };
        }).filter((x)=>x !== null);
        if (line_items.length === 0) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Invalid items"
        }, {
            status: 400
        });
        const hasRecurring = line_items.some((li)=>li.price_data.recurring);
        const baseOrigin = origin || ("TURBOPACK compile-time value", "https://52cef6a0-1c6b-4e2d-a0d7-036a7e2d1fb4.preview.emergentagent.com") || "";
        const session = await stripe.checkout.sessions.create({
            mode: hasRecurring ? "subscription" : "payment",
            line_items,
            success_url: `${baseOrigin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseOrigin}/cart`,
            customer_email: user?.email,
            metadata: {
                member_id: user?.id || "guest"
            },
            ...hasRecurring ? {} : {
                payment_method_types: [
                    "card"
                ]
            }
        });
        // Insert pending order
        const admin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAdminClient"])();
        await admin.from("orders").insert({
            member_id: user?.id || null,
            stripe_session_id: session.id,
            amount_total: line_items.reduce((s, li)=>s + li.price_data.unit_amount * li.quantity, 0),
            currency: "usd",
            status: "pending",
            items: line_items.map((li)=>({
                    name: li.price_data.product_data.name,
                    amount: li.price_data.unit_amount,
                    quantity: li.quantity,
                    recurring: !!li.price_data.recurring
                }))
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            url: session.url,
            session_id: session.id
        });
    } catch (e) {
        console.error("[checkout] error", e);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: e?.message || "Internal error"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1ya7z8z._.js.map