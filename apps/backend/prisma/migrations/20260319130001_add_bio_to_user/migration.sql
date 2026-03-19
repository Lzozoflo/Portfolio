-- CreateTable
CREATE TABLE "test" (
    "id" TEXT NOT NULL,
    "prout" TEXT NOT NULL,
    "caca" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_pkey" PRIMARY KEY ("id")
);
