-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlanOption" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "plan" TEXT,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maxReminders" INTEGER DEFAULT 20,
    "cptReminders" INTEGER,
    "maxTestSend" INTEGER DEFAULT 3,
    "cptTestSend" INTEGER
);
INSERT INTO "new_PlanOption" ("cptReminders", "cptTestSend", "id", "maxReminders", "maxTestSend", "plan", "shop") SELECT "cptReminders", "cptTestSend", "id", "maxReminders", "maxTestSend", "plan", "shop" FROM "PlanOption";
DROP TABLE "PlanOption";
ALTER TABLE "new_PlanOption" RENAME TO "PlanOption";
CREATE UNIQUE INDEX "PlanOption_shop_key" ON "PlanOption"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
