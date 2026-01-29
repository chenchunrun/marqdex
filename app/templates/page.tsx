import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TemplateCard } from "@/components/templates/template-card"
import Link from "next/link"

export default async function TemplatesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const templates = await db.template.findMany({
    where: {
      OR: [
        { isPublic: true },
        { creatorId: session.user.id }
      ]
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
    orderBy: [
      { isBuiltIn: 'desc' },
      { createdAt: 'desc' }
    ]
  })

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Template Center</h1>
            <p className="mt-2 text-gray-600">Start with built-in templates or create your own</p>
          </div>
          <Link
            href="/templates/new"
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Template
          </Link>
        </div>

        {/* Templates Grid */}
        {templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates available</h3>
            <p className="text-gray-600">Built-in templates will appear here</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
