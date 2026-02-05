import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import dns from "dns";
import { promisify } from "util";

const resolveTxt = promisify(dns.resolveTxt);

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await request.json();
    const { domainId, method } = body;

    if (!domainId || !method) {
      return NextResponse.json(
        { error: "Domain-ID und Methode erforderlich" },
        { status: 400 }
      );
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

    const expectedToken = `trustscorer-verify=${domain.verificationToken}`;
    let verified = false;

    if (method === "DNS") {
      try {
        const records = await resolveTxt(domain.domain);
        const flatRecords = records.flat();
        verified = flatRecords.some((record) => record.includes(expectedToken));
      } catch {
        // DNS lookup failed, domain might not exist or no TXT records
        verified = false;
      }
    } else if (method === "META") {
      try {
        const response = await fetch(`https://${domain.domain}`, {
          headers: { "User-Agent": "Trustscorer-Verifier/1.0" },
        });
        const html = await response.text();
        verified = html.includes(expectedToken);
      } catch {
        // Fetch failed
        verified = false;
      }
    } else {
      return NextResponse.json({ error: "Ungültige Methode" }, { status: 400 });
    }

    if (verified) {
      await prisma.domain.update({
        where: { id: domainId },
        data: {
          verificationStatus: "VERIFIED",
          verificationMethod: method,
          verifiedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: "Domain erfolgreich verifiziert!",
        verified: true,
      });
    } else {
      await prisma.domain.update({
        where: { id: domainId },
        data: {
          verificationStatus: "PENDING",
        },
      });

      return NextResponse.json({
        message: "Verifizierung fehlgeschlagen. Bitte überprüfe die Einrichtung.",
        verified: false,
      });
    }
  } catch (error) {
    console.error("Error verifying domain:", error);
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 });
  }
}
