import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen haben"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen haben"),
  companyName: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, companyName } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ein Benutzer mit dieser E-Mail existiert bereits" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with publisher profile
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        publisher: {
          create: {
            contactName: name,
            companyName: companyName || null,
          },
        },
      },
      include: {
        publisher: true,
      },
    });

    return NextResponse.json(
      {
        message: "Registrierung erfolgreich",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          publisherId: user.publisher?.id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}
