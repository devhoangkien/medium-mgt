import { H3Event } from 'h3'
import { z } from 'zod'
import prisma from '~/server/utils/prisma'

const createArticleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  markdown: z.string().optional(),
  tags: z.array(z.string()).max(5).optional(),
  canonicalUrl: z.string().url().optional(),
  mediumAccountId: z.string().optional(),
  scheduledAt: z.string().datetime().optional()
})

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
    const validated = createArticleSchema.parse(body)

    const status = validated.scheduledAt ? 'SCHEDULED' : 'DRAFT'

    const article = await prisma.article.create({
      data: {
        userId: user.id,
        title: validated.title,
        subtitle: validated.subtitle,
        content: validated.content,
        markdown: validated.markdown,
        tags: validated.tags,
        canonicalUrl: validated.canonicalUrl,
        mediumAccountId: validated.mediumAccountId,
        scheduledAt: validated.scheduledAt ? new Date(validated.scheduledAt) : null,
        status
      }
    })

    return {
      success: true,
      article
    }
  } catch (error) {
    console.error('Create article error:', error)
    
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: error.errors[0].message
      })
    }

    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to create article'
    })
  }
})
