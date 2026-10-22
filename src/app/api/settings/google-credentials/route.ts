import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { clientId, clientSecret } = await request.json();

    if (!clientId || !clientSecret || !clientId.trim() || !clientSecret.trim()) {
      return NextResponse.json(
        { error: "Both Client ID and Client Secret are required." },
        { status: 400 }
      );
    }

    const cleanClientId = clientId.trim();
    const cleanClientSecret = clientSecret.trim();

    // 1. Update in-memory environment variables for active process
    process.env.GOOGLE_CLIENT_ID = cleanClientId;
    process.env.GOOGLE_CLIENT_SECRET = cleanClientSecret;

    // 2. Persist to .env.local
    const envPath = path.join(process.cwd(), ".env.local");
    let envContent = "";
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf-8");
    }

    // Replace or append GOOGLE_CLIENT_ID
    if (/^GOOGLE_CLIENT_ID=.*/m.test(envContent)) {
      envContent = envContent.replace(/^GOOGLE_CLIENT_ID=.*/m, `GOOGLE_CLIENT_ID=${cleanClientId}`);
    } else {
      envContent += `\n# Google OAuth Credentials\nGOOGLE_CLIENT_ID=${cleanClientId}\n`;
    }

    // Replace or append GOOGLE_CLIENT_SECRET
    if (/^GOOGLE_CLIENT_SECRET=.*/m.test(envContent)) {
      envContent = envContent.replace(/^GOOGLE_CLIENT_SECRET=.*/m, `GOOGLE_CLIENT_SECRET=${cleanClientSecret}`);
    } else {
      envContent += `GOOGLE_CLIENT_SECRET=${cleanClientSecret}\n`;
    }

    fs.writeFileSync(envPath, envContent.trim() + "\n", "utf-8");

    return NextResponse.json({
      success: true,
      message: "Google OAuth credentials saved successfully to .env.local!",
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
