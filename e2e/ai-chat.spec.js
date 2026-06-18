import { test, expect } from "@playwright/test";
import { login, ALICE } from "./helpers/auth.js";

const TS = Date.now();
const NEW_VALUE = `E2E neuer Aktionswert ${TS}`;

// The chat (LLM) response is stubbed for determinism; the apply call goes
// through the real DB so we can verify the update + version entry.
test.describe("AI content chat", () => {
  let projectId;
  let artifactId;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await login(page, ALICE.email, ALICE.password);

    const projRes = await page.request.post("/api/projects", {
      data: { name: `AI Chat Project ${TS}` },
    });
    expect(projRes.ok()).toBeTruthy();
    projectId = (await projRes.json()).data.id;

    const artRes = await page.request.post(`/api/projects/${projectId}/artifacts`, {
      data: { type: "USER_STORY", title: `Story ${TS}` },
    });
    expect(artRes.ok()).toBeTruthy();
    artifactId = (await artRes.json()).data.id;

    await context.close();
  });

  test("open chat, get a proposal, apply it, and see a versioned AI_CHAT change", async ({ page }) => {
    // Stub only the chat turn (not /chat/apply).
    await page.route("**/artifacts/*/chat", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            reply: "Dieser Inhalt wurde aus den Story-Feldern erzeugt. Hier ein Vorschlag.",
            proposal: { field: "action", newValue: NEW_VALUE, rationale: "Konkreter formuliert." },
            durationMs: 1,
          },
        }),
      })
    );

    await login(page, ALICE.email, ALICE.password);
    await page.goto(`/projects/${projectId}?artifact=${artifactId}`);

    // Open the chat panel
    await page.getByRole("button", { name: "Mit KI besprechen" }).click();
    await expect(page.getByText("KI-Chat", { exact: true })).toBeVisible();

    // Send a message
    await page.getByPlaceholder(/Frage etwas zu diesem Inhalt/i).fill("Warum dieser Inhalt?");
    await page.getByRole("button", { name: "Senden" }).click();

    // The proposal card + new value appear
    await expect(page.getByText("Änderungsvorschlag", { exact: false })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(NEW_VALUE)).toBeVisible();

    // Apply the change
    await page.getByRole("button", { name: "Übernehmen" }).click();

    // Applied confirmation in the chat
    await expect(page.getByText(/übernommen/i).first()).toBeVisible({ timeout: 10_000 });

    // Verify via API: field updated + a version tagged AI_CHAT exists
    const artRes = await page.request.get(`/api/projects/${projectId}/artifacts/${artifactId}`);
    expect(artRes.ok()).toBeTruthy();
    const artifact = (await artRes.json()).data;
    expect(artifact.fields.action).toBe(NEW_VALUE);

    const versRes = await page.request.get(
      `/api/projects/${projectId}/artifacts/${artifactId}/versions`
    );
    expect(versRes.ok()).toBeTruthy();
    const versions = (await versRes.json()).data;
    expect(versions.some((v) => v.source === "AI_CHAT")).toBeTruthy();
  });
});
