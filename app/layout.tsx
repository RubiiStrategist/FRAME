import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FRAME — Seu próximo frame | Marketing & Eventos",
  description: "Estratégia e campanhas para sua marca. Fotografia, filmes e cobertura para seu evento. O próximo frame pode ser seu.",
  openGraph: {title:"FRAME — Seu próximo frame | Marketing & Eventos",description:"O próximo frame pode ser seu. Marcas, campanhas, eventos e coberturas.",locale:"pt_BR",type:"website"},
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
