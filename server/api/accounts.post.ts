import { H3Event } from 'h3'
import prisma from '~/server/utils/prisma'
import { z } from 'zod'

const addAccountSchema = z.object({
  accountName: z.string().min(1, 'Account name is required'),
  cookies: z.string().min(1, 'Cookies are required'),
  mediumUsername: z.string().optional()
})

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody(event)
    const validated = addAccountSchema.parse(body)

    // TODO: Verify cookies with Medium
    // For now, just save them

    const account = await prisma.mediumAccount.create({
      data: {
        accountName: validated.accountName,
        mediumUsername: validated.mediumUsername,
        cookies: validated.cookies,
        status: 'ACTIVE'
      }
    })

    return {
      success: true,
      account
    }
  } catch (error) {
    console.error('Error adding account:', error)
    
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: error.errors[0].message
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to add account'
    })
  }
})
