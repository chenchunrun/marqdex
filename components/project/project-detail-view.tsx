"use client"

import { ProjectMembers } from "./project-members"
import { ActivityLog } from "@/components/activity/activity-log"
import Link from "next/link"
import { useState } from "react"

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  team: {
    id: string
    name: string
  }
  creator: {
    id: string
    name: string | null
    email: string
  }
  members: Array<{
    id: string
    role: 'ADMIN' | 'EDITOR' | 'VIEWER'
    user: {
      id: string
      name: string | null
      email: string
      avatar: string | null
    }
  }>
  files: Array<{
    id: string
    name: string
    createdAt: Date
  }>
  currentUserRole: 'ADMIN' | 'EDITOR' | 'VIEWER'
}

interface ProjectDetailViewProps {
  project: Project
}

export function ProjectDetailView({ project }: ProjectDetailViewProps) {
  return (
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
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
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
        <ProjectMembers
          projectId={project.id}
          members={project.members}
          currentUserRole={project.currentUserRole}
          onUpdate={() => {
            window.location.reload()
          }}
        />
      </div>

      {/* Recent Files */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Files</h2>
          <Link
            href={`/projects/${project.id}/files`}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View all files →
          </Link>
        </div>

        {project.files.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500 mb-4">No files yet. Create your first file to get started.</p>
            <Link
              href={`/editor/new?projectId=${project.id}`}
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create File
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="divide-y divide-gray-200">
              {project.files.map((file) => (
                <a
                  key={file.id}
                  href={`/editor/${file.id}`}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                      📄
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        Created {new Date(file.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Activity Log */}
      <div>
        <ActivityLog projectId={project.id} limit={10} />
      </div>
    </div>
  )
}
