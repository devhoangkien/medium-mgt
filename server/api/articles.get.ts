import { H3Event } from 'h3'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const query = getQuery(event)
    const status = query.status as string | undefined

    const articles = await prisma.article.findMany({
      where: status ? { status } : {},
      include: {
        mediumAccount: {
          select: {
            accountName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform for frontend
    return articles.map(article => ({
      ...article,
      accountName: article.mediumAccount?.accountName,
      mediumAccount: undefined
    }))
  } catch (error) {
    console.error('Error fetching articles:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch articles'
    })
  }
})
