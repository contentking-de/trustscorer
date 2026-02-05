"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function TermsPage() {
  const t = useTranslations("terms");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-certiread.png"
              alt="Certiread"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="text-xl font-bold text-gray-900">CERTIREAD</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t("title")}</h1>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          {/* Geltungsbereich */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("scope.title")}
            </h2>
            <p className="text-gray-600">{t("scope.description")}</p>
          </section>

          {/* Leistungsbeschreibung */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("services.title")}
            </h2>
            <p className="text-gray-600">{t("services.description")}</p>
          </section>

          {/* Registrierung */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("registration.title")}
            </h2>
            <p className="text-gray-600 mb-4">{t("registration.description")}</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t("registration.items.accurate")}</li>
              <li>{t("registration.items.secure")}</li>
              <li>{t("registration.items.responsible")}</li>
            </ul>
          </section>

          {/* Nutzungspflichten */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("obligations.title")}
            </h2>
            <p className="text-gray-600 mb-4">{t("obligations.description")}</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t("obligations.items.lawful")}</li>
              <li>{t("obligations.items.truthful")}</li>
              <li>{t("obligations.items.noAbuse")}</li>
              <li>{t("obligations.items.noHarm")}</li>
            </ul>
          </section>

          {/* Zertifizierungen */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("certifications.title")}
            </h2>
            <p className="text-gray-600 mb-4">{t("certifications.description")}</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t("certifications.items.ownership")}</li>
              <li>{t("certifications.items.accuracy")}</li>
              <li>{t("certifications.items.revocation")}</li>
            </ul>
          </section>

          {/* Haftung */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("liability.title")}
            </h2>
            <p className="text-gray-600">{t("liability.description")}</p>
          </section>

          {/* Kündigung */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("termination.title")}
            </h2>
            <p className="text-gray-600">{t("termination.description")}</p>
          </section>

          {/* Änderungen */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("changes.title")}
            </h2>
            <p className="text-gray-600">{t("changes.description")}</p>
          </section>

          {/* Anwendbares Recht */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("law.title")}
            </h2>
            <p className="text-gray-600">{t("law.description")}</p>
          </section>

          {/* Stand */}
          <section className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {t("lastUpdated")}: Februar 2026
            </p>
          </section>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("backToHome")}
          </Link>
        </div>
      </main>
    </div>
  );
}
