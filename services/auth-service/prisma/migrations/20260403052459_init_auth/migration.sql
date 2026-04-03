-- CreateEnum
CREATE TYPE "auth"."Role" AS ENUM ('CIVILIAN', 'VOLUNTEER', 'AUTHORITY');

-- CreateTable
CREATE TABLE "auth"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "role" "auth"."Role" NOT NULL DEFAULT 'CIVILIAN',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "auth"."User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "auth"."User"("email");
