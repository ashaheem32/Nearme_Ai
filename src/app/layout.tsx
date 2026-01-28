import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporterClient from "@/components/ErrorReporterClient";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";

// Patch for broken localStorage in some environments (e.g. server-side with certain polyfills)
if (typeof global !== 'undefined' && (global as any).localStorage && typeof (global as any).localStorage.getItem !== 'function') {
  try {
    console.warn('Detected broken localStorage polyfill, removing it.');
    delete (global as any).localStorage;
  } catch (e) {
    console.error('Failed to remove broken localStorage:', e);
  }
}

export const metadata: Metadata = {
  title: "NearMe - Discover Places Near You",
  description: "Find and book amazing places near you with NearMe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorReporterClient />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        {children}
        <Toaster />
        <VisualEditsMessenger />
      </body>
    </html>
  );
}