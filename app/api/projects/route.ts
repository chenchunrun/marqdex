import { requireAuth } from "@/lib/auth/rbac"
import { db } from "@/lib/db"
import { projectCreateSchema } from "@/lib/utils/validation"
import { NextResponse } from "next/server"
import { ProjectRole } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const session = await requireAuth()
    const body = await req.json()
    const validated = projectCreateSchema.parse(body)

    // Verify user is member of the team
    const teamMember = await db.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: validated.teamId,
          userId: session.user!.id
        }
      }
    })

    if (!teamMember) {
      return NextResponse.json(
        { error: "Not a team member" },
        { status: 403 }
      )
    }

    const project = await db.project.create({
      data: {
        ...validated,
        creatorId: session.user!.id,
        members: {
          create: {
            userId: session.user!.id,
            role: ProjectRole.ADMIN
          }
        }
      },
      include: {
        members: {
          include: { user: true }
        },
        team: true
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error("Project creation error:", error)
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(req.url)
    const teamId = searchParams.get('teamId')

    const projects = await db.project.findMany({
      where: {
        ...(teamId && { teamId }),
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
        team: true,
        _count: {
          select: {
            files: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Projects fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}
