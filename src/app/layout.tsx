import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Trustscorer - Content Transparenz-Zertifizierung",
    template: "%s | Trustscorer",
  },
  description:
    "Dokumentiere deinen Content-Erstellungsprozess transparent und baue Vertrauen bei deinen Lesern auf.",
  keywords: [
    "Content-Zertifizierung",
    "Transparenz",
    "Trust Badge",
    "KI-Content",
    "Publisher",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
