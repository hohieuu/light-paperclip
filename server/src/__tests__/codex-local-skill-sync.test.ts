import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  listCodexSkills,
  syncCodexSkills,
} from "@agilo/adapter-codex-local/server";

async function makeTempDir(prefix: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

describe("codex local skill sync", () => {
  const agiloKey = "agilo/agilo/agilo";
  const cleanupDirs = new Set<string>();

  afterEach(async () => {
    await Promise.all(Array.from(cleanupDirs).map((dir) => fs.rm(dir, { recursive: true, force: true })));
    cleanupDirs.clear();
  });

  it("reports configured Agilo skills for workspace injection on the next run", async () => {
    const codexHome = await makeTempDir("agilo-codex-skill-sync-");
    cleanupDirs.add(codexHome);

    const ctx = {
      agentId: "agent-1",
      companyId: "company-1",
      adapterType: "codex_local",
      config: {
        env: {
          CODEX_HOME: codexHome,
        },
        agiloSkillSync: {
          desiredSkills: [agiloKey],
        },
      },
    } as const;

    const before = await listCodexSkills(ctx);
    expect(before.mode).toBe("ephemeral");
    expect(before.desiredSkills).toContain(agiloKey);
    expect(before.entries.find((entry) => entry.key === agiloKey)?.required).toBe(true);
    expect(before.entries.find((entry) => entry.key === agiloKey)?.state).toBe("configured");
    expect(before.entries.find((entry) => entry.key === agiloKey)?.detail).toContain("CODEX_HOME/skills/");
  });

  it("does not persist Agilo skills into CODEX_HOME during sync", async () => {
    const codexHome = await makeTempDir("agilo-codex-skill-prune-");
    cleanupDirs.add(codexHome);

    const configuredCtx = {
      agentId: "agent-2",
      companyId: "company-1",
      adapterType: "codex_local",
      config: {
        env: {
          CODEX_HOME: codexHome,
        },
        agiloSkillSync: {
          desiredSkills: [agiloKey],
        },
      },
    } as const;

    const after = await syncCodexSkills(configuredCtx, [agiloKey]);
    expect(after.mode).toBe("ephemeral");
    expect(after.entries.find((entry) => entry.key === agiloKey)?.state).toBe("configured");
    await expect(fs.lstat(path.join(codexHome, "skills", "agilo"))).rejects.toMatchObject({
      code: "ENOENT",
    });
  });

  it("keeps required bundled Agilo skills configured even when the desired set is emptied", async () => {
    const codexHome = await makeTempDir("agilo-codex-skill-required-");
    cleanupDirs.add(codexHome);

    const configuredCtx = {
      agentId: "agent-2",
      companyId: "company-1",
      adapterType: "codex_local",
      config: {
        env: {
          CODEX_HOME: codexHome,
        },
        agiloSkillSync: {
          desiredSkills: [],
        },
      },
    } as const;

    const after = await syncCodexSkills(configuredCtx, []);
    expect(after.desiredSkills).toContain(agiloKey);
    expect(after.entries.find((entry) => entry.key === agiloKey)?.state).toBe("configured");
  });

  it("normalizes legacy flat Agilo skill refs before reporting configured state", async () => {
    const codexHome = await makeTempDir("agilo-codex-legacy-skill-sync-");
    cleanupDirs.add(codexHome);

    const snapshot = await listCodexSkills({
      agentId: "agent-3",
      companyId: "company-1",
      adapterType: "codex_local",
      config: {
        env: {
          CODEX_HOME: codexHome,
        },
        agiloSkillSync: {
          desiredSkills: ["agilo"],
        },
      },
    });

    expect(snapshot.warnings).toEqual([]);
    expect(snapshot.desiredSkills).toContain(agiloKey);
    expect(snapshot.desiredSkills).not.toContain("agilo");
    expect(snapshot.entries.find((entry) => entry.key === agiloKey)?.state).toBe("configured");
    expect(snapshot.entries.find((entry) => entry.key === "agilo")).toBeUndefined();
  });
});
