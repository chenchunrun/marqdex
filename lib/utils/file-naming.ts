export function generateFileName(
  projectName: string,
  templateType?: string
): string {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '')

  const templateMap: Record<string, string> = {
    PROBLEM_DEFINITION: '问题定义',
    SOLUTION_DESIGN: '方案设计',
    EXECUTION_TRACKING: '执行跟踪',
    RETROSPECTIVE_SUMMARY: '复盘总结'
  }

  const typeLabel = templateType
    ? templateMap[templateType] || templateType
    : '自定义'

  return `${projectName}-${typeLabel}-${date}`
}

export function extractProjectNameFromFileName(fileName: string): string | null {
  const match = fileName.match(/^(.+)-[^-]+-\d{8}$/)
  return match ? match[1] : null
}

export function extractTemplateTypeFromFileName(fileName: string): string | null {
  const match = fileName.match(/^.+-(.+)-\d{8}$/)
  return match ? match[1] : null
}

export function parseFileName(fileName: string): {
  projectName: string
  templateType: string | null
  date: string | null
} {
  // Remove .md extension if present
  const nameWithoutExt = fileName.replace(/\.md$/, '')

  // Try to match standard pattern: ProjectName-TemplateType-YYYYMMDD
  const standardMatch = nameWithoutExt.match(/^(.+)-(.+)-(\d{8})$/)

  if (standardMatch) {
    return {
      projectName: standardMatch[1],
      templateType: standardMatch[2],
      date: standardMatch[3],
    }
  }

  // Return non-standard filename as project name only
  return {
    projectName: nameWithoutExt,
    templateType: null,
    date: null,
  }
}
