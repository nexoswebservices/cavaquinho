import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json()

  if (!email || !password || !name) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Senha deve ter pelo menos 6 caracteres" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 })
  }

  const hash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { name, email, password: hash },
    select: { id: true, email: true, name: true },
  })

  return NextResponse.json(user, { status: 201 })
}
