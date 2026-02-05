import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { put, del } from "@vercel/blob";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const authorId = formData.get("authorId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Keine Datei hochgeladen" }, { status: 400 });
    }

    if (!authorId) {
      return NextResponse.json({ error: "Autor-ID erforderlich" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Nur JPEG, PNG, WebP und GIF Bilder sind erlaubt" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Maximale Dateigröße ist 5MB" },
        { status: 400 }
      );
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
    });

    if (!author) {
      return NextResponse.json({ error: "Autor nicht gefunden" }, { status: 404 });
    }

    // Delete old image if exists
    if (author.imageUrl) {
      try {
        await del(author.imageUrl);
      } catch {
        // Ignore deletion errors
      }
    }

    // Upload new image to Vercel Blob
    const filename = `authors/${authorId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const blob = await put(filename, file, {
      access: "public",
    });

    // Update author with new image URL
    const updatedAuthor = await prisma.author.update({
      where: { id: authorId },
      data: { imageUrl: blob.url },
    });

    return NextResponse.json({
      message: "Bild hochgeladen",
      imageUrl: blob.url,
      author: updatedAuthor,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
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
    const authorId = searchParams.get("authorId");

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
    });

    if (!author) {
      return NextResponse.json({ error: "Autor nicht gefunden" }, { status: 404 });
    }

    if (!author.imageUrl) {
      return NextResponse.json({ error: "Kein Bild vorhanden" }, { status: 400 });
    }

    // Delete from Vercel Blob
    try {
      await del(author.imageUrl);
    } catch {
      // Ignore deletion errors
    }

    // Remove image URL from author
    await prisma.author.update({
      where: { id: authorId },
      data: { imageUrl: null },
    });

    return NextResponse.json({ message: "Bild gelöscht" });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 });
  }
}
