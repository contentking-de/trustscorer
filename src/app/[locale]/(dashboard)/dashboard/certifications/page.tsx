"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Certification {
  id: string;
  uniqueCode: string;
  contentUrl: string;
  contentTitle: string | null;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  badgeImpressions: number;
  badgeClicks: number;
  createdAt: string;
  domain: {
    domain: string;
  };
  author: {
    name: string;
  } | null;
}

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCertifications() {
      try {
        const res = await fetch("/api/certifications");
        const data = await res.json();
        setCertifications(data.certifications || []);
      } catch (error) {
        console.error("Error fetching certifications:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCertifications();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Zertifizierungen</h1>
          <p className="text-gray-500 mt-1">
            Alle deine Content-Zertifizierungen im Überblick
          </p>
        </div>
        <Link href="/dashboard/certifications/new">
          <Button>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Neue Zertifizierung
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle Zertifizierungen ({certifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {certifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium mb-2">Noch keine Zertifizierungen</p>
              <p className="mb-6">Erstelle deine erste Content-Zertifizierung</p>
              <Link href="/dashboard/certifications/new">
                <Button>Erste Zertifizierung erstellen</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">
                      Content
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">
                      Domain
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">
                      Impressionen
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">
                      Datum
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 text-sm">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {certifications.map((cert) => (
                    <tr key={cert.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="max-w-xs">
                          <p className="font-medium text-gray-900 truncate">
                            {cert.contentTitle || "Ohne Titel"}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {cert.contentUrl}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {cert.domain.domain}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            cert.status === "ACTIVE"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {cert.status === "ACTIVE" ? "Aktiv" : "Widerrufen"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {cert.badgeImpressions.toLocaleString("de-DE")}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {new Date(cert.createdAt).toLocaleDateString("de-DE")}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/dashboard/certifications/${cert.id}`}>
                          <Button variant="ghost" size="sm">
                            Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
