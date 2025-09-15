-- AlterTable
ALTER TABLE "Frequency" ADD COLUMN "intervalHours" INTEGER;
ALTER TABLE "Frequency" ADD COLUMN "maxReminders" INTEGER DEFAULT 10;
ALTER TABLE "Frequency" ADD COLUMN "useInterval" BOOLEAN DEFAULT false;
