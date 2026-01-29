import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { FileDeleteButton } from "@/components/files/file-delete-button"
import Link from "next/link"

export default async function FilesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const files = await db.file.findMany({
    where: {
      project: {
        members: {
          some: { userId: session.user.id }
        }
      }
    },
    include: {
      project: true,
      creator: true,
      _count: {
        select: {
          versions: true,
          comments: true
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  const fileTypeIcons: Record<string, string> = {
    PROBLEM_DEFINITION: "🎯",
    SOLUTION_DESIGN: "💡",
    EXECUTION_TRACKING: "📊",
    RETROSPECTIVE_SUMMARY: "📝",
    CUSTOM: "📄"
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Files</h1>
            <p className="mt-2 text-gray-600">Browse and manage all your documents</p>
          </div>
          <Link
            href="/files/import"
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Import File
          </Link>
        </div>

        {/* Files List */}
        {files.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creator
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Versions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {files.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{fileTypeIcons[file.fileType]}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{file.name}</div>
                            <div className="text-xs text-gray-500">{file.fileType.replace('_', ' ')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {file.project.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {file.creator.name || file.creator.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {file._count.versions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {file._count.comments}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(file.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-3">
                          <Link
                            href={`/editor/${file.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Open →
                          </Link>
                          <span className="text-gray-300">|</span>
                          <FileDeleteButton
                            fileId={file.id}
                            fileName={file.name}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No files yet</h3>
            <p className="text-gray-600 mb-6">Create a file from a template to get started</p>
            <Link
              href="/templates"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Browse Templates
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
