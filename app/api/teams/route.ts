import { requireAuth } from "@/lib/auth/rbac"
import { db } from "@/lib/db"
import { teamCreateSchema } from "@/lib/utils/validation"
import { NextResponse } from "next/server"
import { TeamRole } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const session = await requireAuth()
    const body = await req.json()
    const validated = teamCreateSchema.parse(body)

    const team = await db.team.create({
      data: {
        ...validated,
        creatorId: session.user!.id,
        members: {
          create: {
            userId: session.user!.id,
            role: TeamRole.ADMIN
          }
        }
      },
      include: {
        members: {
          include: { user: true }
        }
      }
    })

    return NextResponse.json(team)
  } catch (error) {
    console.error("Team creation error:", error)
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await requireAuth()

    const teams = await db.team.findMany({
      where: {
        members: {
          some: {
            userId: session.user!.id
          }
        }
      },
      include: {
        members: {
          include: { user: true }
        },
        _count: {
          select: {
            projects: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(teams)
  } catch (error) {
    console.error("Teams fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    )
  }
}
