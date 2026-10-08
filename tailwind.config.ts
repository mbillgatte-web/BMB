import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Palette verte (décision du 03/10/2026) : vert profond #0F7A38 comme
      // couleur de marque, secondary en bleu-vert pour les états « succès »,
      // tertiary ambre conservée, neutres légèrement teintés vert.
      colors: {
        // Fond de la "coque" Dashboard (voir DashboardView.tsx) : le vert
        // pâle sur lequel flotte le panneau sidebar+contenu, distinct de
        // `background` (encore utilisé tel quel par les pages non retouchées
        // -- Inscription, BuildEntreprise...). Ne pas réutiliser ailleurs
        // sans avoir aussi migré la page en question vers ce même look.
        canvas: "#E6EDE7",
        tertiary: "#825100",
        "surface-tint": "#0F7A38",
        "on-tertiary-container": "#fffbff",
        "on-surface-variant": "#414942",
        "secondary-fixed-dim": "#85CFD9",
        "surface-container-high": "#E6EBE6",
        "on-tertiary": "#ffffff",
        "on-error": "#ffffff",
        "outline-variant": "#C3CCC4",
        "surface-variant": "#E0E6E1",
        "tertiary-fixed": "#ffddb8",
        "secondary-container": "#B2EBF2",
        "inverse-primary": "#8CD9A5",
        "primary-fixed": "#A7F3C0",
        "on-surface": "#191C19",
        "surface-container": "#ECF1EC",
        "primary-container": "#A7F3C0",
        outline: "#717A72",
        "tertiary-container": "#a36700",
        "on-primary-fixed-variant": "#0B5F2B",
        "secondary-fixed": "#B2EBF2",
        "on-secondary-container": "#00363D",
        background: "#F8FBF8",
        "on-primary-container": "#00210C",
        "primary-fixed-dim": "#8CD9A5",
        "tertiary-fixed-dim": "#ffb95f",
        "inverse-surface": "#2E312E",
        "on-secondary-fixed": "#001F24",
        "error-container": "#ffdad6",
        "on-primary": "#ffffff",
        "on-background": "#191C19",
        "surface-bright": "#F8FBF8",
        "inverse-on-surface": "#EFF2EE",
        "on-tertiary-fixed": "#2a1700",
        primary: "#0F7A38",
        // Utilisées par les écrans Connexion/Inscription (Field.tsx...).
        "primary-hover": "#0B5F2B",
        "border-strong": "#D4D4D8",
        secondary: "#0E6E7A",
        "surface-container-highest": "#E0E6E1",
        "on-secondary-fixed-variant": "#00525C",
        "on-primary-fixed": "#00210C",
        "on-secondary": "#ffffff",
        "surface-container-low": "#F2F6F2",
        error: "#ba1a1a",
        surface: "#F8FBF8",
        "surface-container-lowest": "#ffffff",
        "on-tertiary-fixed-variant": "#653e00",
        "surface-dim": "#D8DED9",
        "on-error-container": "#93000a",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        base: "4px",
        xl: "32px",
        sm: "12px",
        xs: "8px",
        "2xl": "48px",
        lg: "24px",
        md: "16px",
        "container-max": "1280px",
        gutter: "24px",
      },
      // NB: max-w-lg / max-w-2xl sont cassés dans ce projet (spacing.lg=24px
      // et spacing.2xl=48px écrasent silencieusement le sens standard de
      // maxWidth.lg/2xl, à cause du spread interne spacing -> maxWidth de
      // Tailwind). Une tentative de les redéclarer ici via `extend.maxWidth`
      // n'a PAS suffi à corriger le rendu (vérifié empiriquement, pas
      // seulement en théorie) -- le compat layer v4 + @config ne les
      // prend pas en compte comme attendu. Utiliser des valeurs arbitraires
      // (`max-w-[32rem]`) directement dans le JSX à la place -- voir
      // VisualGenerator.tsx.
      fontFamily: {
        "headline-lg-mobile": ["var(--font-manrope)", "sans-serif"],
        "mono-stats": ["var(--font-inter)", "sans-serif"],
        "body-sm": ["var(--font-inter)", "sans-serif"],
        "body-lg": ["var(--font-inter)", "sans-serif"],
        "body-md": ["var(--font-inter)", "sans-serif"],
        "headline-md": ["var(--font-manrope)", "sans-serif"],
        "headline-sm": ["var(--font-manrope)", "sans-serif"],
        "headline-lg": ["var(--font-manrope)", "sans-serif"],
        "display-lg": ["var(--font-manrope)", "sans-serif"],
        "label-md": ["var(--font-inter)", "sans-serif"],
        "label-sm": ["var(--font-inter)", "sans-serif"],
      },
      fontSize: {
        "headline-lg-mobile": ["28px", { lineHeight: "36px", fontWeight: "700" }],
        "mono-stats": ["20px", { lineHeight: "24px", fontWeight: "700" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-sm": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "headline-lg": [
          "32px",
          { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "700" },
        ],
        "display-lg": [
          "48px",
          { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "800" },
        ],
        "label-md": [
          "14px",
          { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" },
        ],
        "label-sm": [
          "12px",
          { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" },
        ],
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/container-queries")],
};

export default config;
