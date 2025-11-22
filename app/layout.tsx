import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PawAlert - Encuentra Mascotas Perdidas",
  description: "Alertas hiperlocales de mascotas perdidas. Conecta con tu vecindario para reunir mascotas con sus familias. Reporta, busca y encuentra mascotas perdidas en tu zona.",
  applicationName: "PawAlert",
  keywords: ["mascota perdida", "perro perdido", "gato perdido", "encontrar mascota", "alerta mascota", "vecindario", "comunidad"],
  openGraph: {
    title: "PawAlert - Encuentra Mascotas Perdidas",
    description: "Alertas hiperlocales de mascotas perdidas. Ayuda a reunir mascotas con sus familias.",
    url: "https://pawale rt.app",
    siteName: "PawAlert",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "PawAlert - Encuentra Mascotas Perdidas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PawAlert - Encuentra Mascotas Perdidas",
    description: "Alertas hiperlocales de mascotas perdidas. Ayuda a reunir mascotas con sus familias.",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen flex flex-col">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
