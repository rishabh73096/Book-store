import { createHash } from "crypto";

// Node-only (uses `crypto`) — import this from API routes/controllers, never from middleware.
// Only a hash of a refresh/reset token is persisted, so a leaked DB never yields a usable token.
export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
