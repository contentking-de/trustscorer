import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import dns from "dns";
import { promisify } from "util";
import { ProxyAgent, fetch as undiciFetch } from "undici";

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

    const dnsToken = `trustscorer-verify=${domain.verificationToken}`;
    let verified = false;

    if (method === "DNS") {
      try {
        const records = await resolveTxt(domain.domain);
        const flatRecords = records.flat();
        verified = flatRecords.some((record) => record.includes(dnsToken));
      } catch {
        // DNS lookup failed, domain might not exist or no TXT records
        verified = false;
      }
    } else if (method === "META") {
      // Try HTTPS first, then HTTP as fallback
      const urlsToTry = [
        `https://${domain.domain}`,
        `https://www.${domain.domain}`,
        `http://${domain.domain}`,
        `http://www.${domain.domain}`,
      ];

      // Use a realistic browser User-Agent to avoid being blocked by Cloudflare/WAFs
      const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
      };

      // Setup proxy agent if PROXY_URL is configured (e.g., IPRoyal Web Unblocker)
      const proxyUrl = process.env.PROXY_URL;
      const dispatcher = proxyUrl ? new ProxyAgent(proxyUrl) : undefined;
      
      if (proxyUrl) {
        console.log("Using proxy for domain verification");
      }

      for (const url of urlsToTry) {
        try {
          console.log(`Trying to verify domain at: ${url}`);
          
          const response = await undiciFetch(url, {
            headers,
            redirect: "follow",
            dispatcher,
          });
          
          if (!response.ok) {
            console.log(`URL ${url} returned status: ${response.status}`);
            continue;
          }

          const html = await response.text();
          console.log(`Checking for token in HTML from ${url}, HTML length: ${html.length}`);
          
          // Check for meta tag format: <meta name="trustscorer-verify" content="TOKEN">
          // The token can appear in different attribute orders and with single or double quotes
          const metaTagPattern = new RegExp(
            `<meta[^>]*name=["']trustscorer-verify["'][^>]*content=["']${domain.verificationToken}["'][^>]*>|` +
            `<meta[^>]*content=["']${domain.verificationToken}["'][^>]*name=["']trustscorer-verify["'][^>]*>`,
            'i'
          );
          
          if (metaTagPattern.test(html)) {
            verified = true;
            console.log(`Domain verified via ${url}`);
            break;
          } else {
            console.log(`Meta tag not found in ${url}. Looking for token: ${domain.verificationToken}`);
          }
        } catch (error) {
          console.log(`Failed to fetch ${url}:`, error instanceof Error ? error.message : error);
          // Continue to next URL
        }
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

      const methodHint = method === "META" 
        ? `Stelle sicher, dass das Meta-Tag <meta name="trustscorer-verify" content="${domain.verificationToken}"> im <head> Bereich deiner Seite ${domain.domain} vorhanden ist.`
        : `Stelle sicher, dass der TXT-Record "${dnsToken}" für ${domain.domain} korrekt eingerichtet ist.`;

      return NextResponse.json({
        message: `Verifizierung fehlgeschlagen. ${methodHint}`,
        verified: false,
      });
    }
  } catch (error) {
    console.error("Error verifying domain:", error);
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 });
  }
}
