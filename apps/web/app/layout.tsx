import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "12th Cauldron",
  description: "Build wealth together through trusted circles.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
