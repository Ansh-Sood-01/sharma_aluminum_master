import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { getSiteUrl } from "@/lib/env";

export const metadata: Metadata = {
  title: {
    default: "Sharma Aluminium Master | Architectural Aluminium Work",
    template: "%s | Sharma Aluminium Master",
  },
  description:
    "Explore customized aluminium kitchens, doors, windows, cupboards, glass installations and premium interior work by Sharma Aluminium Master in Jalandhar, Punjab.",
  applicationName: "Sharma Aluminium Master",
  metadataBase: getSiteUrl(),
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
  openGraph: {
    type: "website",
    siteName: "Sharma Aluminium Master",
    title: "Sharma Aluminium Master | Architectural Aluminium & Interiors",
    description: "Explore aluminium kitchens, doors, windows, glass installations and premium interior work in Jalandhar, Punjab.",
  },
  robots: {
    index: process.env.NODE_ENV === "production",
    follow: process.env.NODE_ENV === "production",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
  themeColor: "#FAFAF8",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
