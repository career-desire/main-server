import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import crypto from "crypto";
import { join } from "path";

// Setup LowDB with file path
const file = join(process.cwd(), "gemini-cache.json");
const adapter = new JSONFile(file);
const db = new Low(adapter, { cache: {} });

// Initialize DB once at startup
await db.read();
db.data ||= { cache: {} };

// Helper: SHA256 hash of prompt
export const hashPrompt = (prompt) =>
  crypto.createHash("sha256").update(prompt).digest("hex");

// Get from cache
export const getCached = async (prompt) => {
  const key = hashPrompt(prompt);
  await db.read();
  return db.data.cache[key];
};

// Set to cache
export const setCached = async (prompt, response) => {
  const key = hashPrompt(prompt);
  db.data.cache[key] = response;
  await db.write();
};