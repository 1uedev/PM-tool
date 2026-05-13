/**
 * Verifies the dev server is reachable before running the E2E suite.
 * If you want a fully clean database, run `npm run db:reset` manually first.
 */
export default async function globalSetup() {
  const maxAttempts = 10;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch("http://localhost:3000/login");
      if (res.ok) return;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Dev server at http://localhost:3000 did not respond after 10s. Run `npm run dev` first.");
}
