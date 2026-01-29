import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import Link from "next/link"
import { CreateProjectDialog } from "@/components/project/create-project-dialog"

export default async function ProjectsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const projects = await db.project.findMany({
    where: {
      members: {
        some: { userId: session.user.id }
      }
    },
    include: {
      team: true,
      members: {
        include: { user: true }
      },
      _count: {
        select: {
          files: true
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="mt-2 text-gray-600">Organize and track your work</p>
          </div>
          <CreateProjectDialog />
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
                    {project.description && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{project.description}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status.toLowerCase()}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Team:</span>
                    <span className="font-medium text-gray-900">{project.team.name}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Files:</span>
                    <span className="font-medium text-gray-900">{project._count.files}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Members:</span>
                    <div className="flex items-center">
                      <div className="flex -space-x-2">
                        {project.members.slice(0, 3).map((member) => (
                          <div
                            key={member.id}
                            className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs border-2 border-white"
                            title={member.user.name || member.user.email}
                          >
                            {(member.user.name || member.user.email || "U").charAt(0).toUpperCase()}
                          </div>
                        ))}
                      </div>
                      {project.members.length > 3 && (
                        <span className="ml-2 text-gray-500">+{project.members.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                  Updated {new Date(project.updatedAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6">Create your first project to organize your work</p>
            <CreateProjectDialog />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
