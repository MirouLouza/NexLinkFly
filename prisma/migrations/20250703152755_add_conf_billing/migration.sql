-- CreateTable
CREATE TABLE "ConfBilling" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "limitBasic" INTEGER DEFAULT 20,
    "limitPro" INTEGER DEFAULT 100,
    "limitGold" INTEGER DEFAULT 400,
    "limitAdvanced" INTEGER DEFAULT 1000
);
