import { GLOBAL_COMPANY_ID } from "@agilo/shared";
import { Router } from "express";
import type { Db } from "@agilo/db";
import { dashboardService } from "../services/dashboard.js";
import { assertCompanyAccess } from "./authz.js";

export function dashboardRoutes(db: Db) {
  const router = Router();
  const svc = dashboardService(db);

  router.get("/dashboard", async (req, res) => {
    const companyId = GLOBAL_COMPANY_ID;
    assertCompanyAccess(req, companyId);
    const summary = await svc.summary(companyId);
    res.json(summary);
  });

  return router;
}
