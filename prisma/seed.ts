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
  console.log("Seed concluído — admin@harmoniaflow.com / admin123")

  const cifraCount = await prisma.cifra.count()
  if (cifraCount === 0) {
    for (const c of CIFRAS) {
      await prisma.cifra.create({ data: c })
    }
    console.log(`Seed concluído — ${CIFRAS.length} cifras importadas`)
  } else {
    console.log(`Cifras já existem (${cifraCount}), seed pulado`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
