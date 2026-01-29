"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Template {
  id: string
  name: string
  description: string | null
  category: string
  content: string
  isBuiltIn: boolean
  creator: {
    id: string
    name: string | null
    email: string
  } | null
}

const categoryLabels: Record<string, string> = {
  PROBLEM_DEFINITION: "问题定义",
  SOLUTION_DESIGN: "方案设计",
  EXECUTION_TRACKING: "执行跟踪",
  RETROSPECTIVE_SUMMARY: "复盘总结",
  CUSTOM: "自定义"
}

const categoryIcons: Record<string, string> = {
  PROBLEM_DEFINITION: "🔍",
  SOLUTION_DESIGN: "💡",
  EXECUTION_TRACKING: "📊",
  RETROSPECTIVE_SUMMARY: "📝",
  CUSTOM: "📄"
}

export function TemplateCard({ template }: { template: Template }) {
  const [copied, setCopied] = useState(false)
  const [showProjectDialog, setShowProjectDialog] = useState(false)
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([])
  const [selectedProject, setSelectedProject] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleCopy = () => {
    navigator.clipboard.writeText(template.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleUseTemplate = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Fetch user's projects
      const response = await fetch("/api/projects")
      const data = await response.json()

      if (!response.ok) {
        setError("Failed to load projects")
        return
      }

      if (data.length === 0) {
        setError("No projects found. Please create a project first.")
        return
      }

      setProjects(data)
      setSelectedProject(data[0].id)
      setShowProjectDialog(true)
    } catch (err) {
      setError("Failed to load projects")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateFile = async () => {
    if (!selectedProject) {
      setError("Please select a project")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject,
          templateId: template.id,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create file")
        return
      }

      // Navigate to editor
      setShowProjectDialog(false)
      router.push(`/editor/${data.id}`)
    } catch (err) {
      setError("Failed to create file. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{categoryIcons[template.category]}</span>
              <h3 className="text-lg font-semibold text-gray-900 break-words">{template.name}</h3>
            </div>
            <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
              {categoryLabels[template.category]}
            </span>
          </div>
          {template.isBuiltIn && (
            <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800 flex-shrink-0">
              Built-in
            </span>
          )}
        </div>

        {template.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 break-words">{template.description}</p>
        )}

        {template.creator && (
          <p className="text-xs text-gray-500 mb-4 break-words">
            Created by <span className="break-all">{template.creator.name || template.creator.email}</span>
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              copied
                ? "bg-green-100 text-green-800"
                : "text-gray-700 bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleUseTemplate}
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Use Template"}
          </button>
        </div>
      </div>

      {/* Project Selection Dialog */}
      {showProjectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 break-words">Select Project</h2>
              <p className="text-sm text-gray-500 mt-1 break-words">
                Choose a project to create a file from this template
              </p>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 break-all"
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowProjectDialog(false)
                    setError("")
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFile}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Creating..." : "Create File"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
