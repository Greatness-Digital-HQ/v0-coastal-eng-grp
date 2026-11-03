import { randomBytes, scrypt, timingSafeEqual } from "node:crypto"

// Password hashing with Node's built-in scrypt, so there's no extra native
// dependency. Stored as scrypt$N$r$p$salt$hash (base64url). scripts/migrate.mjs
// writes the same format for the first owner password.

const N = 16384
const R = 8
const P = 1
const KEYLEN = 64
export const MIN_PASSWORD = 10

function derive(password: string, salt: Buffer, n: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password.normalize("NFKC"), salt, KEYLEN, { N: n, r, p, maxmem: 64 * 1024 * 1024 }, (err, key) => (err ? reject(err) : resolve(key))),
  )
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await derive(password, salt, N, R, P)
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64url")}$${key.toString("base64url")}`
}

export async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  if (!stored) return false
  const [kind, n, r, p, salt, hash] = stored.split("$")
  if (kind !== "scrypt" || !salt || !hash) return false
  const expected = Buffer.from(hash, "base64url")
  const key = await derive(password, Buffer.from(salt, "base64url"), Number(n), Number(r), Number(p))
  return key.length === expected.length && timingSafeEqual(key, expected)
}

/** Null when the password is acceptable, otherwise what to tell the person. */
export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD) return `Use at least ${MIN_PASSWORD} characters.`
  if (password.length > 200) return "That password is too long."
  if (/^(.)\1+$/.test(password)) return "Choose a less predictable password."
  return null
}
