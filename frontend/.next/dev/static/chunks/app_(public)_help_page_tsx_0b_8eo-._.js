(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/(public)/help/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HelpPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.mjs [app-client] (ecmascript) <export default as ChevronDown>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const FAQ = [
    {
        q: "What is VitalityX?",
        a: "VitalityX is a precision longevity program. We pair quarterly biomarker testing, genetic context, and one assigned human coach to lower your biological age."
    },
    {
        q: "Is this medical care?",
        a: "No. VitalityX is not a medical service. We provide lifestyle, nutrition, sleep and supplement guidance. We do not diagnose disease or prescribe medication. Always consult your physician."
    },
    {
        q: "How much does it cost?",
        a: "The platform fee is $149/month, which includes coaching, your member portal, and quarterly lab review. Labs and supplements are billed separately at cost-plus."
    },
    {
        q: "Who is my coach?",
        a: "Each member is assigned a single coach — a credentialed health professional (RD, RN, ATC, or PhD-level) — who builds your protocol with you and reviews it every six weeks."
    },
    {
        q: "Where does my data live?",
        a: "Encrypted on Supabase Postgres in the United States, behind row-level security and a service we audit. Genetic data is additionally GINA-protected."
    },
    {
        q: "Can I cancel anytime?",
        a: "Yes. Pause or cancel from your portal under Supplements or Settings. Cancellation takes effect at the end of the current billing cycle."
    },
    {
        q: "Do I have to upload my DNA?",
        a: "No — genetic upload is optional. The protocol works on biomarkers alone. If you do upload, GINA protections apply automatically."
    },
    {
        q: "What if I have a question between sessions?",
        a: "Use the in-portal Messages tab. Coaches respond within one business day. Urgent medical concerns should go to your physician, not your coach."
    }
];
function HelpPage() {
    _s();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
        "data-testid": "legal-help",
        className: "mx-auto max-w-3xl px-6 py-16",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs uppercase tracking-widest text-muted-foreground",
                children: "Help"
            }, void 0, false, {
                fileName: "[project]/app/(public)/help/page.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "mt-2 font-display text-5xl font-medium tracking-tight",
                children: "Frequently asked"
            }, void 0, false, {
                fileName: "[project]/app/(public)/help/page.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-3 text-muted-foreground",
                children: [
                    "Don't see your question? Email ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "mailto:hi@vitalityx.com",
                        className: "underline",
                        children: "hi@vitalityx.com"
                    }, void 0, false, {
                        fileName: "[project]/app/(public)/help/page.tsx",
                        lineNumber: 23,
                        columnNumber: 85
                    }, this),
                    "."
                ]
            }, void 0, true, {
                fileName: "[project]/app/(public)/help/page.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-10 divide-y divide-border rounded-xl border border-border bg-card",
                children: FAQ.map((item, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        "data-testid": `faq-item-${i}`,
                        onClick: ()=>setOpen(open === i ? null : i),
                        className: "w-full text-left",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between px-5 py-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-display text-lg",
                                        children: item.q
                                    }, void 0, false, {
                                        fileName: "[project]/app/(public)/help/page.tsx",
                                        lineNumber: 34,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                        size: 16,
                                        className: `transition ${open === i ? "rotate-180" : ""}`
                                    }, void 0, false, {
                                        fileName: "[project]/app/(public)/help/page.tsx",
                                        lineNumber: 35,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(public)/help/page.tsx",
                                lineNumber: 33,
                                columnNumber: 13
                            }, this),
                            open === i && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "px-5 pb-5 text-sm text-muted-foreground",
                                children: item.a
                            }, void 0, false, {
                                fileName: "[project]/app/(public)/help/page.tsx",
                                lineNumber: 37,
                                columnNumber: 28
                            }, this)
                        ]
                    }, i, true, {
                        fileName: "[project]/app/(public)/help/page.tsx",
                        lineNumber: 27,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/(public)/help/page.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(public)/help/page.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
_s(HelpPage, "kwOYwiAlGcf16u2JaFl+OYF7OQ8=");
_c = HelpPage;
var _c;
__turbopack_context__.k.register(_c, "HelpPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_%28public%29_help_page_tsx_0b_8eo-._.js.map