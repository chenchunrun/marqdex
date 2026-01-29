import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import Link from "next/link"
import { CreateTeamDialog } from "@/components/team/create-team-dialog"

export default async function TeamsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const teams = await db.team.findMany({
    where: {
      members: {
        some: { userId: session.user.id }
      }
    },
    include: {
      members: {
        include: { user: true }
      },
      _count: {
        select: {
          projects: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
            <p className="mt-2 text-gray-600">Manage your teams and collaborate with others</p>
          </div>
          <CreateTeamDialog />
        </div>

        {/* Teams Grid */}
        {teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{team.name}</h3>
                    {team.description && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{team.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4 text-gray-500">
                    <span>👤 {team._count.projects} projects</span>
                    <span>👥 {team.members.length} members</span>
                  </div>
                  <span className="text-blue-600">→</span>
                </div>

                {/* Members avatars */}
                <div className="mt-4 flex items-center">
                  <div className="flex -space-x-2">
                    {team.members.slice(0, 4).map((member) => (
                      <div
                        key={member.id}
                        className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                        title={member.user.name || member.user.email}
                      >
                        {(member.user.name || member.user.email || "U").charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {team.members.length > 4 && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                        +{team.members.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No teams yet</h3>
            <p className="text-gray-600 mb-6">Create your first team to start collaborating</p>
            <CreateTeamDialog />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
