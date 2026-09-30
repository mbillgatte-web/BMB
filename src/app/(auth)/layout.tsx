import AuthLayout from "@/components/auth/AuthLayout";

// Layout partagé par Connexion (/) et Inscription (/Inscription) : il reste
// monté quand on passe de l'une à l'autre, ce qui permet d'animer l'échange
// des deux panneaux (voir AuthLayout.tsx). Le groupe "(auth)" ne change pas
// les URL.
export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}