import { test, expect } from "@playwright/test";
import { login, ALICE } from "./helpers/auth.js";

const TS = Date.now();
const PROJECT_NAME = `E2E Projekt ${TS}`;
const ARTIFACT_TITLE = `Test Persona ${TS}`;

test.describe("Project + Artifact CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ALICE.email, ALICE.password);
  });

  test("creates a new project and lands on starter page", async ({ page }) => {
    await page.getByRole("link", { name: /neues projekt/i }).click();
    await page.getByPlaceholder(/smart home/i).fill(PROJECT_NAME);
    await page.getByRole("button", { name: /projekt erstellen/i }).click();
    await page.waitForURL("**/starter");
    // Project name appears in the ProjectNavBar breadcrumb
    await expect(page.getByText(PROJECT_NAME).first()).toBeVisible();
  });

  test("creates a USER_PERSONA artifact via the new-artifact form", async ({ page }) => {
    const projRes = await page.request.post("/api/projects", {
      data: { name: PROJECT_NAME + " art" },
    });
    expect(projRes.ok()).toBeTruthy();
    const projectId = (await projRes.json()).data.id;

    // Navigate to the Explorer with the new-artifact panel (?new=TYPE)
    await page.goto(`/projects/${projectId}?new=USER_PERSONA`);
    await page.getByPlaceholder(/nutzer-persona benennen/i).fill(ARTIFACT_TITLE);
    await page.getByRole("button", { name: /artefakt erstellen/i }).click();

    // After creation, URL changes to ?artifact=<id>
    // URL changes to ?artifact=<id>; form switches to edit mode with the saved title
    await page.waitForURL(/artifact=/);
    const titleInput = page.getByPlaceholder(/nutzer-persona benennen/i);
    await expect(titleInput).toBeVisible({ timeout: 15_000 });
    await expect(titleInput).toHaveValue(ARTIFACT_TITLE);
  });

  test("edits an artifact, saves, and version history appears", async ({ page }) => {
    // Create project + artifact via API for a clean, predictable state
    const projRes = await page.request.post("/api/projects", {
      data: { name: PROJECT_NAME + " edit" },
    });
    const projectId = (await projRes.json()).data.id;

    const artRes = await page.request.post(`/api/projects/${projectId}/artifacts`, {
      data: { type: "USER_PERSONA", title: ARTIFACT_TITLE },
    });
    expect(artRes.ok()).toBeTruthy();
    const artifactId = (await artRes.json()).data.id;

    // Open the artifact in the Explorer
    await page.goto(`/projects/${projectId}?artifact=${artifactId}`);
    const titleInput = page.getByPlaceholder(/nutzer-persona benennen/i);
    await expect(titleInput).toBeVisible({ timeout: 10_000 });
    await expect(titleInput).toHaveValue(ARTIFACT_TITLE);

    // Edit title and save
    await titleInput.fill(ARTIFACT_TITLE + " v2");
    await page.getByRole("button", { name: /^speichern$/i }).click();
    await expect(page.getByText(/gespeichert/i)).toBeVisible();

    // Expand version history — entries are labelled "v1", "v2", etc.
    await page.getByText("Versionshistorie").click();
    await expect(page.locator("text=/v\\d+/").first()).toBeVisible({ timeout: 10_000 });
  });

  test("artifact appears in the explorer tree", async ({ page }) => {
    const projRes = await page.request.post("/api/projects", {
      data: { name: PROJECT_NAME + " tree" },
    });
    const projectId = (await projRes.json()).data.id;

    await page.request.post(`/api/projects/${projectId}/artifacts`, {
      data: { type: "USER_PERSONA", title: ARTIFACT_TITLE + " tree" },
    });

    await page.goto(`/projects/${projectId}`);
    await expect(page.getByText(ARTIFACT_TITLE + " tree")).toBeVisible({ timeout: 10_000 });
  });

  test("soft-deleted artifact disappears from the explorer tree", async ({ page }) => {
    const projRes = await page.request.post("/api/projects", {
      data: { name: PROJECT_NAME + " del" },
    });
    const projectId = (await projRes.json()).data.id;

    const artRes = await page.request.post(`/api/projects/${projectId}/artifacts`, {
      data: { type: "USER_PERSONA", title: ARTIFACT_TITLE + " del" },
    });
    const artifactId = (await artRes.json()).data.id;

    await page.goto(`/projects/${projectId}?artifact=${artifactId}`);
    await expect(page.getByTitle("Artefakt löschen")).toBeVisible({ timeout: 10_000 });

    // Click delete → confirm
    await page.getByTitle("Artefakt löschen").click();
    await page.getByRole("button", { name: "Löschen", exact: true }).click();

    // After deletion, artifact title is gone from the tree
    await expect(
      page.getByRole("button", { name: ARTIFACT_TITLE + " del" })
    ).not.toBeVisible({ timeout: 10_000 });
  });
});
