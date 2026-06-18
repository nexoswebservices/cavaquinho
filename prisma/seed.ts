import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import * as fs from "fs"
import * as path from "path"

interface CifraSeed {
  titulo: string
  artista: string | null
  tom: string | null
  conteudo: string
  progressao: string | null
}

const CIFRAS: CifraSeed[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data/cifras.json"), "utf-8")
)

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash("admin123", 12)
  await prisma.user.upsert({
    where: { email: "admin@harmoniaflow.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@harmoniaflow.com",
      password: hash,
      role: "admin",
    },
  })
  console.log("Admin: admin@harmoniaflow.com / admin123")

  // Clear existing cifras and related data
  await prisma.repertorioItem.deleteMany()
  await prisma.cifraFavorito.deleteMany()
  await prisma.cifra.deleteMany()
  console.log("Cifras anteriores removidas")

  // Insert all cifras in batches
  const BATCH = 50
  let inserted = 0
  for (let i = 0; i < CIFRAS.length; i += BATCH) {
    const batch = CIFRAS.slice(i, i + BATCH)
    await prisma.cifra.createMany({ data: batch })
    inserted += batch.length
    process.stdout.write(`\r  ${inserted}/${CIFRAS.length} cifras...`)
  }
  console.log(`\nSeed concluído — ${CIFRAS.length} cifras importadas (88 artistas)`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
