import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThirdwebProviderWrapper } from "@/components/providers/thirdweb-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FHE Academy",
  description: "4-Week FHEVM Developer Bootcamp by Zama",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThirdwebProviderWrapper>{children}</ThirdwebProviderWrapper>
      </body>
    </html>
  );
}
