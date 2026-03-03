import { chromium, Browser, Page } from 'playwright'

export interface CrawlResult {
  url: string
  title: string
  content: string
  author?: string
  publishedAt?: string
  tags?: string[]
  images?: string[]
  rawHtml?: string
}

export interface CrawlConfig {
  selector?: string
  waitForSelector?: string
  delay?: number
  headers?: Record<string, string>
  timeout?: number
}

export class WebCrawler {
  private browser: Browser | null = null

  async init() {
    if (!this.browser) {
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
    }
    return this.browser
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  async crawl(url: string, config: CrawlConfig = {}): Promise<CrawlResult> {
    await this.init()
    
    const {
      selector,
      waitForSelector,
      delay = 1000,
      timeout = 30000
    } = config

    const page = await this.browser!.newPage({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })

    try {
      // Set timeout
      page.setDefaultTimeout(timeout)

      // Navigate to page
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout
      })

      // Wait for content to load
      if (waitForSelector) {
        await page.waitForSelector(waitForSelector, { timeout: 10000 })
      }

      // Delay to ensure JS rendered
      if (delay > 0) {
        await page.waitForTimeout(delay)
      }

      // Extract content
      const result = await page.evaluate((sel?: string) => {
        // Get title
        const title = document.querySelector('h1')?.textContent?.trim() || 
                     document.title || 
                     ''

        // Get author
        const author = document.querySelector('[rel="author"]')?.textContent?.trim() ||
                      document.querySelector('.author-name')?.textContent?.trim() ||
                      document.querySelector('[class*="author"]')?.textContent?.trim() ||
                      undefined

        // Get published date
        const publishedAt = document.querySelector('time')?.getAttribute('datetime') ||
                           document.querySelector('[class*="date"]')?.textContent?.trim() ||
                           undefined

        // Get tags
        const tagElements = document.querySelectorAll('[rel="tag"], [class*="tag"]')
        const tags = Array.from(tagElements).map(el => el.textContent?.trim()).filter(Boolean) as string[]

        // Get images
        const imgElements = document.querySelectorAll('article img, .content img, main img')
        const images = Array.from(imgElements).map(el => {
          const src = el.getAttribute('src') || el.getAttribute('data-src')
          return src ? (src.startsWith('http') ? src : `https://juejin.cn${src}`) : ''
        }).filter(Boolean) as string[]

        // Get main content
        let content = ''
        if (sel) {
          const el = document.querySelector(sel)
          content = el?.textContent || ''
        } else {
          // Try common selectors
          const articleEl = document.querySelector('article') ||
                           document.querySelector('.article-content') ||
                           document.querySelector('.content') ||
                           document.querySelector('main') ||
                           document.querySelector('[class*="content"]')
          content = articleEl?.textContent || ''
        }

        // Clean up content
        content = content
          .replace(/\s+/g, ' ')
          .replace(/\n\s*\n/g, '\n\n')
          .trim()

        return {
          title,
          content,
          author,
          publishedAt,
          tags: tags.slice(0, 10),
          images: images.slice(0, 5)
        }
      }, selector)

      return {
        url,
        ...result
      }
    } catch (error) {
      console.error('Crawl error:', error)
      throw error
    } finally {
      await page.close()
    }
  }

  // Crawl multiple URLs
  async crawlBatch(urls: string[], config: CrawlConfig = {}, concurrency = 3): Promise<CrawlResult[]> {
    const results: CrawlResult[] = []
    
    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency)
      const batchResults = await Promise.allSettled(
        batch.map(url => this.crawl(url, config))
      )
      
      batchResults.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          console.error(`Failed to crawl ${batch[idx]}:`, result.reason)
        }
      })

      // Delay between batches
      if (i + concurrency < urls.length) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    return results
  }
}

// Singleton instance
let crawlerInstance: WebCrawler | null = null

export function getCrawler(): WebCrawler {
  if (!crawlerInstance) {
    crawlerInstance = new WebCrawler()
  }
  return crawlerInstance
}

// Graceful shutdown
process.on('SIGINT', async () => {
  if (crawlerInstance) {
    await crawlerInstance.close()
  }
})
