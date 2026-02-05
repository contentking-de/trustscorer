import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const authorSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  email: z.string().email("Ungültige E-Mail-Adresse").optional().or(z.literal("")),
  bio: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const publisher = await prisma.publisher.findUnique({
      where: { userId: session.user.id },
      include: {
        authors: {
          orderBy: { createdAt: "desc" },
          include: {
            _count: {
              select: { certifications: true },
            },
          },
        },
      },
    });

    if (!publisher) {
      return NextResponse.json({ error: "Publisher nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json({ authors: publisher.authors });
  } catch (error) {
    console.error("Error fetching authors:", error);
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
    const { name, email, bio } = authorSchema.parse(body);

    const publisher = await prisma.publisher.findUnique({
      where: { userId: session.user.id },
      include: { authors: true },
    });

    if (!publisher) {
      return NextResponse.json({ error: "Publisher nicht gefunden" }, { status: 404 });
    }

    // Check plan limits
    const planLimits = {
      FREE: 3,
      PRO: 10,
      BUSINESS: 50,
      ENTERPRISE: Infinity,
    };

    const maxAuthors = planLimits[publisher.plan as keyof typeof planLimits];
    if (publisher.authors.length >= maxAuthors) {
      return NextResponse.json(
        { error: `Dein Plan erlaubt maximal ${maxAuthors} Autor(en)` },
        { status: 400 }
      );
    }

    // Check if author with same email already exists (if email provided)
    if (email) {
      const existingAuthor = await prisma.author.findFirst({
        where: {
          publisherId: publisher.id,
          email: email,
        },
      });

      if (existingAuthor) {
        return NextResponse.json(
          { error: "Ein Autor mit dieser E-Mail existiert bereits" },
          { status: 400 }
        );
      }
    }

    // Create author
    const newAuthor = await prisma.author.create({
      data: {
        publisherId: publisher.id,
        name,
        email: email || null,
        bio: bio || null,
      },
    });

    return NextResponse.json(
      { message: "Autor hinzugefügt", author: newAuthor },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    console.error("Error creating author:", error);
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, email, bio } = body;

    if (!id) {
      return NextResponse.json({ error: "Autor-ID erforderlich" }, { status: 400 });
    }

    const publisher = await prisma.publisher.findUnique({
      where: { userId: session.user.id },
    });

    if (!publisher) {
      return NextResponse.json({ error: "Publisher nicht gefunden" }, { status: 404 });
    }

    const author = await prisma.author.findFirst({
      where: {
        id,
        publisherId: publisher.id,
      },
    });

    if (!author) {
      return NextResponse.json({ error: "Autor nicht gefunden" }, { status: 404 });
    }

    // Check if email is taken by another author
    if (email && email !== author.email) {
      const existingAuthor = await prisma.author.findFirst({
        where: {
          publisherId: publisher.id,
          email: email,
          NOT: { id },
        },
      });

      if (existingAuthor) {
        return NextResponse.json(
          { error: "Ein anderer Autor verwendet diese E-Mail bereits" },
          { status: 400 }
        );
      }
    }

    const updatedAuthor = await prisma.author.update({
      where: { id },
      data: {
        name: name || author.name,
        email: email || null,
        bio: bio || null,
      },
    });

    return NextResponse.json({ message: "Autor aktualisiert", author: updatedAuthor });
  } catch (error) {
    console.error("Error updating author:", error);
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
    const authorId = searchParams.get("id");

    if (!authorId) {
      return NextResponse.json({ error: "Autor-ID erforderlich" }, { status: 400 });
    }

    const publisher = await prisma.publisher.findUnique({
      where: { userId: session.user.id },
    });

    if (!publisher) {
      return NextResponse.json({ error: "Publisher nicht gefunden" }, { status: 404 });
    }

    const author = await prisma.author.findFirst({
      where: {
        id: authorId,
        publisherId: publisher.id,
      },
      include: {
        _count: {
          select: { certifications: true },
        },
      },
    });

    if (!author) {
      return NextResponse.json({ error: "Autor nicht gefunden" }, { status: 404 });
    }

    await prisma.author.delete({
      where: { id: authorId },
    });

    return NextResponse.json({ message: "Autor gelöscht" });
  } catch (error) {
    console.error("Error deleting author:", error);
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 });
  }
}
