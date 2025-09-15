-- CreateTable
CREATE TABLE "MessageConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "message" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "MessageConfig_shop_key" ON "MessageConfig"("shop");
