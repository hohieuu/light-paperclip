import fs from "node:fs";
import { agiloConfigSchema, type AgiloConfig } from "@agilo/shared";
import { resolveAgiloConfigPath } from "./paths.js";

export function readConfigFile(): AgiloConfig | null {
  const configPath = resolveAgiloConfigPath();

  if (!fs.existsSync(configPath)) return null;

  try {
    const raw = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    return agiloConfigSchema.parse(raw);
  } catch {
    return null;
  }
}
