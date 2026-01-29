import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TeamDetailView } from "@/components/team/team-detail-view"

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const team = await db.team.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            }
          }
        }
      },
      projects: {
        include: {
          creator: {
            select: {
              name: true,
            }
          }
        }
      }
    }
  })

  if (!team) {
    redirect("/teams")
  }

  // Check if user is a member
  const isMember = team.members.some(m => m.userId === session.user.id)
  if (!isMember) {
    redirect("/teams")
  }

  // Get current user's role
  const currentUserRole = team.members.find(m => m.userId === session.user.id)?.role || 'MEMBER'

  return (
    <DashboardLayout>
      <TeamDetailView
        team={{
          ...team,
          currentUserRole
        }}
      />
    </DashboardLayout>
  )
}
