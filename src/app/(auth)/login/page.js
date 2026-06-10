import LoginForm from "@/components/auth/LoginForm.jsx";

export const metadata = { title: "Anmelden — PM Copilot" };

export default function LoginPage() {
  return <LoginForm registrationEnabled={process.env.REGISTRATION_ENABLED === "true"} />;
}
