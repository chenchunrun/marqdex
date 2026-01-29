import { authorizeLiveblocksAccess } from "@/lib/liveblocks/config"
import { NextResponse } from "next/server"
import { Liveblocks } from "@liveblocks/node"

export async function POST(req: Request) {
  // Check if Liveblocks is configured
  if (!process.env.LIVEBLOCKS_SECRET) {
    return NextResponse.json(
      { error: "Liveblocks is not configured" },
      { status: 501 }
    )
  }

  const liveblocks = new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET,
  })

  try {
    const { room } = await req.json()

    if (!room) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      )
    }

    // Authorize user access
    const authResult = await authorizeLiveblocksAccess(room)

    if (!authResult || !authResult.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Generate Liveblocks authorization
    const session = liveblocks.prepareSession(
      authResult.userId,
      {
        userInfo: authResult.userInfo
      }
    )

    // Allow access to the room
    session.allow(room, session.FULL_ACCESS)

    const { status, body } = await session.authorize()

    return new NextResponse(body, { status })
  } catch (error) {
    console.error("Liveblocks auth error:", error)
    return NextResponse.json(
      { error: "Authorization failed" },
      { status: 500 }
    )
  }
}
