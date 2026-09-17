"use client";

import { useEffect, useRef } from "react";

// Fond animé de la "hero section" du dashboard -- le conteneur qui
// enveloppe la ligne de tuiles KPI dans DashboardView.tsx. Adapté du
// composant "FluidFlowGrid" fourni par l'utilisateur : même mécanique
// (grille de segments qui suivent un champ de vecteurs trigonométrique et
// réagissent à la souris), mais deux différences :
// - couleurs recalées sur la marque (fond blanc, lignes en indigo primary,
//   voir tailwind.config.ts) au lieu du bleu neutre sur fond sombre de la
//   démo d'origine ;
// - se redimensionne sur le CONTENEUR parent (ResizeObserver + coordonnées
//   relatives au conteneur) plutôt que sur window.innerWidth/innerHeight --
//   l'original visait une section plein écran (h-screen), ici c'est un
//   bandeau à l'intérieur du dashboard.
export default function HeroFluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    if (!prefersReducedMotion) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    let time = 0;
    const bgColor = "#ffffff";
    const lineBaseColor = "70, 72, 212"; // primary
    const accentColor = "47, 46, 190"; // on-primary-fixed-variant (plus soutenu, pour le survol)

    const draw = () => {
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      const spacing = 32;
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;

      ctx.lineWidth = 1.2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = j * spacing;

          let angle = Math.sin(x * 0.003 + time) + Math.cos(y * 0.003 + time);

          const dx = mouse.x - x;
          const dy = mouse.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let isNear = false;
          if (dist < 180 && dist > 0) {
            isNear = true;
            const pushAngle = Math.atan2(dy, dx) + Math.PI;
            const force = 1 - dist / 180;
            angle = angle * (1 - force) + pushAngle * force;
          }

          const lineLen = isNear ? 20 : 12;
          const x2 = x + Math.cos(angle) * lineLen;
          const y2 = y + Math.sin(angle) * lineLen;

          const alpha = isNear
            ? 0.85
            : 0.14 + Math.sin(x * 0.01 + y * 0.01 + time) * 0.08;

          ctx.strokeStyle = isNear
            ? `rgba(${accentColor}, ${alpha})`
            : `rgba(${lineBaseColor}, ${alpha})`;

          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    };

    if (prefersReducedMotion) {
      // Une seule image fixe, pas de boucle d'animation ni de suivi souris.
      draw();
    } else {
      const render = () => {
        time += 0.008;
        draw();
        animationFrameId = requestAnimationFrame(render);
      };
      render();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />
  );
}
