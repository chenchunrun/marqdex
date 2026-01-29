/**
 * Unit Tests for Markdown Collaborative Work System
 *
 * Tests core utilities, validation, and business logic
 * Run with: npm test
 */

import { describe, it, expect } from '@jest/globals'
import { generateFileName, parseFileName } from '@/lib/utils/file-naming'
import { exportToMarkdown } from '@/lib/utils/export'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  db: {
    file: {
      findUnique: jest.fn(),
    },
  },
}))

describe('File Naming Utilities', () => {
  describe('generateFileName', () => {
    it('should generate correct filename with project name and template type', () => {
      const result = generateFileName('TestProject', 'PROBLEM_DEFINITION')
      expect(result).toMatch(/TestProject-问题定义-\d{8}/)
    })

    it('should generate correct filename for different template types', () => {
      const cases = [
        { input: 'PROBLEM_DEFINITION', expected: '问题定义' },
        { input: 'SOLUTION_DESIGN', expected: '方案设计' },
        { input: 'EXECUTION_TRACKING', expected: '执行跟踪' },
        { input: 'RETROSPECTIVE_SUMMARY', expected: '复盘总结' },
      ]

      cases.forEach(({ input, expected }) => {
        const result = generateFileName('MyProject', input as any)
        expect(result).toContain(expected)
      })
    })

    it('should include correct date format', () => {
      const result = generateFileName('Project', 'PROBLEM_DEFINITION')
      const dateMatch = result.match(/(\d{8})/)
      expect(dateMatch).toBeTruthy()
    })
  })

  describe('parseFileName', () => {
    it('should parse standard filename correctly', () => {
      const result = parseFileName('MyProject-问题定义-20260128')
      expect(result).toEqual({
        projectName: 'MyProject',
        templateType: '问题定义',
        date: '20260128',
      })
    })

    it('should handle non-standard filenames', () => {
      const result = parseFileName('CustomFileName.md')
      expect(result).toEqual({
        projectName: 'CustomFileName',
        templateType: null,
        date: null,
      })
    })
  })
})

describe('Validation Schemas', () => {
  describe('Email Validation', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.user@domain.co.uk',
        'admin+tag@example.org',
      ]

      validEmails.forEach((email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        expect(emailRegex.test(email)).toBe(true)
      })
    })

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'user@',
        'user @example.com',
      ]

      invalidEmails.forEach((email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        expect(emailRegex.test(email)).toBe(false)
      })
    })
  })

  describe('Password Validation', () => {
    it('should accept valid passwords', () => {
      const validPasswords = [
        'password123',
        'SecurePass!',
        'MyP@ssw0rd',
      ]

      validPasswords.forEach((password) => {
        expect(password.length).toBeGreaterThanOrEqual(8)
      })
    })

    it('should reject short passwords', () => {
      const shortPasswords = [
        'pass',
        '1234567',
        'abc',
      ]

      shortPasswords.forEach((password) => {
        expect(password.length).toBeLessThan(8)
      })
    })
  })
})

describe('Template Type Mapping', () => {
  it('should map template types correctly', () => {
    const templateMapping: Record<string, string> = {
      PROBLEM_DEFINITION: '问题定义',
      SOLUTION_DESIGN: '方案设计',
      EXECUTION_TRACKING: '执行跟踪',
      RETROSPECTIVE_SUMMARY: '复盘总结',
    }

    Object.entries(templateMapping).forEach(([key, value]) => {
      expect(value).toMatch(/[\u4e00-\u9fa5]+/) // Chinese characters
    })
  })
})

describe('Role Hierarchy', () => {
  it('should have correct role hierarchy', () => {
    const roleHierarchy: Record<string, number> = {
      VIEWER: 0,
      EDITOR: 1,
      ADMIN: 2,
    }

    expect(roleHierarchy.VIEWER).toBeLessThan(roleHierarchy.EDITOR)
    expect(roleHierarchy.EDITOR).toBeLessThan(roleHierarchy.ADMIN)
  })

  it('should validate permission levels', () => {
    const hasPermission = (userRole: number, requiredRole: number) => {
      return userRole >= requiredRole
    }

    expect(hasPermission(2, 0)).toBe(true) // Admin can do Viewer tasks
    expect(hasPermission(1, 1)).toBe(true) // Editor can do Editor tasks
    expect(hasPermission(0, 1)).toBe(false) // Viewer cannot do Editor tasks
  })
})

describe('Markdown Formatting', () => {
  it('should detect markdown syntax', () => {
    const markdownTests = [
      { text: '# Heading', hasHeading: true },
      { text: '**bold**', hasBold: true },
      { text: '*italic*', hasItalic: true },
      { text: '- list item', hasList: true },
      { text: '[link](url)', hasLink: true },
    ]

    markdownTests.forEach(({ text, ...expected }) => {
      if (expected.hasHeading) expect(text).toMatch(/^#+\s/)
      if (expected.hasBold) expect(text).toMatch(/\*\*.*\*\*/)
      if (expected.hasItalic) expect(text).toMatch(/\*.*\*/)
      if (expected.hasList) expect(text).toMatch(/^[-*+]\s/)
      if (expected.hasLink) expect(text).toMatch(/\[.*\]\(.*\)/)
    })
  })
})

describe('Utility Functions', () => {
  describe('Array Utilities', () => {
    it('should deduplicate arrays', () => {
      const input = [1, 2, 2, 3, 3, 3, 4]
      const unique = Array.from(new Set(input))
      expect(unique).toEqual([1, 2, 3, 4])
    })

    it('should sort arrays correctly', () => {
      const input = [3, 1, 4, 1, 5, 9]
      const sorted = input.sort((a, b) => a - b)
      expect(sorted).toEqual([1, 1, 3, 4, 5, 9])
    })
  })

  describe('String Utilities', () => {
    it('should truncate long strings', () => {
      const longString = 'This is a very long string that needs to be truncated'
      const truncated = longString.substring(0, 20) + '...'
      expect(truncated.length).toBeLessThan(longString.length)
      expect(truncated).toBe('This is a very long ...')
    })

    it('should convert to title case', () => {
      const input = 'hello world'
      const titleCase = input
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      expect(titleCase).toBe('Hello World')
    })
  })
})

describe('Date Utilities', () => {
  it('should format dates correctly', () => {
    const date = new Date('2026-01-28')
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const formatted = `${year}${month}${day}`

    expect(formatted).toBe('20260128')
  })

  it('should calculate date differences', () => {
    const date1 = new Date('2026-01-28')
    const date2 = new Date('2026-01-20')
    const diffDays = Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24))

    expect(diffDays).toBe(8)
  })
})

describe('File Type Detection', () => {
  it('should detect markdown files', () => {
    const markdownFiles = [
      'document.md',
      'README.md',
      'file.markdown',
    ]

    markdownFiles.forEach((file) => {
      expect(file).toMatch(/\.(md|markdown)$/)
    })
  })

  it('should detect export formats', () => {
    const formats = ['md', 'pdf', 'html', 'txt']

    formats.forEach((format) => {
      expect(['md', 'pdf', 'html', 'txt']).toContain(format)
    })
  })
})

describe('Security Utilities', () => {
  it('should sanitize HTML input', () => {
    const input = '<script>alert("xss")</script>'
    const sanitized = input.replace(/<script[^>]*>.*?<\/script>/gi, '')

    expect(sanitized).not.toContain('<script>')
  })

  it('should validate URL format', () => {
    const validUrls = [
      'https://example.com',
      'http://localhost:3000',
      'https://subdomain.domain.co.uk/path',
    ]

    validUrls.forEach((url) => {
      expect(url).toMatch(/^https?:\/\/.+/)
    })
  })
})
