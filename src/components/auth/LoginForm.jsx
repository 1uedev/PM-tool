"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input.jsx";
import Button from "@/components/ui/Button.jsx";
import Spinner from "@/components/ui/Spinner.jsx";

export default function LoginForm() {
  const router = useRouter();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  function handleChange(e) {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    setErrors((err) => ({ ...err, [e.target.name]: undefined }));
    setGlobalError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!values.email) {
      setErrors((err) => ({ ...err, email: "E-Mail ist erforderlich" }));
      return;
    }
    if (!values.password) {
      setErrors((err) => ({ ...err, password: "Passwort ist erforderlich" }));
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        setGlobalError("E-Mail oder Passwort ungültig");
      } else {
        router.push("/projects");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Anmelden</h1>
        <p className="mt-1 text-sm text-gray-500">Willkommen zurück bei PM Copilot</p>
      </div>

      {globalError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="E-Mail"
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
          placeholder="name@beispiel.de"
        />
        <Input
          label="Passwort"
          type="password"
          name="password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
          placeholder="••••••••"
        />

        <Button type="submit" disabled={loading} className="w-full mt-2">
          {loading ? (
            <>
              <Spinner className="w-4 h-4" />
              Anmelden…
            </>
          ) : (
            "Anmelden"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Noch kein Konto?{" "}
        <Link href="/register" className="font-medium text-blue-600 hover:underline">
          Registrieren
        </Link>
      </p>
    </div>
  );
}
