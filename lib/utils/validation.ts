import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
})

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  nickname: z.string().optional()
})

export const teamCreateSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  description: z.string().optional()
})

export const projectCreateSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  description: z.string().optional(),
  teamId: z.string().min(1, "Team ID is required")
})

export const fileCreateSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  templateId: z.string().optional(),
  name: z.string().optional(),
  content: z.string().default("")
})

export const templateCreateSchema = z.object({
  name: z.string().min(2, "Template name must be at least 2 characters"),
  description: z.string().optional(),
  category: z.enum([
    "PROBLEM_DEFINITION",
    "SOLUTION_DESIGN",
    "EXECUTION_TRACKING",
    "RETROSPECTIVE_SUMMARY",
    "CUSTOM"
  ]),
  content: z.string().min(1, "Template content is required"),
  aiPrompt: z.string().optional()
})

export const commentCreateSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  content: z.string().min(1, "Comment content is required"),
  lineStart: z.number().optional(),
  lineEnd: z.number().optional(),
  parentId: z.string().optional()
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type TeamCreateInput = z.infer<typeof teamCreateSchema>
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>
export type FileCreateInput = z.infer<typeof fileCreateSchema>
export type TemplateCreateInput = z.infer<typeof templateCreateSchema>
export type CommentCreateInput = z.infer<typeof commentCreateSchema>
