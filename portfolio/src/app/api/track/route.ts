import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
        if (!webhookUrl) {
            return NextResponse.json({ error: "No webhook configured" }, { status: 500 });
        }

        // Get real IP (Vercel sets x-forwarded-for)
        const forwarded = req.headers.get("x-forwarded-for");
        const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

        // Get user agent from request body (sent by client)
        const body = await req.json().catch(() => ({}));
        const ua: string = body.ua ?? "unknown";

        // Fetch geo info from ip-api.com (free, no key needed)
        let geoData: Record<string, string> = {};
        if (ip !== "unknown" && ip !== "::1" && ip !== "127.0.0.1") {
            try {
                const geoRes = await fetch(
                    `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,isp,timezone`,
                    { next: { revalidate: 0 } }
                );
                if (geoRes.ok) {
                    geoData = await geoRes.json();
                }
            } catch {
                // fail silently
            }
        }

        // Format timestamp in visitor's local timezone if available
        const now = new Date();
        const timestamp = now.toISOString();

        // Country flag emoji from country code
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

        // Build Discord embed
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
            footer: { text: "rluo. visitor radar" },
            timestamp,
        };

        await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ embeds: [embed] }),
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[track] error:", err);
        return NextResponse.json({ error: "internal error" }, { status: 500 });
    }
}
