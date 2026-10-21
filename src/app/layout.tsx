import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/lib/i18n";
import { ToastProvider } from "@/components/ui/toast";

const cairo = Cairo({
  variable: "--font-sans",
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Eco-Build | معمار البيئة",
  description: "Digitizing Construction & Demolition Waste Management for a Sustainable Future",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background font-sans">
        <LangProvider>
          <ToastProvider>{children}</ToastProvider>
        </LangProvider>
      </body>
    </html>
  );
}
