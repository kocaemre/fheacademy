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
  title: {
    default: "FHE Academy",
    template: "%s | FHE Academy",
  },
  description:
    "A 4-week interactive bootcamp teaching Web3 developers to build confidential smart contracts with Zama's FHEVM. 20 lessons, 4 assignments, hands-on Hardhat projects.",
  keywords: [
    "FHE",
    "FHEVM",
    "Zama",
    "fully homomorphic encryption",
    "confidential smart contracts",
    "Solidity",
    "blockchain privacy",
    "Web3 bootcamp",
  ],
  authors: [{ name: "FHE Academy" }],
  openGraph: {
    title: "FHE Academy — Learn to Build Confidential Smart Contracts",
    description:
      "4-week FHEVM developer bootcamp by Zama. 20 lessons, interactive quizzes, AI-powered grading, and Hardhat starter projects.",
    url: "https://fheacademy.vercel.app",
    siteName: "FHE Academy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FHE Academy — Learn to Build Confidential Smart Contracts",
    description:
      "4-week FHEVM developer bootcamp. Master encrypted types, ACL, and confidential DeFi patterns.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
