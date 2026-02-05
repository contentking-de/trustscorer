"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Domain {
  id: string;
  domain: string;
  verificationStatus: string;
}

const creationProcessOptions = [
  { value: "HUMAN_WRITTEN", label: "Menschlich verfasst" },
  { value: "AI_GENERATED_HUMAN_EDITED", label: "KI-generiert mit menschlicher Überarbeitung" },
  { value: "AI_ASSISTED_RESEARCH", label: "KI-assistierte Recherche" },
  { value: "AI_ASSISTED_EDITING", label: "KI-assistiertes Lektorat/Übersetzung" },
  { value: "FULLY_AI_GENERATED", label: "Vollständig KI-generiert" },
];

const sourceTypeOptions = [
  { value: "PRIMARY_SOURCES", label: "Primärquellen (Interviews, Studien)" },
  { value: "SECONDARY_SOURCES", label: "Sekundärquellen (andere Artikel, Bücher)" },
  { value: "EXPERT_KNOWLEDGE", label: "Expertenwissen des Autors" },
  { value: "SOURCES_CITED", label: "Quellenangaben im Artikel vorhanden" },
];

const factCheckOptions = [
  { value: "INTERNAL_REVIEW", label: "Interner Review" },
  { value: "EXTERNAL_FACTCHECK", label: "Externer Faktencheck" },
  { value: "NO_FORMAL_FACTCHECK", label: "Kein formaler Faktencheck" },
];

export default function NewCertificationPage() {
  const router = useRouter();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    domainId: "",
    contentUrl: "",
    contentTitle: "",
    contentDescription: "",
    creationProcess: [] as string[],
    aiToolsUsed: "",
    sourceTypes: [] as string[],
    factCheckType: [] as string[],
    additionalNotes: "",
    authorName: "",
  });

  useEffect(() => {
    async function fetchDomains() {
      try {
        const res = await fetch("/api/domains");
        const data = await res.json();
        const verifiedDomains = (data.domains || []).filter(
          (d: Domain) => d.verificationStatus === "VERIFIED"
        );
        setDomains(verifiedDomains);
        if (verifiedDomains.length > 0) {
          setFormData((prev) => ({ ...prev, domainId: verifiedDomains[0].id }));
        }
      } catch {
        setError("Fehler beim Laden der Domains");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDomains();
  }, []);

  function handleCheckboxChange(field: "creationProcess" | "sourceTypes" | "factCheckType", value: string) {
    setFormData((prev) => {
      const current = prev[field];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      router.push(`/dashboard/certifications/${data.certification.id}`);
    } catch {
      setError("Fehler beim Erstellen der Zertifizierung");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (domains.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Keine verifizierte Domain
            </h2>
            <p className="text-gray-500 mb-6">
              Um Zertifizierungen zu erstellen, musst du zuerst eine Domain verifizieren.
            </p>
            <Button onClick={() => router.push("/dashboard/domains")}>
              Domain hinzufügen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Neue Zertifizierung</h1>
        <p className="text-gray-500 mt-1">
          Dokumentiere den Erstellungsprozess deines Contents
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Content-Informationen</CardTitle>
            <CardDescription>
              Grundlegende Informationen über den zu zertifizierenden Content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Domain
              </label>
              <select
                value={formData.domainId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, domainId: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {domains.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.domain}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Content-URL"
              type="url"
              placeholder="https://beispiel.de/artikel"
              value={formData.contentUrl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, contentUrl: e.target.value }))
              }
              required
            />

            <Input
              label="Titel (optional)"
              type="text"
              placeholder="Artikeltitel"
              value={formData.contentTitle}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, contentTitle: e.target.value }))
              }
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beschreibung (optional)
              </label>
              <textarea
                placeholder="Kurze Beschreibung des Contents"
                value={formData.contentDescription}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contentDescription: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Input
              label="Autor (optional)"
              type="text"
              placeholder="Name des Autors"
              value={formData.authorName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, authorName: e.target.value }))
              }
            />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Erstellungsprozess</CardTitle>
            <CardDescription>
              Wie wurde dieser Content erstellt?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {creationProcessOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.creationProcess.includes(option.value)}
                  onChange={() =>
                    handleCheckboxChange("creationProcess", option.value)
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}

            {(formData.creationProcess.includes("AI_GENERATED_HUMAN_EDITED") ||
              formData.creationProcess.includes("AI_ASSISTED_RESEARCH") ||
              formData.creationProcess.includes("AI_ASSISTED_EDITING") ||
              formData.creationProcess.includes("FULLY_AI_GENERATED")) && (
              <Input
                label="Verwendete KI-Tools (optional)"
                type="text"
                placeholder="z.B. ChatGPT, Claude, DeepL"
                value={formData.aiToolsUsed}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, aiToolsUsed: e.target.value }))
                }
              />
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quellen & Recherche</CardTitle>
            <CardDescription>
              Welche Quellen wurden für diesen Content verwendet?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sourceTypeOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.sourceTypes.includes(option.value)}
                  onChange={() => handleCheckboxChange("sourceTypes", option.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Faktencheck</CardTitle>
            <CardDescription>
              Wurde der Content auf Fakten geprüft?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {factCheckOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.factCheckType.includes(option.value)}
                  onChange={() => handleCheckboxChange("factCheckType", option.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Zusätzliche Anmerkungen</CardTitle>
            <CardDescription>
              Weitere Informationen zum Erstellungsprozess (optional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              placeholder="z.B. besondere Recherchemethoden, Experteninterviews, etc."
              value={formData.additionalNotes}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  additionalNotes: e.target.value,
                }))
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Abbrechen
          </Button>
          <Button type="submit" className="flex-1" isLoading={isSubmitting}>
            Zertifizierung erstellen
          </Button>
        </div>
      </form>
    </div>
  );
}
