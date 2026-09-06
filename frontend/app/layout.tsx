import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "White-Collar | Career & Academic English Care",
  description:
    "Bangladesh's premier English coaching centre for career and academic excellence.",
  keywords: "English coaching Bangladesh, IELTS preparation, corporate English, Chattogram",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ivory text-charcoal antialiased">{children}</body>
    </html>
  );
}
