import { createDb } from "./client.js";
import { companies, agents, projects, issues } from "./schema/index.js";

const url = process.env.DATABASE_URL || "postgres://agilo:agilo@127.0.0.1:54329/agilo";

const db = createDb(url);

console.log("Seeding database...");

const [company] = await db
  .insert(companies)
  .values({
    name: "Light Agilo Demo",
    description: "A lightweight personal agent manager",
    status: "active",
    budgetMonthlyCents: 50000,
  })
  .returning();

const [ceo] = await db
  .insert(agents)
  .values({
    companyId: company!.id,
    name: "Orchestrator Agent",
    role: "ceo",
    title: "Orchestrator",
    status: "idle",
    adapterType: "process",
    adapterConfig: { command: "echo", args: ["hello from ceo"] },
    budgetMonthlyCents: 15000,
  })
  .returning();

const [engineer] = await db
  .insert(agents)
  .values({
    companyId: company!.id,
    name: "Engineer Agent",
    role: "engineer",
    title: "Software Engineer",
    status: "idle",
    reportsTo: ceo!.id,
    adapterType: "process",
    adapterConfig: { command: "echo", args: ["hello from engineer"] },
    budgetMonthlyCents: 10000,
  })
  .returning();

const [project] = await db
  .insert(projects)
  .values({
    companyId: company!.id,
    name: "Sample Project",
    description: "Demo project with sample tasks",
    status: "in_progress",
    leadAgentId: ceo!.id,
  })
  .returning();

await db.insert(issues).values([
  {
    companyId: company!.id,
    projectId: project!.id,
    title: "Task 1: Setup",
    description: "Initialize the workspace",
    status: "todo",
    priority: "high",
    assigneeAgentId: engineer!.id,
    createdByAgentId: ceo!.id,
  },
  {
    companyId: company!.id,
    projectId: project!.id,
    title: "Task 2: Implementation",
    description: "Implement core features",
    status: "backlog",
    priority: "medium",
    createdByAgentId: ceo!.id,
  },
]);

console.log("Seed complete");
process.exit(0);
