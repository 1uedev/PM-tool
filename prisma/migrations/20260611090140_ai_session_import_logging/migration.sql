-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AiSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "artifactId" TEXT,
    "projectId" TEXT,
    "userId" TEXT NOT NULL,
    "durationMs" INTEGER,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiSession_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AiSession_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AiSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AiSession" ("artifactId", "createdAt", "durationMs", "id", "mode", "prompt", "provider", "response", "userId") SELECT "artifactId", "createdAt", "durationMs", "id", "mode", "prompt", "provider", "response", "userId" FROM "AiSession";
DROP TABLE "AiSession";
ALTER TABLE "new_AiSession" RENAME TO "AiSession";
CREATE INDEX "AiSession_artifactId_idx" ON "AiSession"("artifactId");
CREATE INDEX "AiSession_projectId_idx" ON "AiSession"("projectId");
CREATE INDEX "AiSession_createdAt_idx" ON "AiSession"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
