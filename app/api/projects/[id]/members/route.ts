import { requireAuth } from "@/lib/auth/rbac"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// Get all members of a project
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id: projectId } = await params

    if (!session.user?.id) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      )
    }

    // Check if user has access to the project
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    const hasAccess = project.members.some(m => m.userId === session.user.id)
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have access to this project" },
        { status: 403 }
      )
    }

    return NextResponse.json(project.members)
  } catch (error) {
    console.error("Failed to fetch project members:", error)
    return NextResponse.json(
      { error: "Failed to fetch project members" },
      { status: 500 }
    )
  }
}

// Add a member to a project
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id: projectId } = await params

    if (!session.user?.id) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      )
    }

    const { userId, role = 'MEMBER' } = await req.json()

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Check if requester is admin or editor of the project
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        members: true
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    const requesterMembership = project.members.find(m => m.userId === session.user.id)
    if (!requesterMembership || requesterMembership.role === 'VIEWER') {
      return NextResponse.json(
        { error: "Only editors and admins can add members" },
        { status: 403 }
      )
    }

    // Check if user is already a member
    const existingMember = project.members.find(m => m.userId === userId)
    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this project" },
        { status: 400 }
      )
    }

    // Add member to project
    const membership = await db.projectMembership.create({
      data: {
        projectId,
        userId,
        role: role as 'ADMIN' | 'EDITOR' | 'VIEWER'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    })

    // Log activity
    await db.activityLog.create({
      data: {
        projectId,
        userId: session.user.id,
        action: "MEMBER_ADDED",
        details: `Added ${membership.user.name || membership.user.email} to the project`
      }
    })

    return NextResponse.json(membership)
  } catch (error) {
    console.error("Failed to add project member:", error)
    return NextResponse.json(
      { error: "Failed to add project member" },
      { status: 500 }
    )
  }
}
