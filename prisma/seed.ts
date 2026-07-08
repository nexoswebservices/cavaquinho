import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

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
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
