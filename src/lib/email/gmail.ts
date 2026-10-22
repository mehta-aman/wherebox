/**
 * WhereBox Gmail Auto-Discovery Integration
 * Communicates directly with Google OAuth 2.0 and Gmail REST APIs using fetch
 * Strict narrow scope: https://www.googleapis.com/auth/gmail.readonly
 * Zero-storage policy: Email bodies processed in-memory and discarded
 */

import { EmailMessagePayload } from "./parser";

export interface GoogleTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  email: string;
}

export function getGoogleOAuthUrl(state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId || "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email",
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string): Promise<GoogleTokens> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not configured in environment variables.");
  }

  // 1. Exchange authorization code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Google token exchange failed (${tokenRes.status}): ${errText}`);
  }

  const tokenData = await tokenRes.json();

  // 2. Fetch user's email address
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  let email = "user@gmail.com";
  if (userRes.ok) {
    const userData = await userRes.json();
    email = userData.email || email;
  }

  return {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresIn: tokenData.expires_in || 3600,
    email,
  };
}

export async function refreshGoogleAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google credentials missing for token refresh.");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to refresh Google access token: ${errText}`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in || 3600,
  };
}

export async function revokeGoogleToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Searches Gmail for order and shipping confirmation messages from major merchants
 * Query filters strictly for parcel/order senders within recent days
 */
export async function fetchOrderMessagesFromGmail(
  accessToken: string,
  daysBack = 14
): Promise<Array<EmailMessagePayload & { messageId: string }>> {
  // Query: Indian & Global merchants order updates
  const query = `from:(amazon.in OR amazon.com OR flipkart.com OR myntra.com OR meesho.com OR ajio.com OR delhivery.com OR bluedart.com) newer_than:${daysBack}d`;

  const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=20`;

  const listRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!listRes.ok) {
    const errText = await listRes.text();
    throw new Error(`Failed to query Gmail messages (${listRes.status}): ${errText}`);
  }

  const listData = await listRes.json();
  const messages: Array<{ id: string; threadId: string }> = listData.messages || [];

  if (messages.length === 0) {
    return [];
  }

  const parsedEmails: Array<EmailMessagePayload & { messageId: string }> = [];

  // Fetch full message bodies in parallel (batch size: 5)
  for (let i = 0; i < messages.length; i += 5) {
    const chunk = messages.slice(i, i + 5);
    const chunkPromises = chunk.map(async (msg) => {
      try {
        const getUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`;
        const getRes = await fetch(getUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!getRes.ok) return null;

        const detail = await getRes.json();
        const headers: Array<{ name: string; value: string }> = detail.payload?.headers || [];

        const getHeader = (name: string) =>
          headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || "";

        const from = getHeader("From");
        const subject = getHeader("Subject");
        const date = getHeader("Date");

        // Extract body text
        const { text, html } = extractBodyFromPayload(detail.payload);

        return {
          messageId: msg.id,
          from,
          subject,
          date,
          bodyText: text,
          bodyHtml: html,
        };
      } catch {
        return null;
      }
    });

    const results = await Promise.all(chunkPromises);
    for (const r of results) {
      if (r) parsedEmails.push(r);
    }
  }

  return parsedEmails;
}

function extractBodyFromPayload(payload: {
  mimeType?: string;
  body?: { data?: string };
  parts?: Array<unknown>;
}): { text: string; html: string } {
  let text = "";
  let html = "";

  if (!payload) return { text, html };

  if (payload.body?.data) {
    const decoded = decodeBase64Url(payload.body.data);
    if (payload.mimeType === "text/html") {
      html += decoded;
    } else {
      text += decoded;
    }
  }

  if (Array.isArray(payload.parts)) {
    for (const part of payload.parts as Array<{
      mimeType?: string;
      body?: { data?: string };
      parts?: Array<unknown>;
    }>) {
      const sub = extractBodyFromPayload(part);
      if (sub.text) text += "\n" + sub.text;
      if (sub.html) html += "\n" + sub.html;
    }
  }

  return { text: text.trim(), html: html.trim() };
}

function decodeBase64Url(base64Url: string): string {
  try {
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return Buffer.from(base64, "base64").toString("utf-8");
  } catch {
    return "";
  }
}
