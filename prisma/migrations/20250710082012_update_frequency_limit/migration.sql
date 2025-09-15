-- AlterTable
ALTER TABLE "ConfBilling" ADD COLUMN "limitTest" INTEGER DEFAULT 5;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Frequency" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "time" TEXT,
    "days" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "maxReminders" INTEGER DEFAULT 10,
    "intervalHours" INTEGER,
    "useInterval" BOOLEAN DEFAULT false
);
INSERT INTO "new_Frequency" ("createdAt", "days", "id", "intervalHours", "maxReminders", "shop", "time", "updatedAt", "useInterval") SELECT "createdAt", "days", "id", "intervalHours", "maxReminders", "shop", "time", "updatedAt", "useInterval" FROM "Frequency";
DROP TABLE "Frequency";
ALTER TABLE "new_Frequency" RENAME TO "Frequency";
CREATE UNIQUE INDEX "Frequency_shop_key" ON "Frequency"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
