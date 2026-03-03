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

    // Get user stats
    const [accountCount, articleCount] = await Promise.all([
      prisma.mediumAccount.count({
        where: { userId: user.id }
      }),
      prisma.article.count({
        where: { userId: user.id }
      })
    ])

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      stats: {
        accountCount,
        articleCount
      }
    }
  } catch (error) {
    console.error('Get user error:', error)
    
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to get user info'
    })
  }
})
