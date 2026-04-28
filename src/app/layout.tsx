import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Svatební pozvánka",
  description: "Potvrzení účasti na svatbě",
  openGraph: {
    title: "Svatební pozvánka",
    description: "Potvrzení účasti na svatbě",
    type: "website",
    locale: "cs_CZ",
  },
  twitter: {
    card: "summary",
    title: "Svatební pozvánka",
    description: "Potvrzení účasti na svatbě",
  },
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
