import { test, expect } from "@playwright/test";
import { login, ADMIN } from "./helpers/auth.js";

test.describe("Authentication", () => {
  test("redirects unauthenticated users to /login", async ({ page }) => {
    await page.goto("/projects");
    await page.waitForURL("**/login**");
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows validation errors when fields are empty", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Anmelden" }).click();
    await expect(page.getByText("E-Mail ist erforderlich")).toBeVisible();
  });

  test("shows error for wrong credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("name@beispiel.de").fill("wrong@example.com");
    await page.getByPlaceholder("••••••••").fill("wrongpassword");
    await page.getByRole("button", { name: "Anmelden" }).click();
    await expect(page.getByText(/ungültig/i)).toBeVisible();
  });

  test("logs in and redirects to /projects", async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await expect(page).toHaveURL(/\/projects/);
  });

  test("logs out and redirects to /login", async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    // Click logout button in sidebar
    await page.getByRole("button", { name: /abmelden/i }).click();
    await page.waitForURL("**/login**");
    await expect(page).toHaveURL(/\/login/);
  });
});
