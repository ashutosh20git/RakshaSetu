-- CreateTable
CREATE TABLE "heartbeat"."Heartbeat" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "phone" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isAlert" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Heartbeat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Heartbeat_userId_key" ON "heartbeat"."Heartbeat"("userId");
