import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Türkan Abla",
  description: "Platform for connecting service providers and customers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
