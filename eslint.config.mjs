import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Architecture : seuls src/data/ (le "Model", un fichier par table) et
  // src/lib/supabase/ (création des clients) ont le droit de parler
  // directement à la base. Pages, routes API, hooks et composants passent
  // par les fonctions de src/data/. L'authentification (supabase.auth.*)
  // reste autorisée partout : ce n'est pas une table.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/data/**", "src/lib/supabase/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.property.name='from'][callee.object.name=/^supabase/]",
          message:
            "Pas de requête Supabase ici : ajoute/utilise une fonction dans src/data/<table>.ts.",
        },
        {
          selector: "MemberExpression[property.name='storage'][object.name=/^supabase/]",
          message:
            "Pas d'accès au stockage Supabase ici : ajoute/utilise une fonction dans src/data/.",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@supabase/supabase-js",
              allowTypeImports: true,
              message:
                "Utilise les clients de src/lib/supabase/ (browser.ts ou server.ts) et les fonctions de src/data/.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
