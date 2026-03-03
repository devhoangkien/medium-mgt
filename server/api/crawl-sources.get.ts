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

    const sources = await prisma.crawlSource.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { crawlJobs: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return {
      success: true,
      data: sources
    }
  } catch (error) {
    console.error('Get crawl sources error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch crawl sources'
    })
  }
})
