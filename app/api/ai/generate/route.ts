import { requireAuth } from "@/lib/auth/rbac"
import { db } from "@/lib/db"
import { generateContent } from "@/lib/ai/client"
import { TEMPLATE_PROMPTS } from "@/lib/ai/prompts"
import { NextResponse } from "next/server"
import { TemplateCategory } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const session = await requireAuth()
    const { templateType, projectName, context, action } = await req.json()

    // Get user's API key and configuration using raw SQL
    if (!session.user?.id) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      )
    }

    const result = await db.$queryRawUnsafe(`
      SELECT
        "openaiApiKey",
        "aiModel",
        "aiApiEndpoint"
      FROM "User"
      WHERE id = $1
    `, session.user.id) as any[]

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const user = result[0]

    if (!user.openaiApiKey) {
      return NextResponse.json(
        { error: "API key not configured. Please add it in settings." },
        { status: 400 }
      )
    }

    // Decrypt API key
    const decryptedKey = Buffer.from(user.openaiApiKey, 'base64').toString()

    // Generate prompt based on template type or action
    let prompt = ""
    if (action === "expand") {
      prompt = `Expand and elaborate on the following content. Add more details, examples, and explanations:\n\n${context}`
    } else if (action === "summarize") {
      prompt = `Create a concise summary of the following content:\n\n${context}`
    } else if (action === "improve") {
      prompt = `Improve the following content by enhancing clarity, flow, and professionalism while maintaining the original meaning:\n\n${context}`
    } else if (action === "generate") {
      prompt = context || `Generate content about ${projectName}`
    } else {
      const promptFn = TEMPLATE_PROMPTS[templateType as TemplateCategory]
      if (!promptFn) {
        return NextResponse.json(
          { error: "Invalid template type" },
          { status: 400 }
        )
      }
      prompt = promptFn(projectName, context)
    }

    // Generate content with user's model and endpoint
    const content = await generateContent(
      decryptedKey,
      prompt,
      {
        model: user.aiModel || "gpt-3.5-turbo",
        baseURL: user.aiApiEndpoint || undefined
      }
    )

    return NextResponse.json({ content })
  } catch (error) {
    console.error("AI generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate content. Please check your API key and try again." },
      { status: 500 }
    )
  }
}
