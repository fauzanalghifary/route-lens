import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RouteLens",
  description: "AI-generated scenes inspired by geography along your route."
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
