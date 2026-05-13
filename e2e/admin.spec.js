import { test, expect } from "@playwright/test";
import { login, ADMIN } from "./helpers/auth.js";

const TS = Date.now();
const NEW_USER_EMAIL = `e2e-${TS}@example.com`;
const NEW_USER_PASSWORD = "testpass123";
const NEW_USER_NAME = `E2E User ${TS}`;

test.describe("Admin — User Management", () => {
  test("admin can navigate to /admin/users", async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.goto("/admin/users");
    await expect(page.getByText("Benutzerverwaltung")).toBeVisible();
  });

  test("non-admin is redirected away from /admin/users", async ({ page }) => {
    await login(page, "alice@example.com", "password123");
    await page.goto("/admin/users");
    // Should redirect to /projects (not admin page)
    await page.waitForURL("**/projects");
    await expect(page).toHaveURL(/\/projects/);
  });

  test("admin creates a new user who can then log in", async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.goto("/admin/users/new");

    // Fill user creation form — use exact: true to avoid partial-match on "max@beispiel.de"
    await page.getByPlaceholder("Max", { exact: true }).fill(NEW_USER_NAME.split(" ")[0]);
    await page.getByPlaceholder("Mustermann", { exact: true }).fill(NEW_USER_NAME.split(" ").slice(1).join(" "));
    await page.getByPlaceholder("max@beispiel.de", { exact: true }).fill(NEW_USER_EMAIL);
    await page.getByPlaceholder(/mindestens 8/i).fill(NEW_USER_PASSWORD);
    await page.getByRole("button", { name: "Benutzer anlegen" }).click();

    // Redirects back to /admin/users and shows the new user in the list
    await page.waitForURL("**/admin/users");
    await expect(page.getByText(NEW_USER_EMAIL)).toBeVisible();
  });

  test("newly created user can log in", async ({ page }) => {
    await login(page, NEW_USER_EMAIL, NEW_USER_PASSWORD);
    await expect(page).toHaveURL(/\/projects/);
  });

  test("newly created user sees empty projects list", async ({ page }) => {
    await login(page, NEW_USER_EMAIL, NEW_USER_PASSWORD);
    await page.goto("/projects");
    // New user has no projects yet
    await expect(page.getByText(/noch keine projekte/i)).toBeVisible({ timeout: 10_000 });
  });
});
