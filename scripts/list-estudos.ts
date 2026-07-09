import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
async function main() {
  const estudos = await prisma.estudo.findMany({
    select: { id: true, titulo: true, artista: true, createdAt: true }
  })
  console.log(JSON.stringify(estudos, null, 2))
  await prisma.$disconnect()
}
main().catch(console.error)
