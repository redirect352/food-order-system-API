-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('client', 'deliveryman', 'orderIssuing', 'menuModerator', '1CExport', 'admin');

-- CreateTable
CREATE TABLE "branch_office" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(127) NOT NULL,
    "isCanteen" BOOLEAN NOT NULL DEFAULT false,
    "address" VARCHAR(127) NOT NULL,
    "servingCanteenId" INTEGER,

    CONSTRAINT "branch_office_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dish" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(127) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "quantity" VARCHAR(63) NOT NULL,
    "calorieContent" VARCHAR(63) NOT NULL,
    "proteins" INTEGER,
    "fats" INTEGER,
    "carbohydrates" INTEGER,
    "bestBeforeDate" VARCHAR(63),
    "externalProducer" VARCHAR(127),
    "providingCanteenId" INTEGER NOT NULL,
    "imageId" INTEGER,
    "categoryId" INTEGER,

    CONSTRAINT "dish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dish_category" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "dish_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee" (
    "id" SERIAL NOT NULL,
    "surname" VARCHAR(63) NOT NULL,
    "personnelNumber" VARCHAR(31) NOT NULL,
    "name" VARCHAR(63) NOT NULL DEFAULT '-',
    "patronymic" VARCHAR(63) NOT NULL DEFAULT '-',
    "active" BOOLEAN NOT NULL,
    "officeId" INTEGER NOT NULL,

    CONSTRAINT "employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image" (
    "id" SERIAL NOT NULL,
    "path" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "uploaded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" INTEGER,

    CONSTRAINT "image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu" (
    "id" SERIAL NOT NULL,
    "relevantFrom" TIMESTAMP(3) NOT NULL,
    "expire" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(127) NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changed" TIMESTAMP(3) NOT NULL,
    "providingCanteenId" INTEGER NOT NULL,
    "authorId" INTEGER,

    CONSTRAINT "menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_menu_positions_menu_position" (
    "menuId" INTEGER NOT NULL,
    "menuPositionId" INTEGER NOT NULL,

    CONSTRAINT "menu_menu_positions_menu_position_pkey" PRIMARY KEY ("menuId","menuPositionId")
);

-- CreateTable
CREATE TABLE "menu_position" (
    "id" SERIAL NOT NULL,
    "price" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "dishId" INTEGER NOT NULL,

    CONSTRAINT "menu_position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" SERIAL NOT NULL,
    "issued" DATE NOT NULL,
    "number" INTEGER NOT NULL,
    "fullPrice" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "updated" TIMESTAMP(3) NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(127) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "canCancel" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "order_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_to_menu_position" (
    "orderToMenuPositionId" SERIAL NOT NULL,
    "count" INTEGER NOT NULL,
    "menuPositionId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,

    CONSTRAINT "order_to_menu_position_pkey" PRIMARY KEY ("orderToMenuPositionId")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "login" VARCHAR(127) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'client',
    "isPasswordTemporary" BOOLEAN NOT NULL DEFAULT true,
    "verificationEmailSendTime" TIMESTAMP(3),
    "lastPasswordResetTime" TIMESTAMP(3),
    "employeeId" INTEGER NOT NULL,
    "registered" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changed" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employee_surname_personnelNumber_officeId_key" ON "employee"("surname", "personnelNumber", "officeId");

-- CreateIndex
CREATE INDEX "IDX_2a39cc0f357b041f270ac7807c" ON "menu_menu_positions_menu_position"("menuPositionId");

-- CreateIndex
CREATE INDEX "IDX_9c424b1ae18a97dbbed0b6b23c" ON "menu_menu_positions_menu_position"("menuId");

-- CreateIndex
CREATE UNIQUE INDEX "order_number_issued_key" ON "order"("number", "issued");

-- CreateIndex
CREATE UNIQUE INDEX "user_login_key" ON "user"("login");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_employeeId_key" ON "user"("employeeId");

-- AddForeignKey
ALTER TABLE "branch_office" ADD CONSTRAINT "branch_office_servingCanteenId_fkey" FOREIGN KEY ("servingCanteenId") REFERENCES "branch_office"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish" ADD CONSTRAINT "dish_providingCanteenId_fkey" FOREIGN KEY ("providingCanteenId") REFERENCES "branch_office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish" ADD CONSTRAINT "dish_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish" ADD CONSTRAINT "dish_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "dish_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee" ADD CONSTRAINT "employee_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "branch_office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image" ADD CONSTRAINT "image_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu" ADD CONSTRAINT "menu_providingCanteenId_fkey" FOREIGN KEY ("providingCanteenId") REFERENCES "branch_office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu" ADD CONSTRAINT "menu_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_menu_positions_menu_position" ADD CONSTRAINT "FK_2a39cc0f357b041f270ac7807c5" FOREIGN KEY ("menuPositionId") REFERENCES "menu_position"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "menu_menu_positions_menu_position" ADD CONSTRAINT "FK_9c424b1ae18a97dbbed0b6b23c5" FOREIGN KEY ("menuId") REFERENCES "menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_position" ADD CONSTRAINT "menu_position_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "dish"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "order_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_to_menu_position" ADD CONSTRAINT "order_to_menu_position_menuPositionId_fkey" FOREIGN KEY ("menuPositionId") REFERENCES "menu_position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_to_menu_position" ADD CONSTRAINT "order_to_menu_position_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
