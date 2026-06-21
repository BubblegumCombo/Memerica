import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Anton } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { RoleToggle } from "@/components/RoleToggle";
import { InstallPrompt } from "@/components/InstallPrompt";
import { StoreProvider } from "@/lib/data/store";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3001");

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Memerica — Freedom of the Feed",
  description:
    "A tagged meme-sharing app for one shared space. The admin curates the feed; you swipe, react, and run the thread.",
  applicationName: "Memerica",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Memerica",
  },
  openGraph: {
    title: "Memerica — Freedom of the Feed",
    description: "A tagged meme-sharing space — swipe, react, and run the thread.",
    siteName: "Memerica",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Memerica — Freedom of the Feed",
    description: "A tagged meme-sharing space — swipe, react, and run the thread.",
  },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-app text-ink">
        <StoreProvider>
          {children}
          <RoleToggle />
        </StoreProvider>
        <InstallPrompt />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
