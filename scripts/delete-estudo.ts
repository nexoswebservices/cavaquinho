import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
async function main() {
  const id = process.argv[2]
  if (!id) { console.error("Usage: ts-node delete-estudo.ts <id>"); process.exit(1) }
  const deleted = await prisma.estudo.delete({ where: { id } })
  console.log("Deleted:", deleted.titulo, "-", deleted.artista)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
