import { requireAuth } from "@/lib/auth/rbac"
import { validateApiKey } from "@/lib/ai/client"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await requireAuth()

    if (!session.user?.id) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      )
    }

    const { apiKey, aiEndpoint } = await req.json()

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      )
    }

    // Validate the API key by making a test request
    const isValid = await validateApiKey(apiKey, aiEndpoint)

    return NextResponse.json({ valid: isValid })
  } catch (error) {
    console.error("API key validation error:", error)
    return NextResponse.json(
      {
        error: "Failed to validate API key",
        valid: false
      },
      { status: 500 }
    )
  }
}
