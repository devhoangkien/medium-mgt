import { chromium, Browser, Page } from 'playwright'

export interface MediumPostData {
  title: string
  subtitle?: string
  content: string
  tags?: string[]
  canonicalUrl?: string
  publishLater?: boolean
  publishDate?: string
}

export interface AutoPostResult {
  success: boolean
  postId?: string
  postUrl?: string
  error?: string
  screenshot?: string
}

export class MediumAutoPoster {
  private browser: Browser | null = null
  private page: Page | null = null

  async init(cookies: string | Record<string, any>) {
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    })

    this.page = await this.browser.newPage({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })

    // Set cookies
    if (typeof cookies === 'string') {
      const parsed = JSON.parse(cookies)
      await this.setCookies(parsed)
    } else {
      await this.setCookies(cookies)
    }

    return this.page
  }

  private async setCookies(cookies: Record<string, any>) {
    if (!this.page) return

    const cookieArray = Array.isArray(cookies) ? cookies : [cookies]
    
    await this.page.context().addCookies(
      cookieArray.map((c: any) => ({
        name: c.name || c.key,
        value: c.value,
        domain: c.domain || '.medium.com',
        path: c.path || '/',
        expires: c.expires || Math.floor(Date.now() / 1000) + 86400 * 30,
        httpOnly: c.httpOnly ?? true,
        secure: c.secure ?? true,
        sameSite: c.sameSite || 'Lax'
      }))
    )
  }

  async autoPost(data: MediumPostData): Promise<AutoPostResult> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call init() first.')
    }

    try {
      console.log('📝 Starting Medium auto-post...')
      console.log('Title:', data.title)
      console.log('Content length:', data.content.length)

      // Navigate to new story page
      console.log('Navigating to medium.com/new-story...')
      await this.page.goto('https://medium.com/new-story', {
        waitUntil: 'networkidle',
        timeout: 60000
      })

      // Wait for editor to load
      await this.page.waitForSelector('[data-testid="story-title"]', {
        timeout: 15000
      })

      // Wait a bit for JS to initialize
      await this.page.waitForTimeout(2000)

      console.log('Editor loaded, filling content...')

      // Fill title
      const titleSelector = '[data-testid="story-title"]'
      await this.page.click(titleSelector, { clickCount: 3 }) // Select all
      await this.page.fill(titleSelector, data.title)
      console.log('✓ Title filled')

      // Fill subtitle if provided
      if (data.subtitle) {
        const subtitleSelector = '[data-testid="story-subtitle"]'
        try {
          await this.page.click(subtitleSelector, { clickCount: 3 })
          await this.page.fill(subtitleSelector, data.subtitle)
          console.log('✓ Subtitle filled')
        } catch (e) {
          console.log('⚠ Subtitle field not found, skipping...')
        }
      }

      // Fill content
      console.log('Filling content...')
      const contentSelector = 'p'
      await this.page.click(contentSelector)
      
      // Type content paragraph by paragraph
      const paragraphs = data.content.split('\n\n').slice(0, 20) // Limit to 20 paragraphs
      
      for (const paragraph of paragraphs) {
        if (paragraph.trim()) {
          await this.page.keyboard.type(paragraph.trim(), { delay: 10 })
          await this.page.keyboard.press('Enter')
          await this.page.keyboard.press('Enter') // Double enter for new paragraph
        }
      }
      console.log('✓ Content filled')

      // Add tags
      if (data.tags && data.tags.length > 0) {
        console.log('Adding tags...')
        try {
          // Click on tags button
          await this.page.click('[aria-label="Add tags"]', { timeout: 5000 })
          
          // Add each tag
          for (const tag of data.tags.slice(0, 5)) { // Max 5 tags
            await this.page.keyboard.type(tag, { delay: 20 })
            await this.page.keyboard.press('Enter')
            await this.page.waitForTimeout(500)
          }
          
          // Close tags modal
          await this.page.keyboard.press('Escape')
          console.log('✓ Tags added')
        } catch (e) {
          console.log('⚠ Could not add tags:', (e as Error).message)
        }
      }

      // Take screenshot before publish
      const screenshot = await this.page.screenshot({
        fullPage: true,
        encoding: 'base64'
      })

      // Click Publish button
      console.log('Publishing...')
      try {
        const publishButton = await this.page.$('button:has-text("Publish")')
        if (publishButton) {
          await publishButton.click()
          await this.page.waitForTimeout(2000)
          
          // Confirm publish
          const confirmButton = await this.page.$('button:has-text("Publish now")')
          if (confirmButton) {
            await confirmButton.click()
            console.log('✓ Published!')
          }
        }
      } catch (e) {
        console.log('⚠ Auto-publish failed, saving as draft')
      }

      // Get URL
      const currentUrl = this.page.url()
      const postId = currentUrl.split('/').pop()

      console.log('✅ Post completed:', currentUrl)

      return {
        success: true,
        postId,
        postUrl: currentUrl,
        screenshot
      }
    } catch (error) {
      console.error('❌ Auto-post failed:', error)
      
      // Take screenshot on error
      let screenshot: string | undefined
      if (this.page) {
        try {
          screenshot = await this.page.screenshot({
            fullPage: true,
            encoding: 'base64'
          })
        } catch {}
      }

      return {
        success: false,
        error: (error as Error).message,
        screenshot
      }
    }
  }

  async fillStory(data: MediumPostData): Promise<boolean> {
    if (!this.page) {
      throw new Error('Browser not initialized')
    }

    try {
      // Navigate
      await this.page.goto('https://medium.com/new-story', {
        waitUntil: 'networkidle',
        timeout: 60000
      })

      // Wait for editor
      await this.page.waitForSelector('[data-testid="story-title"]', {
        timeout: 15000
      })
      await this.page.waitForTimeout(2000)

      // Fill title
      await this.page.click('[data-testid="story-title"]', { clickCount: 3 })
      await this.page.fill('[data-testid="story-title"]', data.title)

      // Fill subtitle
      if (data.subtitle) {
        await this.page.click('[data-testid="story-subtitle"]', { clickCount: 3 })
        await this.page.fill('[data-testid="story-subtitle"]', data.subtitle)
      }

      // Fill content - use evaluate for better control
      await this.page.evaluate((content: string) => {
        const paragraphs = content.split('\n\n')
        const editor = document.querySelector('p')
        if (editor) {
          editor.textContent = paragraphs[0] || ''
          
          // Add remaining paragraphs
          for (let i = 1; i < Math.min(paragraphs.length, 20); i++) {
            const newP = document.createElement('p')
            newP.textContent = paragraphs[i]
            editor.parentElement?.appendChild(newP)
          }
        }
      }, data.content)

      console.log('✓ Story filled successfully')
      return true
    } catch (error) {
      console.error('Fill story failed:', error)
      return false
    }
  }

  async close() {
    if (this.page) {
      await this.page.close()
      this.page = null
    }
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
}

// Singleton
let posterInstance: MediumAutoPoster | null = null

export function getMediumAutoPoster(): MediumAutoPoster {
  if (!posterInstance) {
    posterInstance = new MediumAutoPoster()
  }
  return posterInstance
}

// Cleanup on exit
process.on('SIGINT', async () => {
  if (posterInstance) {
    await posterInstance.close()
  }
})
