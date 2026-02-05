"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("auth.register");
  const tCommon = useTranslations("common");

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
        setError(data.error || tCommon("error"));
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError(tCommon("error"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
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
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
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
              label={t("name")}
              placeholder="Max Mustermann"
              required
              autoComplete="name"
            />

            <Input
              id="email"
              name="email"
              type="email"
              label={t("email")}
              placeholder="name@example.com"
              required
              autoComplete="email"
            />

            <Input
              id="companyName"
              name="companyName"
              type="text"
              label="Company (optional)"
              placeholder="Company Inc."
              autoComplete="organization"
            />

            <Input
              id="password"
              name="password"
              type="password"
              label={t("password")}
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete="new-password"
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              {t("submit")}
            </Button>
          </form>

          <p className="mt-4 text-xs text-gray-500 text-center">
            {t("terms")}{" "}
            <Link href="/terms" className="text-blue-600 hover:underline">
              {t("termsLink")}
            </Link>{" "}
            {t("and")}{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              {t("privacyLink")}
            </Link>
            .
          </p>

          <div className="mt-6 text-center text-sm text-gray-600">
            {t("hasAccount")}{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {t("loginLink")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
