"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/cn";

interface PortfolioGalleryProps {
  title?: string;
  archiveButton?: {
    text: string;
    href: string;
  };
  images: Array<{
    src: string;
    alt: string;
    title?: string;
  }>;
  className?: string;
  maxHeight?: number;
  spacing?: string;
  onImageClick?: (index: number) => void;
  /**
   * Pause l'animation marquee au survol (mobile uniquement)
   * @default true
   */
  pauseOnHover?: boolean;
  /**
   * Nombre de répétitions du contenu dans le marquee (mobile uniquement)
   * @default 4
   */
  marqueeRepeat?: number;
}

/**
 * Hero en galerie 3D (bureau) / défilement horizontal (mobile). Adapté
 * d'un composant externe : tokens shadcn (background/foreground/border)
 * remplacés par les nôtres (surface/on-surface/outline-variant), hauteur
 * réduite (l'original visait un hero plein écran de site vitrine, pas une
 * section dans une page de dashboard déjà encadrée par Sidebar/TopNav).
 */
export function PortfolioGallery({
  title = "Des visuels prêts pour votre marque",
  archiveButton = {
    text: "Voir toute la galerie",
    href: "#galerie",
  },
  images,
  className = "",
  maxHeight = 90,
  spacing = "-space-x-56 md:-space-x-64",
  onImageClick,
  pauseOnHover = true,
  marqueeRepeat = 4,
}: PortfolioGalleryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section aria-label={title} className={`relative px-4 py-10 ${className}`}>
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-surface-container-lowest">
        {/* En-tête */}
        <div className="relative z-10 px-8 pb-8 pt-12 text-center">
          <h2 className="mb-8 text-balance font-headline-lg text-3xl font-bold text-on-surface md:text-5xl">
            {title}
          </h2>

          <Link
            href={archiveButton.href}
            className="group mb-16 inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary/90"
          >
            <span>{archiveButton.text}</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Bureau : empilement 3D -- masqué sur mobile */}
        <div className="relative hidden h-[320px] overflow-hidden md:block -mb-[160px]">
          <div className={`flex ${spacing} items-end justify-center pb-8 pt-32`}>
            {images.map((image, index) => {
              const totalImages = images.length;
              const middle = Math.floor(totalImages / 2);
              const distanceFromMiddle = Math.abs(index - middle);
              const staggerOffset = maxHeight - distanceFromMiddle * 16;

              const zIndex = totalImages - index;
              const isHovered = hoveredIndex === index;
              const isOtherHovered = hoveredIndex !== null && hoveredIndex !== index;
              const yOffset = isHovered ? -90 : isOtherHovered ? 0 : -staggerOffset;

              return (
                <motion.div
                  key={index}
                  className="group flex-shrink-0 cursor-pointer"
                  style={{ zIndex }}
                  initial={{
                    transform: "perspective(5000px) rotateY(-45deg) translateY(150px)",
                    opacity: 0,
                  }}
                  animate={{
                    transform: `perspective(5000px) rotateY(-45deg) translateY(${yOffset}px)`,
                    opacity: 1,
                  }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.05,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  onHoverStart={() => setHoveredIndex(index)}
                  onHoverEnd={() => setHoveredIndex(null)}
                  onClick={() => onImageClick?.(index)}
                >
                  <div
                    className="relative aspect-video w-56 overflow-hidden rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105 md:w-72 lg:w-80"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="h-full w-full object-cover object-left-top"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile : défilement horizontal continu */}
        <div className="relative block pb-8 md:hidden">
          <div
            className={cn(
              "group flex flex-row overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]"
            )}
          >
            {Array(marqueeRepeat)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex shrink-0 flex-row justify-around animate-marquee [gap:var(--gap)]",
                    pauseOnHover && "group-hover:[animation-play-state:paused]"
                  )}
                >
                  {images.map((image, index) => (
                    <div
                      key={`${i}-${index}`}
                      className="group flex-shrink-0 cursor-pointer"
                      onClick={() => onImageClick?.(index)}
                    >
                      <div className="relative aspect-video w-56 overflow-hidden rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="h-full w-full object-cover object-left-top"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
