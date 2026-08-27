import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "@/components/Inscription/Inscription";

export default function RegisterPage() {
  return (
    <AuthLayout mode="register">
      <RegisterForm />
    </AuthLayout>
  );
}