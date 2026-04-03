import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  listPiSkills,
  syncPiSkills,
} from "@agilo/adapter-pi-local/server";

async function makeTempDir(prefix: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

describe("pi local skill sync", () => {
  const agiloKey = "agilo/agilo/agilo";
  const cleanupDirs = new Set<string>();

  afterEach(async () => {
    await Promise.all(Array.from(cleanupDirs).map((dir) => fs.rm(dir, { recursive: true, force: true })));
    cleanupDirs.clear();
  });

  it("reports configured Agilo skills and installs them into the Pi skills home", async () => {
    const home = await makeTempDir("agilo-pi-skill-sync-");
    cleanupDirs.add(home);

    const ctx = {
      agentId: "agent-1",
      companyId: "company-1",
      adapterType: "pi_local",
      config: {
        env: {
          HOME: home,
        },
        agiloSkillSync: {
          desiredSkills: [agiloKey],
        },
      },
    } as const;

    const before = await listPiSkills(ctx);
    expect(before.mode).toBe("persistent");
    expect(before.desiredSkills).toContain(agiloKey);
    expect(before.entries.find((entry) => entry.key === agiloKey)?.required).toBe(true);
    expect(before.entries.find((entry) => entry.key === agiloKey)?.state).toBe("missing");

    const after = await syncPiSkills(ctx, [agiloKey]);
    expect(after.entries.find((entry) => entry.key === agiloKey)?.state).toBe("installed");
    expect((await fs.lstat(path.join(home, ".pi", "agent", "skills", "agilo"))).isSymbolicLink()).toBe(true);
  });

  it("keeps required bundled Agilo skills installed even when the desired set is emptied", async () => {
    const home = await makeTempDir("agilo-pi-skill-prune-");
    cleanupDirs.add(home);

    const configuredCtx = {
      agentId: "agent-2",
      companyId: "company-1",
      adapterType: "pi_local",
      config: {
        env: {
          HOME: home,
        },
        agiloSkillSync: {
          desiredSkills: [agiloKey],
        },
      },
    } as const;

    await syncPiSkills(configuredCtx, [agiloKey]);

    const clearedCtx = {
      ...configuredCtx,
      config: {
        env: {
          HOME: home,
        },
        agiloSkillSync: {
          desiredSkills: [],
        },
      },
    } as const;

    const after = await syncPiSkills(clearedCtx, []);
    expect(after.desiredSkills).toContain(agiloKey);
    expect(after.entries.find((entry) => entry.key === agiloKey)?.state).toBe("installed");
    expect((await fs.lstat(path.join(home, ".pi", "agent", "skills", "agilo"))).isSymbolicLink()).toBe(true);
  });
});
