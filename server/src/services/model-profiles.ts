import { eq, sql } from "drizzle-orm";
import type { Db } from "@paperclipai/db";
import { modelProfiles } from "@paperclipai/db";

export interface CreateModelProfileInput {
  name: string;
  provider: string;
  tier?: string;
  capabilities?: Record<string, unknown>;
  inputCostPerMillionTokens?: number;
  outputCostPerMillionTokens?: number;
  isActive?: boolean;
}

export interface UpdateModelProfileInput {
  name?: string;
  provider?: string;
  tier?: string;
  capabilities?: Record<string, unknown>;
  inputCostPerMillionTokens?: number;
  outputCostPerMillionTokens?: number;
  isActive?: boolean;
}

export function modelProfileService(db: Db) {
  return {
    async create(input: CreateModelProfileInput) {
      const [profile] = await db
        .insert(modelProfiles)
        .values({
          name: input.name,
          provider: input.provider,
          tier: input.tier ?? "standard",
          capabilities: input.capabilities ?? {},
          inputCostPerMillionTokens: input.inputCostPerMillionTokens ?? 0,
          outputCostPerMillionTokens: input.outputCostPerMillionTokens ?? 0,
          isActive: input.isActive ?? true,
        })
        .returning();
      return profile;
    },

    async getById(id: string) {
      const [profile] = await db
        .select()
        .from(modelProfiles)
        .where(eq(modelProfiles.id, id));
      return profile || null;
    },

    async list(filters?: { provider?: string; isActive?: boolean }) {
      let query = db.select().from(modelProfiles);

      if (filters?.provider) {
        query = query.where(eq(modelProfiles.provider, filters.provider));
      }

      if (filters?.isActive !== undefined) {
        query = query.where(eq(modelProfiles.isActive, filters.isActive));
      }

      return query.orderBy(modelProfiles.name);
    },

    async update(id: string, input: UpdateModelProfileInput) {
      const updates: Record<string, unknown> = {};

      if (input.name !== undefined) updates.name = input.name;
      if (input.provider !== undefined) updates.provider = input.provider;
      if (input.tier !== undefined) updates.tier = input.tier;
      if (input.capabilities !== undefined) updates.capabilities = input.capabilities;
      if (input.inputCostPerMillionTokens !== undefined)
        updates.inputCostPerMillionTokens = input.inputCostPerMillionTokens;
      if (input.outputCostPerMillionTokens !== undefined)
        updates.outputCostPerMillionTokens = input.outputCostPerMillionTokens;
      if (input.isActive !== undefined) updates.isActive = input.isActive;

      updates.updatedAt = sql`now()`;

      if (Object.keys(updates).length === 1) {
        return this.getById(id);
      }

      const [profile] = await db
        .update(modelProfiles)
        .set(updates)
        .where(eq(modelProfiles.id, id))
        .returning();

      return profile || null;
    },

    async delete(id: string) {
      await db.delete(modelProfiles).where(eq(modelProfiles.id, id));
    },
  };
}

export type ModelProfileService = ReturnType<typeof modelProfileService>;
