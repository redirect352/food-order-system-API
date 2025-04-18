/*
  Warnings:

  - The values [order_issuing,menu_moderator,1C_export] on the enum `user_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "user_role_new" AS ENUM ('client', 'deliveryman', 'order-issuing', 'menu-moderator', '1C-export', 'admin');
ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "role" TYPE varchar(100);
Update "user" set role='menu-moderator' where role='menu_moderator';
ALTER TABLE "user" ALTER COLUMN "role" TYPE "user_role_new" USING ("role"::text::"user_role_new");
ALTER TYPE "user_role" RENAME TO "user_role_old";
ALTER TYPE "user_role_new" RENAME TO "user_role";
DROP TYPE "user_role_old";
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'client';
COMMIT;
