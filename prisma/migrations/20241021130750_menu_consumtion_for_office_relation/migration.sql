-- CreateTable
CREATE TABLE "_MenuForConsumption" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_MenuForConsumption_AB_unique" ON "_MenuForConsumption"("A", "B");

-- CreateIndex
CREATE INDEX "_MenuForConsumption_B_index" ON "_MenuForConsumption"("B");

-- AddForeignKey
ALTER TABLE "_MenuForConsumption" ADD CONSTRAINT "_MenuForConsumption_A_fkey" FOREIGN KEY ("A") REFERENCES "branch_office"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuForConsumption" ADD CONSTRAINT "_MenuForConsumption_B_fkey" FOREIGN KEY ("B") REFERENCES "menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
