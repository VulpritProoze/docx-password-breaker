import { readFile } from "node:fs/promises";
import { OfficeFile } from "office-crypto";

export async function decrypt(filePath, password) {
  try {
    const buffer = await readFile(filePath);
    const file = OfficeFile(buffer);
    file.loadKey({ password, verifyPassword: true });
    const decrypted = file.decrypt();
    return { ok: true, result: decrypted };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message };
  }
}
