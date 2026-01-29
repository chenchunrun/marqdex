import { requireAuth } from "@/lib/auth/rbac"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const session = await requireAuth()

    if (!session.user?.id) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const fileId = searchParams.get('fileId')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause
    const where: any = {}

    if (projectId) {
      where.projectId = projectId
    }

    if (fileId) {
      where.fileId = fileId
    }

    // Get activities
    const activities = await db.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        file: {
          select: {
            id: true,
            name: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    // Get count
    const count = await db.activityLog.count({ where })

    return NextResponse.json({
      activities,
      count,
      hasMore: activities.length === limit
    })
  } catch (error) {
    console.error("Activity log fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch activity log" },
      { status: 500 }
    )
  }
}
