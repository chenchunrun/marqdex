"use client"

import { TeamMembers } from "./team-members"

interface Team {
  id: string
  name: string
  description: string | null
  creator: {
    id: string
    name: string | null
    email: string
  }
  members: Array<{
    id: string
    role: 'ADMIN' | 'MEMBER'
    user: {
      id: string
      name: string | null
      email: string
      avatar: string | null
    }
  }>
  projects: Array<{
    id: string
    name: string
    description: string | null
    status: string
    creator: {
      name: string | null
    }
  }>
  currentUserRole: 'ADMIN' | 'MEMBER'
}

interface TeamDetailViewProps {
  team: Team
}

export function TeamDetailView({ team }: TeamDetailViewProps) {
  return (
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
        <TeamMembers
          teamId={team.id}
          members={team.members}
          currentUserRole={team.currentUserRole}
          onUpdate={() => {
            // Trigger page refresh
            window.location.reload()
          }}
        />
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
  )
}
