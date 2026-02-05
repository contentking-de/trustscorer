"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CertificationActionsProps {
  embedCode: string;
  verifyUrl: string;
}

export function CertificationActions({ embedCode, verifyUrl }: CertificationActionsProps) {
  const [copied, setCopied] = useState<"embed" | "url" | null>(null);

  async function copyToClipboard(text: string, type: "embed" | "url") {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="flex gap-3 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => copyToClipboard(embedCode, "embed")}
      >
        {copied === "embed" ? (
          <>
            <svg className="w-4 h-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Kopiert!
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Code kopieren
          </>
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => copyToClipboard(verifyUrl, "url")}
      >
        {copied === "url" ? (
          <>
            <svg className="w-4 h-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Kopiert!
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            URL kopieren
          </>
        )}
      </Button>
    </div>
  );
}
