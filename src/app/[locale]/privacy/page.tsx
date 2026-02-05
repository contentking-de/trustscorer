"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function PrivacyPage() {
  const t = useTranslations("privacy");

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

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8 prose prose-gray max-w-none">
          {/* Einleitung */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("intro.title")}
            </h2>
            <p className="text-gray-600">{t("intro.description")}</p>
          </section>

          {/* Verantwortlicher */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("controller.title")}
            </h2>
            <address className="not-italic text-gray-600 space-y-1 mb-4">
              <p className="font-medium text-gray-900">Nicolas Sacotte</p>
              <p>Eisenbahnstrasse 1</p>
              <p>88677 Markdorf</p>
              <p>{t("controller.country")}</p>
              <p className="mt-2">
                {t("controller.email")}:{" "}
                <a href="mailto:info@certiread.com" className="text-blue-600 hover:underline">
                  info@certiread.com
                </a>
              </p>
            </address>
          </section>

          {/* Datenerfassung */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("collection.title")}
            </h2>
            <p className="text-gray-600 mb-4">{t("collection.description")}</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t("collection.items.account")}</li>
              <li>{t("collection.items.usage")}</li>
              <li>{t("collection.items.technical")}</li>
            </ul>
          </section>

          {/* Zweck der Verarbeitung */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("purpose.title")}
            </h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t("purpose.items.service")}</li>
              <li>{t("purpose.items.communication")}</li>
              <li>{t("purpose.items.improvement")}</li>
              <li>{t("purpose.items.legal")}</li>
            </ul>
          </section>

          {/* Rechtsgrundlage */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("legal.title")}
            </h2>
            <p className="text-gray-600">{t("legal.description")}</p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("cookies.title")}
            </h2>
            <p className="text-gray-600">{t("cookies.description")}</p>
          </section>

          {/* Datenweitergabe */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("sharing.title")}
            </h2>
            <p className="text-gray-600">{t("sharing.description")}</p>
          </section>

          {/* Speicherdauer */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("retention.title")}
            </h2>
            <p className="text-gray-600">{t("retention.description")}</p>
          </section>

          {/* Ihre Rechte */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("rights.title")}
            </h2>
            <p className="text-gray-600 mb-4">{t("rights.description")}</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t("rights.items.access")}</li>
              <li>{t("rights.items.rectification")}</li>
              <li>{t("rights.items.erasure")}</li>
              <li>{t("rights.items.restriction")}</li>
              <li>{t("rights.items.portability")}</li>
              <li>{t("rights.items.objection")}</li>
            </ul>
          </section>

          {/* Beschwerderecht */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("complaint.title")}
            </h2>
            <p className="text-gray-600">{t("complaint.description")}</p>
          </section>

          {/* Änderungen */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("changes.title")}
            </h2>
            <p className="text-gray-600">{t("changes.description")}</p>
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
