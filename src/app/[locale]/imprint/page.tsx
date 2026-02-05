"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function ImprintPage() {
  const t = useTranslations("imprint");

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
          {/* Angaben gemäß § 5 TMG */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("provider.title")}
            </h2>
            <address className="not-italic text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">Nicolas Sacotte</p>
              <p>Eisenbahnstrasse 1</p>
              <p>88677 Markdorf</p>
              <p>{t("provider.country")}</p>
            </address>
          </section>

          {/* Kontakt */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("contact.title")}
            </h2>
            <div className="text-gray-600 space-y-1">
              <p>
                <span className="font-medium">{t("contact.phone")}:</span>{" "}
                <a href="tel:+4975445067064" className="text-blue-600 hover:underline">
                  +49 7544 5067064
                </a>
              </p>
              <p>
                <span className="font-medium">{t("contact.email")}:</span>{" "}
                <a href="mailto:info@certiread.com" className="text-blue-600 hover:underline">
                  info@certiread.com
                </a>
              </p>
            </div>
          </section>

          {/* Umsatzsteuer-ID */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("vat.title")}
            </h2>
            <p className="text-gray-600">
              {t("vat.description")}: <span className="font-medium">DE227809660</span>
            </p>
          </section>

          {/* Inhaltlich Verantwortlicher */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("responsible.title")}
            </h2>
            <address className="not-italic text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">Nicolas Sacotte</p>
              <p>Eisenbahnstrasse 1</p>
              <p>88677 Markdorf</p>
            </address>
          </section>

          {/* Streitbeilegung */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("dispute.title")}
            </h2>
            <p className="text-gray-600">
              {t("dispute.description")}
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
