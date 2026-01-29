import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import Link from "next/link"

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const project = await db.project.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      team: {
        select: {
          id: true,
          name: true,
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
      files: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 10,
      }
    }
  })

  if (!project) {
    redirect("/projects")
  }

  // Check if user is a member
  const isMember = project.members.some(m => m.userId === session.user.id)
  if (!isMember) {
    redirect("/projects")
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <Link href={`/teams/${project.team.id}`} className="hover:text-blue-600">
                  {project.team.name}
                </Link>
                <span>/</span>
                <span>Project</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              {project.description && (
                <p className="text-gray-600 mt-2">{project.description}</p>
              )}
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
              project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {project.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Created by {project.creator.name || project.creator.email}
          </p>
        </div>

        {/* Project Members */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Members</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="divide-y divide-gray-200">
              {project.members.map((member) => (
                <div key={member.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-medium">
                      {member.user.name?.[0] || member.user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.user.name || member.user.email}
                      </p>
                      <p className="text-sm text-gray-500">{member.user.email}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    member.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                    member.role === 'EDITOR' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Files */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Files</h2>
            <Link
              href={`/files?project=${project.id}`}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all files
            </Link>
          </div>

          {project.files.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500 mb-4">No files yet. Create your first file to get started.</p>
              <Link
                href={`/templates?project=${project.id}`}
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create from Template
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="divide-y divide-gray-200">
                {project.files.map((file) => (
                  <Link
                    key={file.id}
                    href={`/editor/${file.id}`}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{file.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Last updated {new Date(file.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        file.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        file.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        file.status === 'REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {file.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        file.fileType === 'PROBLEM_DEFINITION' ? 'bg-red-100 text-red-800' :
                        file.fileType === 'SOLUTION_DESIGN' ? 'bg-blue-100 text-blue-800' :
                        file.fileType === 'EXECUTION_TRACKING' ? 'bg-yellow-100 text-yellow-800' :
                        file.fileType === 'RETROSPECTIVE_SUMMARY' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {file.fileType.replace('_', ' ')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
