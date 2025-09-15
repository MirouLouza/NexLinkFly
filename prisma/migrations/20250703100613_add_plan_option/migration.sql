-- CreateTable
CREATE TABLE "PlanOption" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "plan" TEXT,
    "maxReminders" INTEGER DEFAULT 20,
    "cptReminders" INTEGER,
    "maxTestSend" INTEGER DEFAULT 3,
    "cptTestSend" INTEGER
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanOption_shop_key" ON "PlanOption"("shop");
