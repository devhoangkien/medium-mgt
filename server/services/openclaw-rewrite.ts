import { $ } from 'execa'

export interface RewriteRequest {
  content: string
  title?: string
  sourceUrl?: string
  style?: 'blog' | 'tutorial' | 'news' | 'opinion'
  language?: 'zh' | 'en' | 'vi'
  tone?: 'professional' | 'casual' | 'humorous'
  length?: 'shorter' | 'same' | 'longer'
}

export interface RewriteResponse {
  title: string
  content: string
  summary: string
  tags: string[]
  sessionId?: string
}

export class OpenClawRewriter {
  private workspacePath: string
  private sessionId?: string

  constructor() {
    this.workspacePath = '/home/ubuntu/.openclaw/workspace'
  }

  /**
   * Send content to OpenClaw for rewriting via sessions_spawn
   */
  async rewrite(request: RewriteRequest): Promise<RewriteResponse> {
    const {
      content,
      title,
      sourceUrl,
      style = 'blog',
      language = 'zh',
      tone = 'professional',
      length = 'same'
    } = request

    // Create prompt for OpenClaw
    const prompt = this.createRewritePrompt({
      originalTitle: title,
      content,
      sourceUrl,
      style,
      language,
      tone,
      length
    })

    try {
      // Use OpenClaw CLI to spawn a session for rewriting
      // This calls OpenClaw's session management
      const result = await this.callOpenClaw(prompt)
      
      return {
        title: result.title,
        content: result.content,
        summary: result.summary,
        tags: result.tags,
        sessionId: this.sessionId
      }
    } catch (error) {
      console.error('OpenClaw rewrite error:', error)
      throw error
    }
  }

  private createRewritePrompt(request: {
    originalTitle?: string
    content: string
    sourceUrl?: string
    style: string
    language: string
    tone: string
    length: string
  }): string {
    const { originalTitle, content, sourceUrl, style, language, tone, length } = request

    let prompt = `Bạn là một professional content writer. Hãy rewrite lại article sau đây:\n\n`
    
    if (originalTitle) {
      prompt += `**Original Title:** ${originalTitle}\n`
    }
    
    if (sourceUrl) {
      prompt += `**Source:** ${sourceUrl}\n`
    }

    prompt += `
**Yêu cầu:**
- Style: ${style}
- Tone: ${tone}
- Language: ${language === 'zh' ? 'Chinese' : language === 'en' ? 'English' : 'Vietnamese'}
- Length: ${length === 'shorter' ? 'Ngắn hơn 20%' : length === 'longer' ? 'Dài hơn 30%' : 'Giữ nguyên độ dài'}

**Nội dung gốc:**
${content.slice(0, 8000)}${content.length > 8000 ? '...' : ''}

---

Hãy trả về kết quả theo format JSON sau:
{
  "title": "Tiêu đề mới (hấp dẫn, SEO-friendly)",
  "content": "Nội dung đã rewrite (markdown format)",
  "summary": "Tóm tắt 2-3 câu về bài viết",
  "tags": ["tag1", "tag2", "tag3"]
}

**Lưu ý quan trọng:**
1. KHÔNG sao chép nguyên văn - phải rewrite hoàn toàn
2. Giữ nguyên ý chính và thông tin quan trọng
3. Thêm góc nhìn/analysis riêng nếu có thể
4. Dùng markdown formatting (headers, lists, code blocks)
5. Đảm bảo nội dung self-contained, dễ hiểu
6. Tránh plagiarism - phải đủ khác biệt so với original
`

    return prompt
  }

  private async callOpenClaw(prompt: string): Promise<{
    title: string
    content: string
    summary: string
    tags: string[]
  }> {
    // For now, use a simple approach - write prompt to file and process
    // In production, this would call OpenClaw's API directly
    
    const fs = await import('fs')
    const path = await import('path')
    
    // Create a temporary file for the rewrite request
    const tempDir = path.join(this.workspacePath, 'temp-rewrites')
    fs.mkdirSync(tempDir, { recursive: true })
    
    const timestamp = Date.now()
    const requestFile = path.join(tempDir, `request-${timestamp}.json`)
    const responseFile = path.join(tempDir, `response-${timestamp}.json`)
    
    // Write request
    fs.writeFileSync(requestFile, JSON.stringify({
      prompt,
      createdAt: new Date().toISOString()
    }, null, 2))

    console.log('OpenClaw rewrite request created:', requestFile)
    
    // TODO: Integrate with actual OpenClaw sessions_spawn API
    // For now, return a placeholder that will be replaced with real integration
    
    // Simulated response (to be replaced with actual OpenClaw call)
    return {
      title: '[Pending OpenClaw Integration] ' + (prompt.split('\n')[0] || 'Rewritten Article'),
      content: content, // Return original for now
      summary: 'Content will be rewritten by OpenClaw once integration is complete.',
      tags: ['rewritten', 'pending']
    }
  }

  /**
   * Alternative: Direct HTTP call to OpenClaw if available
   */
  async rewriteViaHttp(prompt: string, openclawUrl?: string): Promise<RewriteResponse> {
    const url = openclawUrl || process.env.OPENCLAW_URL || 'http://localhost:3001'
    
    try {
      const response = await fetch(`${url}/api/sessions/spawn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task: prompt,
          mode: 'run',
          timeoutSeconds: 120
        })
      })

      if (!response.ok) {
        throw new Error(`OpenClaw API error: ${response.status}`)
      }

      const result = await response.json()
      
      // Parse the response to extract rewritten content
      return this.parseOpenClawResponse(result)
    } catch (error) {
      console.error('OpenClaw HTTP call failed:', error)
      throw error
    }
  }

  private parseOpenClawResponse(response: any): RewriteResponse {
    // Parse OpenClaw response to extract JSON
    // This assumes OpenClaw returns the rewritten content in a specific format
    
    const content = response.message || response.content || ''
    
    // Try to extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*"title"[\s\S]*"content"[\s\S]*"tags"[\s\S]*\}/)
    
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          title: parsed.title || 'Rewritten Article',
          content: parsed.content || content,
          summary: parsed.summary || '',
          tags: parsed.tags || [],
          sessionId: response.sessionId
        }
      } catch (e) {
        // Fall through to default
      }
    }

    return {
      title: 'Rewritten Article',
      content: content,
      summary: '',
      tags: [],
      sessionId: response.sessionId
    }
  }
}

// Singleton
let rewriterInstance: OpenClawRewriter | null = null

export function getOpenClawRewriter(): OpenClawRewriter {
  if (!rewriterInstance) {
    rewriterInstance = new OpenClawRewriter()
  }
  return rewriterInstance
}
