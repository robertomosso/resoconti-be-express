-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "fileId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resoconto" (
    "id" TEXT NOT NULL,
    "dataInizio" TEXT NOT NULL,
    "dataFine" TEXT NOT NULL,
    "tipoAttivita" TEXT NOT NULL,
    "attivita" TEXT NOT NULL,
    "descrizione" TEXT NOT NULL,
    "personaRiferimento" TEXT NOT NULL,
    "cliente" TEXT NOT NULL,
    "colleghiSI" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Resoconto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Resoconto" ADD CONSTRAINT "Resoconto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
