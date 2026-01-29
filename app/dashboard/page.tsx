import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import Link from "next/link"

async function getDashboardData(userId: string) {
  const [teams, projects, files, totalFilesCount] = await Promise.all([
    db.team.findMany({
      where: {
        members: {
          some: { userId }
        }
      },
      include: {
        _count: {
          select: {
            projects: true,
            members: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    db.project.findMany({
      where: {
        members: {
          some: { userId }
        }
      },
      include: {
        team: true,
        _count: {
          select: {
            files: true,
            members: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 5
    }),
    db.file.findMany({
      where: {
        project: {
          members: {
            some: { userId }
          }
        }
      },
      include: {
        project: true,
        creator: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 5
    }),
    db.file.count({
      where: {
        project: {
          members: {
            some: { userId }
          }
        }
      }
    })
  ])

  return { teams, projects, files, totalFilesCount }
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const data = await getDashboardData(session.user.id!)

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user.name || "User"}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your projects
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link
            href="/teams"
            className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">👥</div>
            <h3 className="font-semibold text-gray-900">Create Team</h3>
            <p className="text-sm text-gray-500">Start collaborating</p>
          </Link>

          <Link
            href="/projects"
            className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">📁</div>
            <h3 className="font-semibold text-gray-900">New Project</h3>
            <p className="text-sm text-gray-500">Organize your work</p>
          </Link>

          <Link
            href="/templates"
            className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">📝</div>
            <h3 className="font-semibold text-gray-900">Templates</h3>
            <p className="text-sm text-gray-500">Quick start docs</p>
          </Link>

          <Link
            href="/files"
            className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">📄</div>
            <h3 className="font-semibold text-gray-900">Browse Files</h3>
            <p className="text-sm text-gray-500">View all documents</p>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Teams</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{data.teams.length}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Projects</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{data.projects.length}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Files</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{data.totalFilesCount}</p>
          </div>
        </div>

        {/* Recent Teams */}
        {data.teams.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Teams</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {data.teams.map((team) => (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  className="p-6 hover:bg-gray-50 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-500">
                      {team._count.projects} projects • {team._count.members} members
                    </p>
                  </div>
                  <span className="text-gray-400">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Projects */}
        {data.projects.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {data.projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="p-6 hover:bg-gray-50 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-500">
                      {project.team.name} • {project._count.files} files
                    </p>
                  </div>
                  <span className="text-gray-400">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Files */}
        {data.files.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Files</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {data.files.map((file) => (
                <Link
                  key={file.id}
                  href={`/editor/${file.id}`}
                  className="p-6 hover:bg-gray-50 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{file.name}</h3>
                    <p className="text-sm text-gray-500">
                      {file.project.name} • Updated {new Date(file.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-gray-400">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {data.teams.length === 0 && data.projects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Started</h3>
            <p className="text-gray-600 mb-6">Create your first team to start collaborating</p>
            <Link
              href="/teams/new"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Create Team
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
