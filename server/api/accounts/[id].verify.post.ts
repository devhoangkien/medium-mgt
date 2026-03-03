import { H3Event } from 'h3'
import prisma from '~/server/utils/prisma'
import { getMediumBot } from '~/server/services/medium-bot'

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

    // Get account
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

    if (!account.cookies) {
      throw createError({
        statusCode: 400,
        message: 'No cookies stored for this account'
      })
    }

    // Verify with Medium
    const bot = getMediumBot()
    
    try {
      await bot.createContext(account.cookies as string)
      const isValid = await bot.verifyAccount()
      
      await bot.close()

      // Update account status
      await prisma.mediumAccount.update({
        where: { id },
        data: {
          status: isValid ? 'ACTIVE' : 'EXPIRED',
          lastUsedAt: new Date()
        }
      })

      return {
        success: true,
        valid: isValid,
        status: isValid ? 'ACTIVE' : 'EXPIRED'
      }
    } catch (botError) {
      console.error('Bot verification error:', botError)
      
      // Update account status to expired
      await prisma.mediumAccount.update({
        where: { id },
        data: {
          status: 'EXPIRED'
        }
      })

      return {
        success: true,
        valid: false,
        status: 'EXPIRED',
        error: 'Failed to verify with Medium'
      }
    }
  } catch (error) {
    console.error('Verify account error:', error)
    
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to verify account'
    })
  }
})
