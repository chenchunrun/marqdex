import { requireAuth, requireProjectAccess } from "@/lib/auth/rbac"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await requireAuth()
    const { fileId, content, changeLog } = await req.json()

    // Verify file access
    const file = await db.file.findUnique({
      where: { id: fileId }
    })

    if (!file) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      )
    }

    await requireProjectAccess(file.projectId, "EDITOR")

    // Get current version number
    const latestVersion = await db.fileVersion.findFirst({
      where: { fileId },
      orderBy: { versionNumber: 'desc' }
    })

    const versionNumber = (latestVersion?.versionNumber || 0) + 1

    const version = await db.fileVersion.create({
      data: {
        fileId,
        versionNumber,
        content,
        changeLog,
        creatorId: session.user!.id
      },
      include: {
        creator: true
      }
    })

    // Log activity
    await db.activityLog.create({
      data: {
        projectId: file.projectId,
        fileId,
        userId: session.user!.id,
        action: "FILE_UPDATED",
        metadata: { versionNumber }
      }
    })

    return NextResponse.json(version)
  } catch (error) {
    console.error("Version creation error:", error)
    return NextResponse.json(
      { error: "Failed to create version" },
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

    await requireProjectAccess(file.projectId)

    const versions = await db.fileVersion.findMany({
      where: { fileId },
      include: {
        creator: true
      },
      orderBy: {
        versionNumber: 'desc'
      }
    })

    return NextResponse.json(versions)
  } catch (error) {
    console.error("Versions fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch versions" },
      { status: 500 }
    )
  }
}
