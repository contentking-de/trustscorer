import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const certification = await prisma.certification.findUnique({
      where: { uniqueCode: code },
      include: {
        domain: true,
        author: true,
        publisher: true,
      },
    });

    if (!certification) {
      return NextResponse.json({ error: "Zertifikat nicht gefunden" }, { status: 404 });
    }

    // Increment impression count
    await prisma.certification.update({
      where: { id: certification.id },
      data: { badgeImpressions: { increment: 1 } },
    });

    const creationProcessLabels: Record<string, string> = {
      HUMAN_WRITTEN: "Menschlich verfasst",
      AI_GENERATED_HUMAN_EDITED: "KI mit Überarbeitung",
      AI_ASSISTED_RESEARCH: "KI-Recherche",
      AI_ASSISTED_EDITING: "KI-Lektorat",
      FULLY_AI_GENERATED: "KI-generiert",
    };

    return NextResponse.json({
      valid: certification.status === "ACTIVE",
      code: certification.uniqueCode,
      title: certification.contentTitle,
      url: certification.contentUrl,
      createdAt: certification.createdAt,
      publisher: certification.publisher.companyName || certification.publisher.contactName,
      domain: certification.domain.domain,
      author: certification.author?.name || null,
      creationProcess: certification.creationProcess.map(
        (p) => creationProcessLabels[p] || p
      ),
      hasSourcesCited: certification.sourceTypes.includes("SOURCES_CITED"),
      hasFactCheck:
        certification.factCheckType.includes("INTERNAL_REVIEW") ||
        certification.factCheckType.includes("EXTERNAL_FACTCHECK"),
    });
  } catch (error) {
    console.error("Error fetching badge data:", error);
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 });
  }
}
