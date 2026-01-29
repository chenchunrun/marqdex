import { requireAuth } from "@/lib/auth/rbac"
import { db } from "@/lib/db"
import { validateApiKey } from "@/lib/ai/client"
import { encrypt, decrypt } from "@/lib/utils/encryption"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await requireAuth()
    const { apiKey, aiModel, aiEndpoint } = await req.json()

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      )
    }

    // Encrypt and store
    const encryptedKey = encrypt(apiKey)

    // Use raw SQL to bypass Prisma client type checking
    await db.$executeRawUnsafe(`
      UPDATE "User"
      SET "openaiApiKey" = $1,
          "aiModel" = $2,
          "aiApiEndpoint" = $3,
          "updatedAt" = NOW()
      WHERE id = $4
    `, encryptedKey, aiModel || 'gpt-3.5-turbo', aiEndpoint || null, session.user!.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API key save error:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      {
        error: "Failed to save API configuration",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await requireAuth()

    // Use raw SQL to fetch config
    const result = await db.$queryRawUnsafe(`
      SELECT
        "openaiApiKey",
        "aiModel",
        "aiApiEndpoint"
      FROM "User"
      WHERE id = $1
    `, session.user!.id) as any[]

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const user = result[0]

    return NextResponse.json({
      hasApiKey: !!user.openaiApiKey,
      aiModel: user.aiModel,
      aiEndpoint: user.aiApiEndpoint
    })
  } catch (error) {
    console.error("API key fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch API key status" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const session = await requireAuth()

    // Use raw SQL to delete
    await db.$executeRawUnsafe(`
      UPDATE "User"
      SET "openaiApiKey" = NULL,
          "aiModel" = 'gpt-3.5-turbo',
          "aiApiEndpoint" = NULL,
          "updatedAt" = NOW()
      WHERE id = $1
    `, session.user!.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API key delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    )
  }
}
