import { requireAuth, requireProjectAccess } from "@/lib/auth/rbac"
import { db } from "@/lib/db"
import { commentCreateSchema } from "@/lib/utils/validation"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await requireAuth()
    const body = await req.json()
    const validated = commentCreateSchema.parse(body)

    if (!session.user?.id) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      )
    }

    // Verify file access
    const file = await db.file.findUnique({
      where: { id: validated.fileId }
    })

    if (!file) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      )
    }

    await requireProjectAccess(file.projectId, "EDITOR")

    const comment = await db.comment.create({
      data: {
        ...validated,
        authorId: session.user.id
      },
      include: {
        author: true,
        mentions: true
      }
    })

    // Log activity
    await db.activityLog.create({
      data: {
        projectId: file.projectId,
        fileId: validated.fileId,
        userId: session.user.id,
        action: "COMMENT_ADDED"
      }
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Comment creation error:", error)
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(req.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      )
    }

    const file = await db.file.findUnique({
      where: { id: fileId }
    })

    if (!file) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      )
    }

    await requireProjectAccess(file.projectId, "VIEWER")

    const comments = await db.comment.findMany({
      where: { fileId },
      include: {
        author: true,
        mentions: {
          include: { user: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Comments fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    )
  }
}
