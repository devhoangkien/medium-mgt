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

    const body = await readBody(event)
    const { name, url, selector, config } = body

    if (!name || !url) {
      throw createError({
        statusCode: 400,
        message: 'Name and URL are required'
      })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      throw createError({
        statusCode: 400,
        message: 'Invalid URL format'
      })
    }

    const source = await prisma.crawlSource.create({
      data: {
        userId: user.id,
        name,
        url,
        selector: selector || null,
        config: config || null,
        status: 'ACTIVE'
      }
    })

    return {
      success: true,
      data: source
    }
  } catch (error) {
    console.error('Create crawl source error:', error)
    
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to create crawl source'
    })
  }
})
