import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AssetFlow | Enterprise Asset Management",
  description: "Enterprise Asset & Resource Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex h-screen overflow-hidden bg-background text-foreground">
        <Providers attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
