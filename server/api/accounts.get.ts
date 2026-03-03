import { H3Event } from 'h3'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const accounts = await prisma.mediumAccount.findMany({
      include: {
        _count: {
          select: { articles: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform for frontend
    return accounts.map(account => ({
      ...account,
      articleCount: account._count.articles,
      _count: undefined
    }))
  } catch (error) {
    console.error('Error fetching accounts:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch accounts'
    })
  }
})
