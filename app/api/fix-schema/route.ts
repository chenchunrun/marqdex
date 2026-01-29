import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Check if columns exist by attempting to query them
    const result = await db.$queryRaw`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'User'
      AND column_name IN ('aiModel', 'aiApiEndpoint')
      ORDER BY column_name
    ` as any[]

    // If columns don't exist, add them
    if (!result || result.length === 0) {
      console.log('Adding aiModel and aiApiEndpoint columns...')
      await db.$executeRawUnsafe(`
        ALTER TABLE "User"
        ADD COLUMN IF NOT EXISTS "aiApiEndpoint" TEXT,
        ADD COLUMN IF NOT EXISTS "aiModel" TEXT DEFAULT 'gpt-3.5-turbo'
      `)

      return NextResponse.json({
        success: true,
        message: "Columns added successfully",
        action: "added"
      })
    }

    return NextResponse.json({
      success: true,
      message: "Columns already exist",
      columns: result,
      action: "checked"
    })
  } catch (error) {
    console.error('Schema fix error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
