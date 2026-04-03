import { GLOBAL_COMPANY_ID } from "@agilo/shared";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  listCursorSkills,
  syncCursorSkills,
} from "@agilo/adapter-cursor-local/server";

async function makeTempDir(prefix: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

async function createSkillDir(root: string, name: string) {
  const skillDir = path.join(root, name);
  await fs.mkdir(skillDir, { recursive: true });
  await fs.writeFile(path.join(skillDir, "SKILL.md"), `---\nname: ${name}\n---\n`, "utf8");
  return skillDir;
}

describe("cursor local skill sync", () => {
  const agiloKey = "agilo/agilo/paperclip";
  const cleanupDirs = new Set<string>();

  afterEach(async () => {
    await Promise.all(Array.from(cleanupDirs).map((dir) => fs.rm(dir, { recursive: true, force: true })));
    cleanupDirs.clear();
  });

  it("reports configured Agilo skills and installs them into the Cursor skills home", async () => {
    const home = await makeTempDir("agilo-cursor-skill-sync-");
    cleanupDirs.add(home);

    const ctx = {
      agentId: "agent-1",
      companyId: GLOBAL_COMPANY_ID,
      adapterType: "cursor",
      config: {
        env: {
          HOME: home,
        },
        agiloSkillSync: {
          desiredSkills: [agiloKey],
        },
      },
    } as const;

    const before = await listCursorSkills(ctx); console.log("AGILO ENTRY:", before.entries.find(e => e.key === "agilo/agilo/paperclip"));
    expect(before.mode).toBe("persistent");
    expect(before.desiredSkills).toContain(agiloKey);
    expect(before.entries.find((entry) => entry.key === agiloKey)?.required).toBe(true);
    expect(before.entries.find((entry) => entry.key === agiloKey)?.state).toBe("missing");

    const after = await syncCursorSkills(ctx, [agiloKey]);
    expect(after.entries.find((entry) => entry.key === agiloKey)?.state).toBe("installed");
    expect((await fs.lstat(path.join(home, ".cursor", "skills", "paperclip"))).isSymbolicLink()).toBe(true);
  });

  it("recognizes company-library runtime skills supplied outside the bundled Agilo directory", async () => {
    const home = await makeTempDir("agilo-cursor-runtime-skills-home-");
    const runtimeSkills = await makeTempDir("agilo-cursor-runtime-skills-src-");
    cleanupDirs.add(home);
    cleanupDirs.add(runtimeSkills);

    const agiloDir = await createSkillDir(runtimeSkills, "agilo");
    const asciiHeartDir = await createSkillDir(runtimeSkills, "ascii-heart");

    const ctx = {
      agentId: "agent-3",
      companyId: GLOBAL_COMPANY_ID,
      adapterType: "cursor",
      config: {
        env: {
          HOME: home,
        },
        agiloRuntimeSkills: [
          {
            key: "agilo",
            runtimeName: "agilo",
            source: agiloDir,
            required: true,
            requiredReason: "Bundled Agilo skills are always available for local adapters.",
          },
          {
            key: "ascii-heart",
            runtimeName: "ascii-heart",
            source: asciiHeartDir,
          },
        ],
        agiloSkillSync: {
          desiredSkills: ["ascii-heart"],
        },
      },
    } as const;

    const before = await listCursorSkills(ctx); console.log("AGILO ENTRY:", before.entries.find(e => e.key === "agilo/agilo/paperclip"));
    expect(before.warnings).toEqual([]);
    expect(before.desiredSkills).toEqual(["agilo", "ascii-heart"]);
    expect(before.entries.find((entry) => entry.key === "ascii-heart")?.state).toBe("missing");

    const after = await syncCursorSkills(ctx, ["ascii-heart"]);
    expect(after.warnings).toEqual([]);
    expect(after.entries.find((entry) => entry.key === "ascii-heart")?.state).toBe("installed");
    expect((await fs.lstat(path.join(home, ".cursor", "skills", "ascii-heart"))).isSymbolicLink()).toBe(true);
  });

  it("keeps required bundled Agilo skills installed even when the desired set is emptied", async () => {
    const home = await makeTempDir("agilo-cursor-skill-prune-");
    cleanupDirs.add(home);

    const configuredCtx = {
      agentId: "agent-2",
      companyId: GLOBAL_COMPANY_ID,
      adapterType: "cursor",
      config: {
        env: {
          HOME: home,
        },
        agiloSkillSync: {
          desiredSkills: [agiloKey],
        },
      },
    } as const;

    await syncCursorSkills(configuredCtx, [agiloKey]);

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

    const after = await syncCursorSkills(clearedCtx, []);
    expect(after.desiredSkills).toContain(agiloKey);
    expect(after.entries.find((entry) => entry.key === agiloKey)?.state).toBe("installed");
    expect((await fs.lstat(path.join(home, ".cursor", "skills", "paperclip"))).isSymbolicLink()).toBe(true);
  });
});
