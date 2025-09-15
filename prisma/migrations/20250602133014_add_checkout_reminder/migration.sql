-- CreateTable
CREATE TABLE "CheckoutReminder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "checkoutId" TEXT NOT NULL,
    "remindedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutReminder_checkoutId_key" ON "CheckoutReminder"("checkoutId");
