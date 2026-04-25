import fs from "node:fs";
import path from "node:path";

const PRISMA_DIR = path.join(process.cwd(), "prisma");
const DB_PATH = path.join(PRISMA_DIR, "dev.db");

if (!fs.existsSync(PRISMA_DIR)) {
  fs.mkdirSync(PRISMA_DIR, { recursive: true });
  console.log("Created prisma directory");
}

if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, "");
  console.log("Created empty dev.db");
}
