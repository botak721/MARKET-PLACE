import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://market-place-roan-phi.vercel.app"),
  title: {
    default: "Rizki Online Shop",
    template: "%s | Rizki Online Shop",
  },
  description: "Marketplace barang dari toko-toko kecil",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${bricolage.variable} ${jakarta.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}