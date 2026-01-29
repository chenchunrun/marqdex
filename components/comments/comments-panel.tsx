"use client"

import { useState, useEffect } from "react"

interface Comment {
  id: string
  content: string
  createdAt: string
  isResolved: boolean
  author: {
    id: string
    name: string | null
    email: string
  }
}

interface CommentsPanelProps {
  fileId: string
}

export function CommentsPanel({ fileId }: CommentsPanelProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [fileId])

  const fetchComments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/comments?fileId=${fileId}`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId,
          content: newComment
        })
      })

      if (response.ok) {
        setNewComment("")
        fetchComments()
      }
    } catch (error) {
      console.error("Failed to submit comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResolve = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isResolved: true })
      })

      if (response.ok) {
        fetchComments()
      }
    } catch (error) {
      console.error("Failed to resolve comment:", error)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Comments</h2>
        <p className="text-sm text-gray-500">{comments.length} comments</p>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-500 py-8">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-4 rounded-lg border ${
                comment.isResolved
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    {(comment.author.name || comment.author.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {comment.author.name || comment.author.email}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {!comment.isResolved && (
                  <button
                    onClick={() => handleResolve(comment.id)}
                    className="text-xs text-green-600 hover:text-green-700 font-medium"
                  >
                    Resolve
                  </button>
                )}
              </div>

              <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>

              {comment.isResolved && (
                <div className="mt-2 text-xs text-green-600 font-medium">
                  ✓ Resolved
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  )
}
