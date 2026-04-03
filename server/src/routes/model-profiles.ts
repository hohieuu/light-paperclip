import { Router } from "express";
import type { Db } from "@agilo/db";
import { modelProfileService } from "../services/model-profiles.js";
import { assertBoard, getActorInfo } from "./authz.js";
import { logActivity } from "../services/index.js";
import { notFound } from "../errors.js";

export function modelProfileRoutes(db: Db) {
  const router = Router();
  const profiles = modelProfileService(db);

  router.get("/model-profiles", async (req, res) => {
    const filters: { provider?: string; isActive?: boolean } = {};

    if (req.query.provider) {
      filters.provider = req.query.provider as string;
    }

    if (req.query.isActive !== undefined) {
      filters.isActive = req.query.isActive === "true";
    }

    const modelProfiles = await profiles.list(filters);
    res.json(modelProfiles);
  });

  router.get("/model-profiles/:id", async (req, res) => {
    const profile = await profiles.getById(req.params.id);
    if (!profile) {
      throw notFound("Model profile not found");
    }
    res.json(profile);
  });

  router.post("/model-profiles", async (req, res) => {
    assertBoard(req);

    const profile = await profiles.create(req.body);

    const actor = getActorInfo(req);
    await logActivity(db, {
      companyId: req.actor.companyId || "",
      actorType: actor.actorType,
      actorId: actor.actorId,
      action: "model_profile.created",
      entityType: "model_profile",
      entityId: profile.id,
      details: { name: profile.name, provider: profile.provider },
    });

    res.status(201).json(profile);
  });

  router.patch("/model-profiles/:id", async (req, res) => {
    assertBoard(req);

    const existing = await profiles.getById(req.params.id);
    if (!existing) {
      throw notFound("Model profile not found");
    }

    const profile = await profiles.update(req.params.id, req.body);

    const actor = getActorInfo(req);
    await logActivity(db, {
      companyId: req.actor.companyId || "",
      actorType: actor.actorType,
      actorId: actor.actorId,
      action: "model_profile.updated",
      entityType: "model_profile",
      entityId: profile!.id,
      details: { changes: req.body },
    });

    res.json(profile);
  });

  router.delete("/model-profiles/:id", async (req, res) => {
    assertBoard(req);

    const existing = await profiles.getById(req.params.id);
    if (!existing) {
      throw notFound("Model profile not found");
    }

    await profiles.delete(req.params.id);

    const actor = getActorInfo(req);
    await logActivity(db, {
      companyId: req.actor.companyId || "",
      actorType: actor.actorType,
      actorId: actor.actorId,
      action: "model_profile.deleted",
      entityType: "model_profile",
      entityId: req.params.id,
      details: { name: existing.name },
    });

    res.status(204).send();
  });

  return router;
}
