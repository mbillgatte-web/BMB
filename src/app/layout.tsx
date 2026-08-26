
import type { Metadata } from "next";
import {
  Inter,
  Playfair_Display,
  Montserrat,
  Open_Sans,
  Merriweather,
  Lato,
  Manrope
} from "next/font/google";


import "./globals.css";

// Chaque police est chargée UNE SEULE FOIS ici, optimisée et
// auto-hébergée par Next.js (pas de requête vers Google au runtime).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "900"],
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["600", "700"],
});
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
      className={`${inter.variable} ${playfair.variable} ${montserrat.variable} ${openSans.variable} ${merriweather.variable} ${lato.variable}`}
    >
      <head>
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
