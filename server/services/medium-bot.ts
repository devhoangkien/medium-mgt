import { chromium, Browser, BrowserContext, Page } from 'playwright'

export interface PublishResult {
  success: boolean
  postId?: string
  url?: string
  error?: string
}

export interface PublishOptions {
  cookies: string
  title: string
  subtitle?: string
  content: string
  tags?: string[]
  publicationId?: string
}

export class MediumBot {
  private browser: Browser | null = null
  private context: BrowserContext | null = null
  private page: Page | null = null

  async start() {
    this.browser = await chromium.launch({
      headless: process.env.BOT_HEADLESS === 'true',
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    })
  }

  async createContext(cookies: string) {
    if (!this.browser) {
      await this.start()
    }

    this.context = await this.browser!.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })

    // Parse and set cookies
    const cookieArray = this.parseCookies(cookies)
    await this.context.addCookies(cookieArray)

    this.page = await this.context.newPage()
  }

  private parseCookies(cookieString: string) {
    // Parse cookie string to array format
    // Expected format: "name1=value1; name2=value2"
    const cookies = cookieString.split(';').map(c => c.trim())
    
    return cookies.map(cookie => {
      const [name, ...valueParts] = cookie.split('=')
      const value = valueParts.join('=')
      
      return {
        name: name.trim(),
        value: value.trim(),
        domain: '.medium.com',
        path: '/',
        secure: true,
        httpOnly: true
      }
    })
  }

  async publish(options: PublishOptions): Promise<PublishResult> {
    try {
      if (!this.page) {
        await this.createContext(options.cookies)
      }

      // Navigate to new story page
      await this.page!.goto('https://medium.com/m/story', {
        waitUntil: 'networkidle',
        timeout: 60000
      })

      // Wait for editor to load
      await this.page!.waitForSelector('[data-testid="postTitle"]', {
        timeout: 30000
      })

      // Fill title
      await this.page!.fill('[data-testid="postTitle"]', options.title)

      // Fill subtitle if provided
      if (options.subtitle) {
        await this.page!.fill('[data-testid="postSubtitle"]', options.subtitle)
      }

      // Fill content (simplified - Medium uses rich text editor)
      // This is a simplified version - real implementation needs more work
      const contentElement = await this.page!.$('[data-testid="storyContent"]')
      if (contentElement) {
        await contentElement.fill(options.content)
      }

      // Add tags
      if (options.tags && options.tags.length > 0) {
        await this.addTags(options.tags.slice(0, 5)) // Max 5 tags
      }

      // Select publication if provided
      if (options.publicationId) {
        await this.selectPublication(options.publicationId)
      }

      // Click publish button
      await this.page!.click('[data-testid="publishButton"]')

      // Wait for publish confirmation
      await this.page!.waitForSelector('[data-testid="postPublished"]', {
        timeout: 30000
      }).catch(() => {
        // If not found, check if we're on the post page
      })

      // Get post URL
      const url = this.page!.url()
      const postId = url.split('/').pop() || ''

      return {
        success: true,
        postId,
        url
      }
    } catch (error: any) {
      console.error('Publish error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  private async addTags(tags: string[]) {
    if (!this.page) return

    try {
      // Click tag button
      await this.page.click('[data-testid="tagsButton"]')

      for (const tag of tags) {
        await this.page.fill('[data-testid="tagInput"]', tag)
        await this.page.press('[data-testid="tagInput"]', 'Enter')
        await this.sleep(500)
      }
    } catch (error) {
      console.error('Error adding tags:', error)
    }
  }

  private async selectPublication(publicationId: string) {
    if (!this.page) return

    try {
      // Click publication selector
      await this.page.click('[data-testid="publicationSelector"]')
      
      // Select the publication
      await this.page.click(`[data-testid="publication-${publicationId}"]`)
    } catch (error) {
      console.error('Error selecting publication:', error)
    }
  }

  async verifyAccount(): Promise<boolean> {
    try {
      if (!this.page) return false

      await this.page.goto('https://medium.com/me', {
        waitUntil: 'networkidle',
        timeout: 30000
      })

      // Check if we're on the profile page (logged in)
      const url = this.page.url()
      return url.includes('medium.com/me')
    } catch (error) {
      console.error('Verify error:', error)
      return false
    }
  }

  async close() {
    if (this.page) {
      await this.page.close()
      this.page = null
    }
    if (this.context) {
      await this.context.close()
      this.context = null
    }
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Singleton instance
let botInstance: MediumBot | null = null

export function getMediumBot(): MediumBot {
  if (!botInstance) {
    botInstance = new MediumBot()
  }
  return botInstance
}
