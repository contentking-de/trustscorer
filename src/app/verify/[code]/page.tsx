import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Metadata } from "next";

const creationProcessLabels: Record<string, string> = {
  HUMAN_WRITTEN: "Menschlich verfasst",
  AI_GENERATED_HUMAN_EDITED: "KI-generiert mit menschlicher Überarbeitung",
  AI_ASSISTED_RESEARCH: "KI-assistierte Recherche",
  AI_ASSISTED_EDITING: "KI-assistiertes Lektorat/Übersetzung",
  FULLY_AI_GENERATED: "Vollständig KI-generiert",
};

const sourceTypeLabels: Record<string, string> = {
  PRIMARY_SOURCES: "Primärquellen (Interviews, Studien)",
  SECONDARY_SOURCES: "Sekundärquellen (andere Artikel, Bücher)",
  EXPERT_KNOWLEDGE: "Expertenwissen des Autors",
  SOURCES_CITED: "Quellenangaben im Artikel vorhanden",
};

const factCheckLabels: Record<string, string> = {
  INTERNAL_REVIEW: "Interner Review",
  EXTERNAL_FACTCHECK: "Externer Faktencheck",
  NO_FORMAL_FACTCHECK: "Kein formaler Faktencheck",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const certification = await prisma.certification.findUnique({
    where: { uniqueCode: code },
    include: { publisher: true },
  });

  if (!certification) {
    return { title: "Zertifikat nicht gefunden" };
  }

  return {
    title: `Transparenz-Zertifikat | ${certification.contentTitle || certification.publisher.companyName || "Certiread"}`,
    description: `Verifiziertes Transparenz-Zertifikat für ${certification.contentUrl}`,
  };
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const certification = await prisma.certification.findUnique({
    where: { uniqueCode: code },
    include: {
      domain: true,
      author: true,
      publisher: {
        include: {
          _count: {
            select: { certifications: true },
          },
        },
      },
    },
  });

  if (!certification) {
    notFound();
  }

  // Increment view count
  await prisma.certification.update({
    where: { id: certification.id },
    data: { badgeClicks: { increment: 1 } },
  });

  const isRevoked = certification.status !== "ACTIVE";

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
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
            <span className="text-lg font-bold text-gray-900">Certiread</span>
          </Link>
          <span className="text-sm text-gray-500">Transparenz-Zertifikat</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {isRevoked && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-red-800">Zertifikat widerrufen</p>
                <p className="text-sm text-red-700">
                  Dieses Zertifikat wurde vom Publisher widerrufen und ist nicht mehr gültig.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Status Banner */}
          <div className={`px-6 py-4 ${isRevoked ? "bg-red-600" : "bg-emerald-600"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  {isRevoked ? (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">
                    {isRevoked ? "Zertifikat widerrufen" : "Verifiziertes Transparenz-Zertifikat"}
                  </p>
                  <p className="text-white/80 text-sm">
                    Ausgestellt am {new Date(certification.createdAt).toLocaleDateString("de-DE", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Info */}
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              {certification.contentTitle || "Zertifizierter Content"}
            </h1>
            <a
              href={certification.contentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              {certification.contentUrl}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Transparency Declaration */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Transparenz-Erklärung
            </h2>

            <div className="space-y-6">
              {/* Creation Process */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Erstellungsprozess
                </h3>
                <div className="flex flex-wrap gap-2">
                  {certification.creationProcess.map((process: string) => (
                    <span
                      key={process}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {creationProcessLabels[process] || process}
                    </span>
                  ))}
                </div>
                {certification.aiToolsUsed && (
                  <p className="mt-3 text-sm text-gray-600">
                    <span className="font-medium">Verwendete Tools:</span> {certification.aiToolsUsed}
                  </p>
                )}
              </div>

              {/* Sources */}
              {certification.sourceTypes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Quellen & Recherche
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {certification.sourceTypes.map((source: string) => (
                      <span
                        key={source}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {sourceTypeLabels[source] || source}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Fact Check */}
              {certification.factCheckType.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Faktencheck
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {certification.factCheckType.map((check: string) => (
                      <span
                        key={check}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {factCheckLabels[check] || check}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Author */}
              {certification.author && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Autor
                  </h3>
                  <p className="text-gray-900 font-medium">{certification.author.name}</p>
                </div>
              )}

              {/* Additional Notes */}
              {certification.additionalNotes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Zusätzliche Anmerkungen
                  </h3>
                  <p className="text-gray-700">{certification.additionalNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Publisher Info */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ausgestellt von</p>
                <p className="font-medium text-gray-900">
                  {certification.publisher.companyName || certification.publisher.contactName}
                </p>
                <p className="text-sm text-gray-500">
                  {certification.publisher._count.certifications} Zertifizierung(en) insgesamt
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Domain</p>
                <p className="font-medium text-gray-900">{certification.domain.domain}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Dieses Zertifikat wurde über{" "}
            <Link href="/" className="text-emerald-600 hover:text-emerald-700">
              Certiread
            </Link>{" "}
            ausgestellt.
          </p>
          <p className="mt-1">
            Zertifikat-Code: <span className="font-mono">{certification.uniqueCode}</span>
          </p>
        </div>
      </main>
    </div>
  );
}
