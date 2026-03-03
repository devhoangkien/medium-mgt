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
        message: 'Account ID is required'
      })
    }

    // Verify account belongs to user
    const account = await prisma.mediumAccount.findFirst({
      where: {
        id,
        userId: user.id
      }
    })

    if (!account) {
      throw createError({
        statusCode: 404,
        message: 'Account not found'
      })
    }

    // Delete account
    await prisma.mediumAccount.delete({
      where: { id }
    })

    return {
      success: true,
      message: 'Account deleted successfully'
    }
  } catch (error) {
    console.error('Delete account error:', error)
    
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to delete account'
    })
  }
})
