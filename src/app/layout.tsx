import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Svatební RSVP",
  description: "Potvrzení účasti na svatbě",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
