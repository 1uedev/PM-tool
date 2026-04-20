"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input.jsx";
import Button from "@/components/ui/Button.jsx";
import Spinner from "@/components/ui/Spinner.jsx";

export default function RegisterForm() {
  const router = useRouter();
  const [values, setValues] = useState({ name: "", email: "", password: "" });
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

    const newErrors = {};
    if (!values.name) newErrors.name = "Name ist erforderlich";
    if (!values.email) newErrors.email = "E-Mail ist erforderlich";
    if (!values.password) newErrors.password = "Passwort ist erforderlich";
    else if (values.password.length < 8)
      newErrors.password = "Passwort muss mindestens 8 Zeichen haben";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.error?.details) {
          setErrors(
            Object.fromEntries(
              Object.entries(json.error.details).map(([k, v]) => [k, v[0]])
            )
          );
        } else {
          setGlobalError(json.error?.message ?? "Registrierung fehlgeschlagen");
        }
        return;
      }

      // Auto-login after registration
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/login");
      } else {
        router.push("/projects");
        router.refresh();
      }
    } catch {
      setGlobalError("Netzwerkfehler — bitte versuche es erneut");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Konto erstellen</h1>
        <p className="mt-1 text-sm text-gray-500">Starte mit PM Copilot</p>
      </div>

      {globalError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Name"
          type="text"
          name="name"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
          autoComplete="name"
          placeholder="Max Mustermann"
        />
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
          autoComplete="new-password"
          placeholder="Mindestens 8 Zeichen"
        />

        <Button type="submit" disabled={loading} className="w-full mt-2">
          {loading ? (
            <>
              <Spinner className="w-4 h-4" />
              Konto wird erstellt…
            </>
          ) : (
            "Konto erstellen"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Bereits registriert?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:underline">
          Anmelden
        </Link>
      </p>
    </div>
  );
}
