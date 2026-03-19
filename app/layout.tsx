import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nova Roma",
  description: "Streetwear pernambucano",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
