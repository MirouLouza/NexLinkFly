-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MessageConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "message" TEXT,
    "defaultMes" TEXT
);
INSERT INTO "new_MessageConfig" ("id", "message", "shop") SELECT "id", "message", "shop" FROM "MessageConfig";
DROP TABLE "MessageConfig";
ALTER TABLE "new_MessageConfig" RENAME TO "MessageConfig";
CREATE UNIQUE INDEX "MessageConfig_shop_key" ON "MessageConfig"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
