import { promises as fs } from "node:fs";
import path from "node:path";

export async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readTextFile(filePath) {
  return fs.readFile(filePath, "utf8");
}

export async function writeTextFileSafe(filePath, content, { force = false, dryRun = false } = {}) {
  const existed = await pathExists(filePath);

  if (existed) {
    const existing = await readTextFile(filePath);
    if (existing === content) {
      return { status: "skipped", filePath };
    }
    if (!force) {
      return { status: "conflict", filePath };
    }
    if (!dryRun) {
      await ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, content);
    }
    return { status: "updated", filePath };
  }

  if (!dryRun) {
    await ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content);
  }
  return { status: "created", filePath };
}

export async function writeJsonFileSafe(filePath, value, { dryRun = false } = {}) {
  const content = `${JSON.stringify(value, null, 2)}\n`;
  if (!dryRun) {
    await ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content);
  }
  return { status: "created", filePath, content };
}
