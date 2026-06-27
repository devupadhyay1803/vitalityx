(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/cart/cart-provider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CartProvider",
    ()=>CartProvider,
    "useCart",
    ()=>useCart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
const Ctx = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function CartProvider({ children }) {
    _s();
    const [items, setItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CartProvider.useEffect": ()=>{
            const raw = ("TURBOPACK compile-time truthy", 1) ? localStorage.getItem("vx_cart") : "TURBOPACK unreachable";
            if (raw) {
                try {
                    setItems(JSON.parse(raw));
                } catch  {}
            }
        }
    }["CartProvider.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CartProvider.useEffect": ()=>{
            if ("TURBOPACK compile-time truthy", 1) {
                localStorage.setItem("vx_cart", JSON.stringify(items));
            }
        }
    }["CartProvider.useEffect"], [
        items
    ]);
    const value = {
        items,
        add: (item, qty = 1)=>setItems((prev)=>{
                const idx = prev.findIndex((i)=>i.id === item.id);
                if (idx >= 0) {
                    const copy = [
                        ...prev
                    ];
                    copy[idx] = {
                        ...copy[idx],
                        quantity: copy[idx].quantity + qty
                    };
                    return copy;
                }
                return [
                    ...prev,
                    {
                        ...item,
                        quantity: qty
                    }
                ];
            }),
        remove: (id)=>setItems((prev)=>prev.filter((i)=>i.id !== id)),
        setQty: (id, qty)=>setItems((prev)=>prev.map((i)=>i.id === id ? {
                        ...i,
                        quantity: Math.max(1, qty)
                    } : i)),
        clear: ()=>setItems([]),
        count: items.reduce((s, i)=>s + i.quantity, 0),
        subtotalCents: items.reduce((s, i)=>s + i.priceCents * i.quantity, 0)
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Ctx.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/components/cart/cart-provider.tsx",
        lineNumber: 61,
        columnNumber: 10
    }, this);
}
_s(CartProvider, "OFpe5t0oz9MFBJItuO7ZFbxuhyA=");
_c = CartProvider;
function useCart() {
    _s1();
    const c = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(Ctx);
    if (!c) throw new Error("useCart must be inside CartProvider");
    return c;
}
_s1(useCart, "rCFJOMMDYLWM7qBzTJAGkiO6eRA=");
var _c;
__turbopack_context__.k.register(_c, "CartProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=components_cart_cart-provider_tsx_11m031c._.js.map