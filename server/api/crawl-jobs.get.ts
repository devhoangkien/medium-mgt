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

    const query = getQuery(event)
    const status = query.status as string
    const limit = parseInt(query.limit as string) || 20
    const sourceId = query.sourceId as string

    const where: any = {
      source: {
        userId: user.id
      }
    }

    if (status) {
      where.status = status
    }

    if (sourceId) {
      where.sourceId = sourceId
    }

    const jobs = await prisma.crawlJob.findMany({
      where,
      include: {
        source: {
          select: {
            id: true,
            name: true,
            url: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    // Get stats
    const stats = await prisma.crawlJob.groupBy({
      by: ['status'],
      where: {
        source: {
          userId: user.id
        }
      },
      _count: true
    })

    return {
      success: true,
      data: jobs,
      stats: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count
        return acc
      }, {} as Record<string, number>)
    }
  } catch (error) {
    console.error('Get crawl jobs error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch crawl jobs'
    })
  }
})
