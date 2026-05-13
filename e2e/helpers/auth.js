/** Fill the login form and wait for redirect to /projects. */
export async function login(page, email, password) {
  await page.goto("/login");
  await page.getByPlaceholder("name@beispiel.de").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: "Anmelden" }).click();
  await page.waitForURL("**/projects");
}

export const ADMIN = { email: "admin@example.com", password: "password123" };
export const ALICE = { email: "alice@example.com", password: "password123" };
