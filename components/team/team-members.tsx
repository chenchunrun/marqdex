"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Member {
  id: string
  role: 'ADMIN' | 'MEMBER'
  user: {
    id: string
    name: string | null
    email: string
    avatar: string | null
  }
}

interface TeamMembersProps {
  teamId: string
  members: Member[]
  currentUserRole?: 'ADMIN' | 'MEMBER'
  onUpdate: () => void
}

export function TeamMembers({ teamId, members, currentUserRole = 'MEMBER', onUpdate }: TeamMembersProps) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Find user by email
      const searchResponse = await fetch(`/api/users/search?q=${newMemberEmail}&teamId=${teamId}`)
      if (!searchResponse.ok) {
        throw new Error('Failed to search for user')
      }

      const users = await searchResponse.json()
      if (!users || users.length === 0) {
        setError('User not found. Please check the email.')
        return
      }

      const user = users[0]

      // Add member to team
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          role: 'MEMBER'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add member')
      }

      setNewMemberEmail("")
      setIsAdding(false)
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/teams/${teamId}/members/${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to remove member')
      }

      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (userId: string, newRole: 'ADMIN' | 'MEMBER') => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/teams/${teamId}/members/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update role')
      }

      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = currentUserRole === 'ADMIN'

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Team Members ({members.length})</h3>
        {isAdmin && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
          >
            {isAdding ? 'Cancel' : 'Add Member'}
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {isAdding && isAdmin && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleAddMember} className="flex gap-2">
            <input
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="Enter member email"
              required
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </form>
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {members.map((member) => (
          <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {(member.user.name || member.user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">
                  {member.user.name || member.user.email}
                </p>
                <p className="text-sm text-gray-500 truncate">{member.user.email}</p>
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <select
                  value={member.role}
                  onChange={(e) => handleUpdateRole(member.user.id, e.target.value as 'ADMIN' | 'MEMBER')}
                  disabled={loading}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <button
                  onClick={() => handleRemoveMember(member.user.id)}
                  disabled={loading}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            )}

            {!isAdmin && (
              <span className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded">
                {member.role}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
