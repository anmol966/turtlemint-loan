import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Turtlemint Personal Loan — Compare & Apply",
  description:
    "Compare personal loan offers from 6+ RBI-licensed lenders in 60 seconds. No impact on your CIBIL score. Powered by Turtlemint.",
  keywords: ["personal loan", "loan comparison", "CIBIL score", "EMI calculator", "Turtlemint"],
  openGraph: {
    title: "Turtlemint Personal Loan — Compare & Apply",
    description: "Find the best personal loan offer for your profile. 100% digital, soft inquiry only.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--tm-paper)]">{children}</body>
    </html>
  );
}
