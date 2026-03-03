import { H3Event } from 'h3'
import prisma from '~/server/utils/prisma'
import { getCrawler } from '~/server/services/crawler'
import { getOpenClawRewriter } from '~/server/services/openclaw-rewrite'
import { getMediumAutoPoster } from '~/server/services/medium-auto-poster'

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
    const {
      url,
      sourceId,
      rewrite = true,
      rewriteStyle = 'blog',
      rewriteLanguage = 'zh',
      autoPost = false,
      mediumAccountId
    } = body

    // Validate
    if (!url && !sourceId) {
      throw createError({
        statusCode: 400,
        message: 'URL or sourceId is required'
      })
    }

    // Get source
    let source = null
    if (sourceId) {
      source = await prisma.crawlSource.findFirst({
        where: { id: sourceId, userId: user.id }
      })
      if (!source) {
        throw createError({
          statusCode: 404,
          message: 'Source not found'
        })
      }
    }

    const targetUrl = url || source?.url

    // Get Medium account if auto-post enabled
    let mediumAccount = null
    if (autoPost && mediumAccountId) {
      mediumAccount = await prisma.mediumAccount.findFirst({
        where: {
          id: mediumAccountId,
          userId: user.id
        }
      })
      
      if (!mediumAccount) {
        throw createError({
          statusCode: 400,
          message: 'Medium account not found or not authorized'
        })
      }

      if (!mediumAccount.cookies) {
        throw createError({
          statusCode: 400,
          message: 'Medium account has no stored cookies'
        })
      }
    }

    // Create job
    const job = await prisma.crawlJob.create({
      data: {
        sourceId: source?.id || 'manual',
        url: targetUrl,
        status: 'RUNNING'
      }
    })

    console.log(`🚀 Starting auto-crawl job ${job.id}`)
    console.log(`URL: ${targetUrl}`)
    console.log(`Rewrite: ${rewrite}`)
    console.log(`Auto-post: ${autoPost}`)

    // Process in background
    processAutoCrawl(
      job.id,
      targetUrl,
      source?.selector,
      rewrite,
      rewriteStyle,
      rewriteLanguage,
      autoPost,
      mediumAccount
    ).catch(err => console.error('Background auto-crawl failed:', err))

    return {
      success: true,
      data: {
        jobId: job.id,
        status: 'RUNNING',
        message: autoPost 
          ? 'Crawling → Rewriting → Auto-posting to Medium...'
          : 'Crawling → Rewriting...'
      }
    }
  } catch (error) {
    console.error('Start auto-crawl error:', error)
    
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to start auto-crawl job'
    })
  }
})

// Background processor
async function processAutoCrawl(
  jobId: string,
  url: string,
  selector: string | null,
  rewrite: boolean,
  rewriteStyle: string,
  rewriteLanguage: string,
  autoPost: boolean,
  mediumAccount: any
) {
  const crawler = getCrawler()
  const rewriter = getOpenClawRewriter()
  const poster = getMediumAutoPoster()

  let articleId: string | null = null

  try {
    await prisma.crawlJob.update({
      where: { id: jobId },
      data: { status: 'RUNNING', startedAt: new Date() }
    })

    // Step 1: Crawl
    console.log(`🕷️ Step 1: Crawling ${url}...`)
    const crawlResult = await crawler.crawl(url, {
      selector: selector || undefined,
      delay: 2000,
      timeout: 60000
    })
    console.log(`✓ Crawled: ${crawlResult.title}`)

    await prisma.crawlJob.update({
      where: { id: jobId },
      data: {
        rawContent: crawlResult.content,
        status: rewrite || autoPost ? 'RUNNING' : 'COMPLETED'
      }
    })

    // Step 2: Rewrite with OpenClaw
    let rewrittenContent = crawlResult.content
    let openclawResponse = null

    if (rewrite || autoPost) {
      console.log(`✨ Step 2: Rewriting with OpenClaw...`)
      
      try {
        const rewritten = await rewriter.rewrite({
          title: crawlResult.title,
          content: crawlResult.content,
          sourceUrl: url,
          style: rewriteStyle as any,
          language: rewriteLanguage as any,
          tone: 'professional',
          length: 'same'
        })

        rewrittenContent = rewritten.content
        openclawResponse = {
          title: rewritten.title,
          summary: rewritten.summary,
          tags: rewritten.tags
        }

        console.log(`✓ Rewritten: ${rewritten.title}`)
      } catch (rewriteError) {
        console.error('⚠ Rewrite failed, using original content')
        rewrittenContent = crawlResult.content
      }
    }

    // Step 3: Create article in database
    console.log(`💾 Step 3: Saving article to database...`)
    const article = await prisma.article.create({
      data: {
        userId: mediumAccount?.userId || (await prisma.crawlJob.findUnique({ where: { id: jobId } })).then(j => j && j.source ? (prisma.crawlSource.findUnique({ where: { id: j.sourceId } }).then(s => s?.userId)) : null) as string,
        mediumAccountId: mediumAccount?.id || null,
        title: openclawResponse?.title || crawlResult.title || 'Untitled',
        content: rewrittenContent,
        markdown: crawlResult.content,
        tags: openclawResponse?.tags || crawlResult.tags || [],
        status: autoPost ? 'PUBLISHING' : 'DRAFT',
        publishedAt: autoPost ? null : new Date()
      }
    })
    articleId = article.id
    console.log(`✓ Article saved: ${article.id}`)

    // Step 4: Auto-post to Medium
    if (autoPost && mediumAccount) {
      console.log(`📤 Step 4: Auto-posting to Medium...`)
      
      try {
        // Initialize poster with cookies
        await poster.init(mediumAccount.cookies as any)

        // Post to Medium
        const postResult = await poster.autoPost({
          title: openclawResponse?.title || article.title,
          subtitle: openclawResponse?.summary,
          content: rewrittenContent,
          tags: openclawResponse?.tags,
          canonicalUrl: url
        })

        if (postResult.success) {
          console.log(`✓ Posted to Medium: ${postResult.postUrl}`)

          // Update article
          await prisma.article.update({
            where: { id: articleId! },
            data: {
              status: 'PUBLISHED',
              publishedAt: new Date()
            }
          })

          // Create post log
          await prisma.postLog.create({
            data: {
              articleId: articleId!,
              mediumAccountId: mediumAccount.id,
              status: 'SUCCESS',
              mediumPostId: postResult.postId,
              mediumUrl: postResult.postUrl,
              userId: mediumAccount.userId
            }
          })

          // Update job
          await prisma.crawlJob.update({
            where: { id: jobId },
            data: {
              rewrittenContent,
              openclawResponse: JSON.stringify(openclawResponse),
              status: 'COMPLETED',
              completedAt: new Date()
            }
          })
        } else {
          throw new Error(postResult.error || 'Post failed')
        }
      } catch (postError) {
        console.error('❌ Auto-post failed:', postError)
        
        // Save error
        await prisma.article.update({
          where: { id: articleId! },
          data: {
            status: 'FAILED',
          }
        })

        await prisma.postLog.create({
          data: {
            articleId: articleId!,
            mediumAccountId: mediumAccount.id,
            status: 'FAILED',
            errorMessage: (postError as Error).message,
            userId: mediumAccount.userId
          }
        })

        throw postError
      } finally {
        await poster.close()
      }
    } else {
      // No auto-post, just save
      await prisma.crawlJob.update({
        where: { id: jobId },
        data: {
          rewrittenContent,
          openclawResponse: JSON.stringify(openclawResponse),
          status: 'COMPLETED',
          completedAt: new Date()
        }
      })
    }

    console.log(`✅ Job ${jobId} completed successfully!`)

  } catch (error) {
    console.error(`❌ Job ${jobId} failed:`, error)
    
    await prisma.crawlJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        error: (error as Error).message,
        completedAt: new Date()
      }
    })
  } finally {
    // Cleanup
    setTimeout(async () => {
      await crawler.close().catch(console.error)
      await poster.close().catch(console.error)
    }, 5000)
  }
}
