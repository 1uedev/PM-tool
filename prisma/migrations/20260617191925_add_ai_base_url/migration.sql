-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AiConfig" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "provider" TEXT NOT NULL DEFAULT 'disabled',
    "model" TEXT NOT NULL DEFAULT '',
    "apiKey" TEXT NOT NULL DEFAULT '',
    "baseUrl" TEXT NOT NULL DEFAULT '',
    "timeoutMs" INTEGER NOT NULL DEFAULT 30000,
    "maxTokens" INTEGER NOT NULL DEFAULT 2048,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AiConfig" ("apiKey", "id", "maxTokens", "model", "provider", "timeoutMs", "updatedAt") SELECT "apiKey", "id", "maxTokens", "model", "provider", "timeoutMs", "updatedAt" FROM "AiConfig";
DROP TABLE "AiConfig";
ALTER TABLE "new_AiConfig" RENAME TO "AiConfig";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
