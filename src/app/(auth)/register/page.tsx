"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const companyName = formData.get("companyName") as string;

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, companyName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ein Fehler ist aufgetreten");
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("Ein Fehler ist aufgetreten");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <CardTitle>Konto erstellen</CardTitle>
          <CardDescription>
            Starte mit deiner ersten Content-Zertifizierung
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <Input
              id="name"
              name="name"
              type="text"
              label="Name"
              placeholder="Max Mustermann"
              required
              autoComplete="name"
            />

            <Input
              id="email"
              name="email"
              type="email"
              label="E-Mail"
              placeholder="name@beispiel.de"
              required
              autoComplete="email"
            />

            <Input
              id="companyName"
              name="companyName"
              type="text"
              label="Unternehmen (optional)"
              placeholder="Meine Firma GmbH"
              autoComplete="organization"
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Passwort"
              placeholder="Mindestens 8 Zeichen"
              required
              minLength={8}
              autoComplete="new-password"
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Registrieren
            </Button>
          </form>

          <p className="mt-4 text-xs text-gray-500 text-center">
            Mit der Registrierung stimmst du unseren{" "}
            <Link href="/terms" className="text-emerald-600 hover:underline">
              Nutzungsbedingungen
            </Link>{" "}
            und{" "}
            <Link href="/privacy" className="text-emerald-600 hover:underline">
              Datenschutzrichtlinien
            </Link>{" "}
            zu.
          </p>

          <div className="mt-6 text-center text-sm text-gray-600">
            Bereits ein Konto?{" "}
            <Link
              href="/login"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Jetzt anmelden
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
