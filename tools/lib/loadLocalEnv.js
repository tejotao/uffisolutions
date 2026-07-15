// Shared by tools/*.js — Vite only injects VITE_-prefixed vars into
// import.meta.env for client code; these plain Node build scripts need them
// in process.env instead. Vercel already exposes project env vars that way
// during the build step; for local builds, fall back to reading .env.local
// directly from the project root. Resolved via process.cwd() rather than
// this file's own __dirname — every tools/*.js script is always run from
// the project root via npm, so this avoids baking in a relative-path depth
// that would break if this shared file ever moves.
import fs from 'fs';
import path from 'path';

export function loadLocalEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] === undefined) {
      process.env[key] = rawValue.replace(/^["']|["']$/g, '');
    }
  }
}
