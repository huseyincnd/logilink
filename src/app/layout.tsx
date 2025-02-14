import { Inter } from "next/font/google";
import "./globals.css";
import ClientProvider from "@/app/client-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Lojistik Platformu",
  description: "Taşıyıcılar ve mal sahipleri için lojistik platformu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
