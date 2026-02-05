"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Domain {
  id: string;
  domain: string;
  verificationStatus: "PENDING" | "VERIFIED" | "FAILED";
  verificationToken: string;
  verificationMethod: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

export default function DomainsPage() {
  const t = useTranslations("domains");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState<{ domainId: string; method: "DNS" | "META" } | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);

  useEffect(() => {
    fetchDomains();
  }, []);

  async function fetchDomains() {
    try {
      const res = await fetch("/api/domains");
      const data = await res.json();
      setDomains(data.domains || []);
    } catch {
      setError(t("errors.loadFailed"));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddDomain(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsAdding(true);

    try {
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newDomain }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setNewDomain("");
      fetchDomains();
    } catch {
      setError(t("errors.addFailed"));
    } finally {
      setIsAdding(false);
    }
  }

  async function handleVerify(domainId: string, method: "DNS" | "META") {
    setVerifying({ domainId, method });
    setError("");

    try {
      const res = await fetch("/api/domains/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId, method }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      if (!data.verified) {
        setError(data.message);
      }

      fetchDomains();
      setSelectedDomain(null);
    } catch {
      setError(t("errors.verifyFailed"));
    } finally {
      setVerifying(null);
    }
  }

  async function handleDelete(domainId: string) {
    if (!confirm(t("confirmDelete"))) {
      return;
    }

    try {
      const res = await fetch(`/api/domains?id=${domainId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        return;
      }

      fetchDomains();
    } catch {
      setError(t("errors.deleteFailed"));
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-gray-500 mt-1">
          {t("description")}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Add Domain Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t("add")}</CardTitle>
          <CardDescription>
            {t("addDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddDomain} className="flex gap-4">
            <Input
              type="text"
              placeholder="example.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" isLoading={isAdding}>
              {t("addButton")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Domains List */}
      <Card>
        <CardHeader>
          <CardTitle>{t("yourDomains")}</CardTitle>
        </CardHeader>
        <CardContent>
          {domains.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <p>{t("noDomains")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {domains.map((domain) => (
                <div
                  key={domain.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          domain.verificationStatus === "VERIFIED"
                            ? "bg-blue-100"
                            : "bg-amber-100"
                        }`}
                      >
                        {domain.verificationStatus === "VERIFIED" ? (
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{domain.domain}</p>
                        <p className="text-sm text-gray-500">
                          {domain.verificationStatus === "VERIFIED"
                            ? t("verifiedOn", { date: new Date(domain.verifiedAt!).toLocaleDateString(locale) })
                            : t("status.pending")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {domain.verificationStatus !== "VERIFIED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDomain(domain)}
                        >
                          {t("verify")}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(domain.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Modal */}
      {selectedDomain && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>{t("verification.title")}</CardTitle>
              <CardDescription>
                {t("verification.chooseMethod", { domain: selectedDomain.domain })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* DNS Method */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{t("verification.dnsOption")}</h4>
                <p className="text-sm text-gray-600 mb-3">
                  {t("verification.dnsDescription")}
                </p>
                <code className="block p-3 bg-gray-100 rounded text-sm break-all">
                  certiread-verify={selectedDomain.verificationToken}
                </code>
                <Button
                  className="mt-4 w-full"
                  onClick={() => handleVerify(selectedDomain.id, "DNS")}
                  isLoading={verifying?.domainId === selectedDomain.id && verifying?.method === "DNS"}
                  disabled={verifying !== null}
                >
                  {t("verification.checkDns")}
                </Button>
              </div>

              {/* Meta Tag Method */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{t("verification.metaOption")}</h4>
                <p className="text-sm text-gray-600 mb-3">
                  {t("verification.metaDescription")}
                </p>
                <code className="block p-3 bg-gray-100 rounded text-sm break-all">
                  &lt;meta name=&quot;certiread-verify&quot; content=&quot;{selectedDomain.verificationToken}&quot;&gt;
                </code>
                <Button
                  className="mt-4 w-full"
                  variant="outline"
                  onClick={() => handleVerify(selectedDomain.id, "META")}
                  isLoading={verifying?.domainId === selectedDomain.id && verifying?.method === "META"}
                  disabled={verifying !== null}
                >
                  {t("verification.checkMeta")}
                </Button>
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setSelectedDomain(null)}
                disabled={verifying !== null}
              >
                {tCommon("cancel")}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
