import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Classic Worlds -- Interactive Book Experiences",
  description:
    "Step inside the worlds of classic literature through immersive 3D scenes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
