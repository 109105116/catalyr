import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config";
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import React from "react";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? siteConfig.url),
};

export default function RootLayout({
  authModal,
  children,
}: Readonly<{
  authModal: React.ReactNode;
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="min-h-screen overflow-y-scroll"
      suppressHydrationWarning
    >
      <head />
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
      />
      <Script id="google-analytics">
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}');
          `}
      </Script>

      <body
        className={cn(
          "h-full bg-background text-foreground antialiased",
          inter.className
        )}
      >
        <Providers>
          {authModal}
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
