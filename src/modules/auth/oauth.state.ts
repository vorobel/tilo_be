import * as crypto from "crypto";

export function generateState(): string {
    return crypto.randomBytes(32).toString();
}