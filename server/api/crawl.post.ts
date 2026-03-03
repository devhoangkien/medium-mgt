import { H3Event } from 'h3'
import prisma from '~/server/utils/prisma'
import { getCrawler } from '~/server/services/crawler'
import { getOpenClawRewriter } from '~/server/services/openclaw-rewrite'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const user = event.context.user
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    const body = await readBody(event)
    const { sourceId, url, rewrite = true, rewriteStyle = 'blog', rewriteLanguage = 'zh' } = body

    // Validate input
    if (!url && !sourceId) {
      throw createError({
        statusCode: 400,
        message: 'URL or sourceId is required'
      })
    }

    // Get source if provided
    let source = null
    if (sourceId) {
      source = await prisma.crawlSource.findFirst({
        where: {
          id: sourceId,
          userId: user.id
        }
      })

      if (!source) {
        throw createError({
          statusCode: 404,
          message: 'Crawl source not found'
        })
      }
    }

    const targetUrl = url || source?.url
    if (!targetUrl) {
      throw createError({
        statusCode: 400,
        message: 'No URL to crawl'
      })
    }

    // Create crawl job
    const job = await prisma.crawlJob.create({
      data: {
        sourceId: source?.id || 'manual',
        url: targetUrl,
        status: 'RUNNING'
      }
    })

    console.log(`Starting crawl job ${job.id} for ${targetUrl}`)

    // Start crawling (async, don't wait)
    processCrawl(job.id, targetUrl, source?.selector, rewrite, rewriteStyle, rewriteLanguage)
      .catch(err => console.error('Background crawl failed:', err))

    return {
      success: true,
      data: {
        jobId: job.id,
        status: 'RUNNING',
        message: 'Crawl job started. Check status with GET /api/crawl/:id'
      }
    }
  } catch (error) {
    console.error('Start crawl error:', error)
    
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to start crawl job'
    })
  }
})

// Background crawl processor
async function processCrawl(
  jobId: string,
  url: string,
  selector: string | null,
  rewrite: boolean,
  rewriteStyle: string,
  rewriteLanguage: string
) {
  const crawler = getCrawler()
  const rewriter = getOpenClawRewriter()

  try {
    // Update job status
    await prisma.crawlJob.update({
      where: { id: jobId },
      data: {
        status: 'RUNNING',
        startedAt: new Date()
      }
    })

    // Crawl the page
    console.log(`Crawling ${url}...`)
    const result = await crawler.crawl(url, {
      selector: selector || undefined,
      delay: 2000,
      timeout: 60000
    })

    console.log(`Crawled successfully: ${result.title}`)

    // Update with raw content
    await prisma.crawlJob.update({
      where: { id: jobId },
      data: {
        rawContent: result.content,
        status: rewrite ? 'RUNNING' : 'COMPLETED',
        completedAt: rewrite ? null : new Date()
      }
    })

    // Rewrite with OpenClaw if requested
    if (rewrite && result.content) {
      console.log(`Rewriting content with OpenClaw...`)
      
      try {
        const rewritten = await rewriter.rewrite({
          title: result.title,
          content: result.content,
          sourceUrl: url,
          style: rewriteStyle as any,
          language: rewriteLanguage as any,
          tone: 'professional',
          length: 'same'
        })

        await prisma.crawlJob.update({
          where: { id: jobId },
          data: {
            rewrittenContent: rewritten.content,
            openclawResponse: JSON.stringify({
              title: rewritten.title,
              summary: rewritten.summary,
              tags: rewritten.tags
            }),
            status: 'COMPLETED',
            completedAt: new Date()
          }
        })

        console.log(`Rewrite completed for job ${jobId}`)
      } catch (rewriteError) {
        console.error('Rewrite failed:', rewriteError)
        
        await prisma.crawlJob.update({
          where: { id: jobId },
          data: {
            status: 'COMPLETED',
            error: 'Crawled successfully but rewrite failed: ' + (rewriteError as Error).message,
            completedAt: new Date()
          }
        })
      }
    }

    // Update source last crawled
    if (jobId !== 'manual') {
      const job = await prisma.crawlJob.findUnique({ where: { id: jobId } })
      if (job?.sourceId && job.sourceId !== 'manual') {
        await prisma.crawlSource.update({
          where: { id: job.sourceId },
          data: {
            lastCrawled: new Date()
          }
        })
      }
    }

  } catch (error) {
    console.error(`Crawl job ${jobId} failed:`, error)
    
    await prisma.crawlJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        error: (error as Error).message,
        completedAt: new Date()
      }
    })
  } finally {
    // Cleanup crawler after delay
    setTimeout(() => crawler.close().catch(console.error), 5000)
  }
}
