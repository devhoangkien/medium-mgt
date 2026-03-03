import { H3Event } from 'h3'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const user = event.context.user
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    const id = event.context.params?.id
    
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Job ID is required'
      })
    }

    const job = await prisma.crawlJob.findFirst({
      where: { id },
      include: {
        source: {
          select: {
            id: true,
            name: true,
            url: true
          }
        }
      }
    })

    if (!job) {
      throw createError({
        statusCode: 404,
        message: 'Crawl job not found'
      })
    }

    // Calculate progress
    let progress = 0
    if (job.status === 'RUNNING') {
      progress = job.rawContent ? 50 : 25
    } else if (job.status === 'COMPLETED') {
      progress = 100
    } else if (job.status === 'FAILED') {
      progress = 0
    }

    return {
      success: true,
      data: {
        id: job.id,
        url: job.url,
        status: job.status,
        progress,
        source: job.source,
        rawContent: job.rawContent,
        rewrittenContent: job.rewrittenContent,
        openclawResponse: job.openclawResponse ? JSON.parse(job.openclawResponse) : null,
        error: job.error,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        createdAt: job.createdAt,
        duration: job.startedAt && job.completedAt 
          ? Math.round((job.completedAt.getTime() - job.startedAt.getTime()) / 1000)
          : null
      }
    }
  } catch (error) {
    console.error('Get crawl job error:', error)
    
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch crawl job'
    })
  }
})
