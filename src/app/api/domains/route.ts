import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const domainSchema = z.object({
  domain: z
    .string()
    .min(1, "Domain ist erforderlich")
    .refine(
      (val) => {
        const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
        return domainRegex.test(val);
      },
      { message: "Ungültige Domain" }
    ),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const publisher = await prisma.publisher.findUnique({
      where: { userId: session.user.id },
      include: { domains: { orderBy: { createdAt: "desc" } } },
    });

    if (!publisher) {
      return NextResponse.json({ error: "Publisher nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json({ domains: publisher.domains });
  } catch (error) {
    console.error("Error fetching domains:", error);
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await request.json();
    const { domain } = domainSchema.parse(body);

    // Normalize domain (lowercase, remove protocol)
    const normalizedDomain = domain
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");

    const publisher = await prisma.publisher.findUnique({
      where: { userId: session.user.id },
      include: { domains: true },
    });

    if (!publisher) {
      return NextResponse.json({ error: "Publisher nicht gefunden" }, { status: 404 });
    }

    // Check plan limits
    const planLimits = {
      FREE: 1,
      PRO: 3,
      BUSINESS: Infinity,
      ENTERPRISE: Infinity,
    };

    const maxDomains = planLimits[publisher.plan as keyof typeof planLimits];
    if (publisher.domains.length >= maxDomains) {
      return NextResponse.json(
        { error: `Dein Plan erlaubt maximal ${maxDomains} Domain(s)` },
        { status: 400 }
      );
    }

    // Check if domain already exists
    const existingDomain = await prisma.domain.findFirst({
      where: {
        publisherId: publisher.id,
        domain: normalizedDomain,
      },
    });

    if (existingDomain) {
      return NextResponse.json(
        { error: "Diese Domain ist bereits registriert" },
        { status: 400 }
      );
    }

    // Create domain
    const newDomain = await prisma.domain.create({
      data: {
        publisherId: publisher.id,
        domain: normalizedDomain,
      },
    });

    return NextResponse.json(
      { message: "Domain hinzugefügt", domain: newDomain },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    console.error("Error creating domain:", error);
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const domainId = searchParams.get("id");

    if (!domainId) {
      return NextResponse.json({ error: "Domain-ID erforderlich" }, { status: 400 });
    }

    const publisher = await prisma.publisher.findUnique({
      where: { userId: session.user.id },
    });

    if (!publisher) {
      return NextResponse.json({ error: "Publisher nicht gefunden" }, { status: 404 });
    }

    const domain = await prisma.domain.findFirst({
      where: {
        id: domainId,
        publisherId: publisher.id,
      },
    });

    if (!domain) {
      return NextResponse.json({ error: "Domain nicht gefunden" }, { status: 404 });
    }

    await prisma.domain.delete({
      where: { id: domainId },
    });

    return NextResponse.json({ message: "Domain gelöscht" });
  } catch (error) {
    console.error("Error deleting domain:", error);
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 });
  }
}
