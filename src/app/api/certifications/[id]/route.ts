import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateCertificationSchema = z.object({
  contentUrl: z.string().url("Ungültige URL").optional(),
  contentTitle: z.string().optional(),
  contentDescription: z.string().optional(),
  creationProcess: z.array(z.string()).min(1, "Mindestens ein Erstellungsprozess erforderlich").optional(),
  aiToolsUsed: z.string().optional(),
  sourceTypes: z.array(z.string()).optional(),
  factCheckType: z.array(z.string()).optional(),
  additionalNotes: z.string().optional(),
  authorName: z.string().optional(),
  status: z.enum(["ACTIVE", "REVOKED", "EXPIRED"]).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const certification = await prisma.certification.findFirst({
      where: {
        id,
        publisherId: publisher.id,
      },
      include: {
        domain: true,
        author: true,
      },
    });

    if (!certification) {
      return NextResponse.json({ error: "Zertifizierung nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json({ certification });
  } catch (error) {
    console.error("Error fetching certification:", error);
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateCertificationSchema.parse(body);

    const publisher = await prisma.publisher.findUnique({
      where: { userId: session.user.id },
    });

    if (!publisher) {
      return NextResponse.json({ error: "Publisher nicht gefunden" }, { status: 404 });
    }

    // Find the certification
    const existingCertification = await prisma.certification.findFirst({
      where: {
        id,
        publisherId: publisher.id,
      },
      include: {
        domain: true,
      },
    });

    if (!existingCertification) {
      return NextResponse.json({ error: "Zertifizierung nicht gefunden" }, { status: 404 });
    }

    // Validate URL against domain if changed
    if (validatedData.contentUrl) {
      const url = new URL(validatedData.contentUrl);
      if (!url.hostname.endsWith(existingCertification.domain.domain) && 
          url.hostname !== existingCertification.domain.domain) {
        return NextResponse.json(
          { error: "URL muss zur verifizierten Domain gehören" },
          { status: 400 }
        );
      }
    }

    // Handle author
    let authorId: string | null = existingCertification.authorId;
    if (validatedData.authorName !== undefined) {
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
      } else {
        authorId = null;
      }
    }

    // Update certification
    const certification = await prisma.certification.update({
      where: { id },
      data: {
        ...(validatedData.contentUrl && { contentUrl: validatedData.contentUrl }),
        ...(validatedData.contentTitle !== undefined && { contentTitle: validatedData.contentTitle || null }),
        ...(validatedData.contentDescription !== undefined && { contentDescription: validatedData.contentDescription || null }),
        ...(validatedData.creationProcess && { creationProcess: validatedData.creationProcess as never[] }),
        ...(validatedData.aiToolsUsed !== undefined && { aiToolsUsed: validatedData.aiToolsUsed || null }),
        ...(validatedData.sourceTypes && { sourceTypes: validatedData.sourceTypes as never[] }),
        ...(validatedData.factCheckType && { factCheckType: validatedData.factCheckType as never[] }),
        ...(validatedData.additionalNotes !== undefined && { additionalNotes: validatedData.additionalNotes || null }),
        ...(validatedData.status && { status: validatedData.status }),
        authorId,
      },
      include: {
        domain: true,
        author: true,
      },
    });

    return NextResponse.json({
      message: "Zertifizierung aktualisiert",
      certification,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    console.error("Error updating certification:", error);
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Find the certification
    const existingCertification = await prisma.certification.findFirst({
      where: {
        id,
        publisherId: publisher.id,
      },
    });

    if (!existingCertification) {
      return NextResponse.json({ error: "Zertifizierung nicht gefunden" }, { status: 404 });
    }

    // Delete the certification
    await prisma.certification.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Zertifizierung gelöscht",
    });
  } catch (error) {
    console.error("Error deleting certification:", error);
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 });
  }
}
