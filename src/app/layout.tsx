
import type { Metadata } from "next";
import {
  Geist,
  Inter,
  Montserrat,
  Open_Sans,
  Merriweather,
  Lato,
  Manrope
} from "next/font/google";


import "./globals.css";

// Chaque police est chargée UNE SEULE FOIS ici, optimisée et
// auto-hébergée par Next.js (pas de requête vers Google au runtime).

// Police de l'INTERFACE de la plateforme (voir fontFamily dans
// tailwind.config.ts). Les autres polices ci-dessous servent aux choix de
// typographie des entreprises (voir police.tsx), pas à l'interface.
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "900"],
});
// Playfair Display n'est PAS chargée par next/font : sur Vercel, le
// téléchargement de ses fichiers pendant le build a fait échouer Turbopack
// (« next/font/google queries have exactly one entry »). Elle passe par la
// feuille de style Google dans <head>, comme Material Symbols, et la
// variable --font-family-playfair la nomme directement (globals.css).
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["600", "700"],
});
const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  weight: ["400", "500"],
});
const merriweather = Merriweather({
  subsets: ["latin"],
  variable: "--font-merriweather",
  weight: ["600", "700"],
});
const lato = Lato({
  subsets: ["latin"],
  variable: "--font-lato",
  weight: ["300", "400"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Build My Business",
  description: "Créez l'identité visuelle de votre entreprise.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geist.variable} ${inter.variable} ${montserrat.variable} ${openSans.variable} ${merriweather.variable} ${lato.variable} ${manrope.variable}`}
    >
      <head>
        {/* Playfair Display : aperçu de la page Typographie (voir le commentaire plus haut) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap"
          rel="stylesheet"
        />
        {/* Material Symbols n'a pas d'équivalent next/font officiel */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
