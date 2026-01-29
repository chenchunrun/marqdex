import { requireAuth } from "@/lib/auth/rbac"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// Get all members of a team
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id: teamId } = await params

    if (!session.user?.id) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      )
    }

    // Check if user is a member of the team
    const team = await db.team.findUnique({
      where: { id: teamId },
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

    if (!team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      )
    }

    const isMember = team.members.some(m => m.userId === session.user.id)
    if (!isMember) {
      return NextResponse.json(
        { error: "You don't have access to this team" },
        { status: 403 }
      )
    }

    return NextResponse.json(team.members)
  } catch (error) {
    console.error("Failed to fetch team members:", error)
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    )
  }
}

// Add a member to a team
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id: teamId } = await params

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

    // Check if the requester is an admin of the team
    const team = await db.team.findUnique({
      where: { id: teamId },
      include: {
        members: true
      }
    })

    if (!team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      )
    }

    const requesterMembership = team.members.find(m => m.userId === session.user.id)
    if (!requesterMembership || requesterMembership.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Only team admins can add members" },
        { status: 403 }
      )
    }

    // Check if user is already a member
    const existingMember = team.members.find(m => m.userId === userId)
    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this team" },
        { status: 400 }
      )
    }

    // Add member to team
    const membership = await db.teamMember.create({
      data: {
        teamId,
        userId,
        role: role as 'ADMIN' | 'MEMBER'
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

    return NextResponse.json(membership)
  } catch (error) {
    console.error("Failed to add team member:", error)
    return NextResponse.json(
      { error: "Failed to add team member" },
      { status: 500 }
    )
  }
}
