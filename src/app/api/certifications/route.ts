import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const certificationSchema = z.object({
  domainId: z.string().min(1, "Domain ist erforderlich"),
  contentUrl: z.string().url("Ungültige URL"),
  contentTitle: z.string().optional(),
  contentDescription: z.string().optional(),
  creationProcess: z.array(z.string()).min(1, "Mindestens ein Erstellungsprozess erforderlich"),
  aiToolsUsed: z.string().optional(),
  sourceTypes: z.array(z.string()).optional(),
  factCheckType: z.array(z.string()).optional(),
  additionalNotes: z.string().optional(),
  authorName: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const publisher = await prisma.publisher.findUnique({
      where: { userId: session.user.id },
    });

    if (!publisher) {
      return NextResponse.json({ error: "Publisher nicht gefunden" }, { status: 404 });
    }

    const certifications = await prisma.certification.findMany({
      where: { publisherId: publisher.id },
      include: {
        domain: true,
        author: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ certifications });
  } catch (error) {
    console.error("Error fetching certifications:", error);
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
    const validatedData = certificationSchema.parse(body);

    const publisher = await prisma.publisher.findUnique({
      where: { userId: session.user.id },
      include: {
        domains: true,
        certifications: true,
      },
    });

    if (!publisher) {
      return NextResponse.json({ error: "Publisher nicht gefunden" }, { status: 404 });
    }

    // Check if domain belongs to publisher and is verified
    const domain = publisher.domains.find((d) => d.id === validatedData.domainId);
    if (!domain) {
      return NextResponse.json({ error: "Domain nicht gefunden" }, { status: 404 });
    }

    if (domain.verificationStatus !== "VERIFIED") {
      return NextResponse.json(
        { error: "Domain muss zuerst verifiziert werden" },
        { status: 400 }
      );
    }

    // Check URL matches domain
    const url = new URL(validatedData.contentUrl);
    if (!url.hostname.endsWith(domain.domain) && url.hostname !== domain.domain) {
      return NextResponse.json(
        { error: "URL muss zur verifizierten Domain gehören" },
        { status: 400 }
      );
    }

    // Check plan limits (FREE = 5/month)
    if (publisher.plan === "FREE") {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const monthlyCount = await prisma.certification.count({
        where: {
          publisherId: publisher.id,
          createdAt: { gte: startOfMonth },
        },
      });

      if (monthlyCount >= 5) {
        return NextResponse.json(
          { error: "Monatliches Limit erreicht (5 Zertifizierungen). Upgrade auf Pro für unbegrenzte Zertifizierungen." },
          { status: 400 }
        );
      }
    }

    // Create or find author
    let authorId: string | undefined;
    if (validatedData.authorName) {
      const existingAuthor = await prisma.author.findFirst({
        where: {
          publisherId: publisher.id,
          name: validatedData.authorName,
        },
      });

      if (existingAuthor) {
        authorId = existingAuthor.id;
      } else {
        const newAuthor = await prisma.author.create({
          data: {
            publisherId: publisher.id,
            name: validatedData.authorName,
          },
        });
        authorId = newAuthor.id;
      }
    }

    // Create certification
    const certification = await prisma.certification.create({
      data: {
        publisherId: publisher.id,
        domainId: validatedData.domainId,
        authorId,
        contentUrl: validatedData.contentUrl,
        contentTitle: validatedData.contentTitle,
        contentDescription: validatedData.contentDescription,
        creationProcess: validatedData.creationProcess as never[],
        aiToolsUsed: validatedData.aiToolsUsed,
        sourceTypes: (validatedData.sourceTypes || []) as never[],
        factCheckType: (validatedData.factCheckType || []) as never[],
        additionalNotes: validatedData.additionalNotes,
      },
      include: {
        domain: true,
        author: true,
      },
    });

    return NextResponse.json(
      {
        message: "Zertifizierung erstellt",
        certification,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    console.error("Error creating certification:", error);
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 });
  }
}
