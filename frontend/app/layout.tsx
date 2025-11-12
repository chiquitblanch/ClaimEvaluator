import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Claim Evaluator - FHEVM Insurance Claim Processing",
  description: "Private insurance claim processing system using Zama FHEVM",
  keywords: ["FHEVM", "Zama", "Privacy", "Insurance", "Blockchain"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

