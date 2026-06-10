import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm.jsx";

export const metadata = { title: "Registrieren — PM Copilot" };

export default function RegisterPage() {
  if (process.env.REGISTRATION_ENABLED !== "true") {
    return (
      <div className="rounded-xl bg-white p-8 shadow-sm text-center">
        <h1 className="text-xl font-semibold text-gray-900">Registrierung deaktiviert</h1>
        <p className="mt-3 text-sm text-gray-500">
          Die Selbstregistrierung ist auf dieser Instanz deaktiviert. Konten werden
          von einem Administrator angelegt — bitte wende dich an dein Team.
        </p>
        <p className="mt-6 text-sm">
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            Zur Anmeldung
          </Link>
        </p>
      </div>
    );
  }

  return <RegisterForm />;
}
