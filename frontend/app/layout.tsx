import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/components/cart/cart-provider";
import "./globals.css";

const montserrat = Montserrat({
 subsets: ["latin"],
 variable: "--font-sans",
 display: "swap",
});

export const metadata: Metadata = {
 title: "VitalityX — Precision Longevity Health",
 description:
 "Personalized biomarker-driven longevity coaching. Less guesswork, more biological years.",
};

export default function RootLayout({
 children,
}: Readonly<{ children: React.ReactNode }>) {
 return (
 <html lang="en" suppressHydrationWarning>
 <body className={`${montserrat.variable} font-sans antialiased`}>
 <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
 <CartProvider>
 {children}
 <Toaster position="top-center" richColors closeButton />
 </CartProvider>
 </ThemeProvider>
 </body>
 </html>
 );
}
