import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

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

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
              {team.description && (
                <p className="text-gray-600 mt-2">{team.description}</p>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Created by {team.creator.name || team.creator.email}
          </p>
        </div>

        {/* Team Members */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Members</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="divide-y divide-gray-200">
              {team.members.map((member) => (
                <div key={member.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                      {member.user.name?.[0] || member.user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.user.name || member.user.email}
                      </p>
                      <p className="text-sm text-gray-500">{member.user.email}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
          </div>

          {team.projects.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No projects yet. Create your first project to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {team.projects.map((project) => (
                <a
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Created by {project.creator.name}</span>
                    <span className={`px-2 py-1 rounded-full ${
                      project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
