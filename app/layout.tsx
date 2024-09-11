import type { Metadata } from "next";
import "./globals.css";
import { Press_Start_2P } from 'next/font/google'

const pressStart2P = Press_Start_2P({ weight: '400', subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Cursor Race",
  description: "A retro-style racing game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={pressStart2P.className}>
        {children}
      </body>
    </html>
  );
}
