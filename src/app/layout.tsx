import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tapresente - Plataforma de Gift Cards",
  description: "Plataforma whitelabel para venda de gift cards",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://tapresente.com"),
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    title: "Tapresente - Plataforma de Gift Cards",
    description: "Plataforma whitelabel para venda de gift cards",
    url: "/",
    siteName: "Tapresente",
    images: [
      {
        url: "/images/bannerNottransparent.png",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tapresente - Plataforma de Gift Cards",
    description: "Plataforma whitelabel para venda de gift cards",
    images: ["/images/bannerNottransparent.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
