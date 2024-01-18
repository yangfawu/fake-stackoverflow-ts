import { readFileSync } from "fs"

export const PRIVATE_KEY = readFileSync(`./private.pem`, "utf8")
export const PUBLIC_KEY = readFileSync(`./public.pem`, "utf8")
export const JWT_ALGO = "RS256"
