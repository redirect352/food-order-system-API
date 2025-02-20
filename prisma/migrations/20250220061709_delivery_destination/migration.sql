/*
  Warnings:

  - Added the required column `deliveryDestinationId` to the `order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order" ADD COLUMN     "deliveryDestinationId" INTEGER NULL;
UPDATE
	public."order"  oo 
SET 
	"deliveryDestinationId" = src."officeId"
from (	
		select 
			public.user.id as "userId",
			employee."officeId" 
		from 
			public."user" 
		join 
			"employee" on employee.id = public."user"."employeeId" 
	 
	) as src
where src."userId" = oo."clientId";
ALTER TABLE "order" ALTER COLUMN "deliveryDestinationId" SET NOT NULL;

-- CreateIndex
CREATE INDEX IF NOT EXISTS dish_name_idx
    ON public.dish USING gin
    (to_tsvector('russian'::regconfig, name::text))
    TABLESPACE pg_default;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_deliveryDestinationId_fkey" FOREIGN KEY ("deliveryDestinationId") REFERENCES "branch_office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
