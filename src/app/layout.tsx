import type { Metadata } from "next";
import { Inter, Space_Mono, Cormorant_Garamond } from "next/font/google";
import NoiseOverlay from "@/components/NoiseOverlay";
import Vignette from "@/components/Vignette";
import MemoryBackground from "@/components/MemoryBackground";
import PageTransition from "@/components/PageTransition";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "404: LOST MEMORIES",
  description: "An atmospheric interactive experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${spaceMono.variable} ${cormorant.variable} min-h-screen w-full bg-black text-[#a0a0a0] selection:bg-white/10 selection:text-white overflow-x-hidden`}
      >
        <AuthProvider>
          <NoiseOverlay />
          <Vignette />
          <MemoryBackground />
          <div className="relative w-full flex flex-col items-center z-10">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
