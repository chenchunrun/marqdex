import { requireAuth } from "@/lib/auth/rbac"
import { db } from "@/lib/db"
import { templateCreateSchema } from "@/lib/utils/validation"
import { NextResponse } from "next/server"
import { TemplateCategory } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const session = await requireAuth()
    const body = await req.json()
    const validated = templateCreateSchema.parse(body)

    const template = await db.template.create({
      data: {
        ...validated,
        isBuiltIn: false,
        creatorId: session.user!.id
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error("Template creation error:", error)
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') as TemplateCategory | null

    const templates = await db.template.findMany({
      where: {
        OR: [
          { isPublic: true },
          { creatorId: session.user!.id }
        ],
        ...(category && { category })
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        isBuiltIn: 'desc'
      }
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error("Templates fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    )
  }
}
