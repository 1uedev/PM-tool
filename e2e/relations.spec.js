import { test, expect } from "@playwright/test";
import { login, ALICE } from "./helpers/auth.js";

const TS = Date.now();

async function createArtifact(page, projectId, type, title) {
  const res = await page.request.post(`/api/projects/${projectId}/artifacts`, {
    data: { type, title },
  });
  expect(res.ok()).toBeTruthy();
  return (await res.json()).data;
}

test.describe("Relations + Traceability", () => {
  let projectId;
  let personaId;
  let visionId;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await login(page, ALICE.email, ALICE.password);

    const projRes = await page.request.post("/api/projects", {
      data: { name: `Relations Project ${TS}` },
    });
    expect(projRes.ok()).toBeTruthy();
    projectId = (await projRes.json()).data.id;

    const persona = await createArtifact(page, projectId, "USER_PERSONA", `Persona ${TS}`);
    const vision = await createArtifact(page, projectId, "PRODUCT_VISION", `Vision ${TS}`);
    personaId = persona.id;
    visionId = vision.id;

    await context.close();
  });

  test("adds a relation via the relation dialog and it appears in the list", async ({ page }) => {
    await login(page, ALICE.email, ALICE.password);
    await page.goto(`/projects/${projectId}?artifact=${visionId}`);

    // Wait for the Verknüpfungen section to load — exact match avoids "Lade Verknüpfungen…"
    await expect(page.getByText("Verknüpfungen", { exact: true })).toBeVisible({ timeout: 10_000 });

    // Click the RelationList "Hinzufügen" button (ArtifactRefField uses aria-label="Verknüpfung hinzufügen")
    await page.getByRole("button", { name: "Hinzufügen", exact: true }).click();

    // The RelationAddDialog renders as a fixed overlay with heading "Verknüpfung anlegen"
    await expect(page.getByText("Verknüpfung anlegen")).toBeVisible();

    // Select the persona from the artifact dropdown (native <select>) by value = artifact ID
    const targetSelect = page.locator("select").first();
    await targetSelect.selectOption({ value: personaId });

    // Submit
    await page.getByRole("button", { name: "Verknüpfen" }).click();

    // Dialog closes and the persona appears in the relations list
    await expect(page.getByText("Verknüpfung anlegen")).not.toBeVisible();
    await expect(page.getByText(`Persona ${TS}`).first()).toBeVisible({ timeout: 10_000 });
  });

  test("relation is visible in the traceability view", async ({ page }) => {
    await login(page, ALICE.email, ALICE.password);
    await page.goto(`/projects/${projectId}/traceability`);

    // Both artifact titles should appear — use first() to avoid strict-mode on repeated renderings
    await expect(page.getByText(`Vision ${TS}`).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(`Persona ${TS}`).first()).toBeVisible({ timeout: 10_000 });
  });
});
