import { requireAuth } from "@/lib/auth/rbac"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PATCH(req: Request) {
  try {
    const session = await requireAuth()
    const { name, nickname, emailEnabled } = await req.json()

    const updatedUser = await db.user.update({
      where: { id: session.user!.id },
      data: {
        ...(name !== undefined && { name }),
        ...(nickname !== undefined && { nickname }),
        ...(emailEnabled !== undefined && { emailEnabled })
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await requireAuth()

    const user = await db.user.findUnique({
      where: { id: session.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        avatar: true,
        emailEnabled: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("User fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    )
  }
}
