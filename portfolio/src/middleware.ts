import { NextRequest, NextResponse } from "next/server";

// Cookie name used to deduplicate visitors (lasts 24h)
const COOKIE_NAME = "vt_seen";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

// Only run on the root page visit, not on API routes, static files, etc.
export const config = {
    matcher: ["/"],
};

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    // If the cookie is already set, this is a repeat visit — skip
    if (req.cookies.get(COOKIE_NAME)) {
        return res;
    }

    // Set cookie so we don't fire again for 24 hours
    res.cookies.set(COOKIE_NAME, "1", {
        maxAge: COOKIE_MAX_AGE,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
    });

    // Must await — Edge runtime kills unawaited async tasks when middleware returns
    await sendDiscordNotification(req).catch(() => {
        // fail silently — visitor should never be affected
    });

    return res;
}

async function sendDiscordNotification(req: NextRequest) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return;

    // Get IP from Vercel's forwarded header
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    // Get User-Agent from request headers (no client-side JS needed)
    const ua = req.headers.get("user-agent") ?? "unknown";

    // Fetch geo info from ip-api.com
    let geoData: Record<string, string> = {};
    if (ip !== "unknown" && ip !== "::1" && ip !== "127.0.0.1") {
        try {
            const geoRes = await fetch(
                `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,isp,timezone`,
                { cache: "no-store" }
            );
            if (geoRes.ok) {
                geoData = await geoRes.json();
            }
        } catch {
            // fail silently
        }
    }

    // Country flag emoji
    const flag = geoData.countryCode
        ? geoData.countryCode
            .toUpperCase()
            .split("")
            .map((c: string) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
            .join("")
        : "";

    const locationStr = [geoData.city, geoData.regionName, geoData.country]
        .filter(Boolean)
        .join(", ");

    const timestamp = new Date().toISOString();

    const embed = {
        title: "🕵️ 新访客到达！",
        color: 0x5865f2,
        fields: [
            { name: "IP", value: `\`${ip}\``, inline: true },
            {
                name: "位置",
                value: locationStr ? `${locationStr} ${flag}` : "unknown",
                inline: true,
            },
            { name: "ISP", value: geoData.isp || "unknown", inline: false },
            { name: "时区", value: geoData.timezone || "unknown", inline: true },
            {
                name: "时间 (UTC)",
                value: timestamp.replace("T", " ").replace("Z", ""),
                inline: true,
            },
            {
                name: "User Agent",
                value: `\`${ua.slice(0, 200)}\``,
                inline: false,
            },
        ],
        footer: { text: "rluo. visitor radar · server-side" },
        timestamp,
    };

    await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: [embed] }),
    });
}
