-- CreateTable
CREATE TABLE "image_tag" (
    "id" SERIAL NOT NULL,
    "tagName" VARCHAR(127) NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "image_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_imageToimage_tag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_imageToimage_tag_AB_unique" ON "_imageToimage_tag"("A", "B");

-- CreateIndex
CREATE INDEX "_imageToimage_tag_B_index" ON "_imageToimage_tag"("B");

-- AddForeignKey
ALTER TABLE "_imageToimage_tag" ADD CONSTRAINT "_imageToimage_tag_A_fkey" FOREIGN KEY ("A") REFERENCES "image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_imageToimage_tag" ADD CONSTRAINT "_imageToimage_tag_B_fkey" FOREIGN KEY ("B") REFERENCES "image_tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
