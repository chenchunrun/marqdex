import { db } from "@/lib/db"

export async function exportToMarkdown(fileId: string): Promise<{ filename: string; content: string }> {
  const file = await db.file.findUnique({
    where: { id: fileId }
  })

  if (!file) {
    throw new Error("File not found")
  }

  return {
    filename: `${file.name}.md`,
    content: file.content
  }
}

export async function exportToPDF(fileId: string): Promise<{ filename: string; content: string }> {
  const file = await db.file.findUnique({
    where: { id: fileId }
  })

  if (!file) {
    throw new Error("File not found")
  }

  // Simple HTML to PDF conversion
  // In production, you'd use a proper library like puppeteer or jsPDF
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; }
    h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; }
    code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 16px; border-radius: 6px; overflow-x: auto; }
    blockquote { border-left: 4px solid #ddd; padding-left: 16px; color: #666; }
  </style>
</head>
<body>
${file.content}
</body>
</html>
  `

  return {
    filename: `${file.name}.html`,
    content: html
  }
}
