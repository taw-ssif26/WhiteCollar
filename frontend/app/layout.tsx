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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-ivory text-charcoal antialiased">{children}</body>
    </html>
  );
}
