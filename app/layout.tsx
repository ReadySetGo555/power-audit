import type { Metadata } from "next";
import { Cormorant_Garamond, Syne } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "600"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Power Audit — Attention Alignment",
  description: "Identify where your creative power is leaking across the six stages of the creation cycle.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Power Audit",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${syne.variable}`}>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
