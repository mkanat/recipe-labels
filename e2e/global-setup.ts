import { createClient } from "@libsql/client";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const TEST_USER_ID = "test-user-e2e-001";
export const TEST_USER_EMAIL = "e2e-test@recipe-labels.test";
export const TEST_SESSION_TOKEN = "e2e-test-session-token-001";
export const STORAGE_STATE_PATH = path.resolve(__dirname, ".auth-state.json");

/**
 * Sign a cookie value using the same HMAC-SHA-256 algorithm as better-call's
 * serializeSignedCookie / signCookieValue. The resulting format is:
 *   encodeURIComponent("{value}.{base64-hmac-sha256}")
 */
async function signCookieValue(value: string, secret: string): Promise<string> {
  const secretBuf = new TextEncoder().encode(secret);
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    secretBuf,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await globalThis.crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  const base64Sig = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return encodeURIComponent(`${value}.${base64Sig}`);
}

async function globalSetup() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL is not set");

  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET is not set");

  const client = createClient({ url: dbUrl });
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + 60 * 60 * 24 * 7; // 1 week

  // Upsert test user
  await client.execute({
    sql: `INSERT OR REPLACE INTO user (id, name, email, emailVerified, createdAt, updatedAt)
          VALUES (?, ?, ?, 1, ?, ?)`,
    args: [TEST_USER_ID, "E2E Test User", TEST_USER_EMAIL, now, now],
  });

  // Upsert test session
  await client.execute({
    sql: `INSERT OR REPLACE INTO session (id, expiresAt, token, createdAt, updatedAt, userId)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: ["e2e-session-001", expiresAt, TEST_SESSION_TOKEN, now, now, TEST_USER_ID],
  });

  // Sign the session token the same way better-auth does (HMAC-SHA-256 via better-call)
  const signedToken = await signCookieValue(TEST_SESSION_TOKEN, secret);

  // Write Playwright storage state with the properly signed session cookie
  const storageState = {
    cookies: [
      {
        name: "better-auth.session_token",
        value: signedToken,
        domain: "localhost",
        path: "/",
        expires: expiresAt,
        httpOnly: true,
        secure: false,
        sameSite: "Lax" as const,
      },
    ],
    origins: [],
  };

  fs.writeFileSync(STORAGE_STATE_PATH, JSON.stringify(storageState, null, 2));

  client.close();
}

export default globalSetup;
