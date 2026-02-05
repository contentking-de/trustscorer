import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CertificationActions } from "./certification-actions";

const creationProcessLabels: Record<string, string> = {
  HUMAN_WRITTEN: "Menschlich verfasst",
  AI_GENERATED_HUMAN_EDITED: "KI-generiert mit menschlicher Überarbeitung",
  AI_ASSISTED_RESEARCH: "KI-assistierte Recherche",
  AI_ASSISTED_EDITING: "KI-assistiertes Lektorat/Übersetzung",
  FULLY_AI_GENERATED: "Vollständig KI-generiert",
};

const sourceTypeLabels: Record<string, string> = {
  PRIMARY_SOURCES: "Primärquellen",
  SECONDARY_SOURCES: "Sekundärquellen",
  EXPERT_KNOWLEDGE: "Expertenwissen",
  SOURCES_CITED: "Quellenangaben vorhanden",
};

const factCheckLabels: Record<string, string> = {
  INTERNAL_REVIEW: "Interner Review",
  EXTERNAL_FACTCHECK: "Externer Faktencheck",
  NO_FORMAL_FACTCHECK: "Kein formaler Faktencheck",
};

export default async function CertificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    notFound();
  }

  const publisher = await prisma.publisher.findUnique({
    where: { userId: session.user.id },
  });

  if (!publisher) {
    notFound();
  }

  const certification = await prisma.certification.findFirst({
    where: {
      id,
      publisherId: publisher.id,
    },
    include: {
      domain: true,
      author: true,
      publisher: true,
    },
  });

  if (!certification) {
    notFound();
  }

  const baseUrl = process.env.NEXTAUTH_URL || "https://trustscorer.de";
  const verifyUrl = `${baseUrl}/verify/${certification.uniqueCode}`;
  const embedCode = `<script src="${baseUrl}/badge.js" data-certification="${certification.uniqueCode}" async></script>`;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {certification.contentTitle || "Zertifizierung"}
          </h1>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              certification.status === "ACTIVE"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {certification.status === "ACTIVE" ? "Aktiv" : "Widerrufen"}
          </span>
        </div>
        <p className="text-gray-500">{certification.contentUrl}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transparenz-Erklärung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Creation Process */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Erstellungsprozess
                </h4>
                <div className="flex flex-wrap gap-2">
                  {certification.creationProcess.map((process: string) => (
                    <span
                      key={process}
                      className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                    >
                      {creationProcessLabels[process] || process}
                    </span>
                  ))}
                </div>
                {certification.aiToolsUsed && (
                  <p className="mt-2 text-sm text-gray-600">
                    Verwendete Tools: {certification.aiToolsUsed}
                  </p>
                )}
              </div>

              {/* Sources */}
              {certification.sourceTypes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Quellen & Recherche
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {certification.sourceTypes.map((source: string) => (
                      <span
                        key={source}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {sourceTypeLabels[source] || source}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Fact Check */}
              {certification.factCheckType.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Faktencheck
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {certification.factCheckType.map((check: string) => (
                      <span
                        key={check}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                      >
                        {factCheckLabels[check] || check}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Author */}
              {certification.author && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Autor
                  </h4>
                  <p className="text-gray-900">{certification.author.name}</p>
                </div>
              )}

              {/* Additional Notes */}
              {certification.additionalNotes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Zusätzliche Anmerkungen
                  </h4>
                  <p className="text-gray-700">{certification.additionalNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Embed Code */}
          <Card>
            <CardHeader>
              <CardTitle>Badge einbetten</CardTitle>
              <CardDescription>
                Füge diesen Code auf deiner Website ein, um das Zertifikats-Badge anzuzeigen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-100 rounded-lg">
                <code className="text-sm break-all">{embedCode}</code>
              </div>
              <CertificationActions embedCode={embedCode} verifyUrl={verifyUrl} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiken</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Badge-Impressionen</span>
                <span className="font-semibold">
                  {certification.badgeImpressions.toLocaleString("de-DE")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Badge-Klicks</span>
                <span className="font-semibold">
                  {certification.badgeClicks.toLocaleString("de-DE")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Erstellt am</span>
                <span className="font-semibold">
                  {new Date(certification.createdAt).toLocaleDateString("de-DE")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href={verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Öffentliche Zertifikatsseite
              </a>
              <a
                href={certification.contentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Zum Content
              </a>
            </CardContent>
          </Card>

          {/* Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Zertifikat-Code</p>
                  <p className="text-xs text-gray-500 font-mono mt-1">
                    {certification.uniqueCode}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
