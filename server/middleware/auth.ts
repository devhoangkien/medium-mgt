import { H3Event } from 'h3'
import jwt from 'jsonwebtoken'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event: H3Event) => {
  // Skip auth for public routes
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/health'
  ]

  const url = event.path
  if (publicRoutes.some(route => url.startsWith(route))) {
    return
  }

  // Get token from header
  const authHeader = getHeader(event, 'authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized: No token provided'
    })
  }

  const token = authHeader.substring(7) // Remove 'Bearer ' prefix

  try {
    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'fallback-secret'
    ) as { userId: string; email: string }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized: User not found'
      })
    }

    // Attach user to event context
    event.context.user = user
  } catch (error) {
    console.error('Auth middleware error:', error)
    
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized: Invalid or expired token'
      })
    }

    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }
})

// Extend H3Event context
declare module 'h3' {
  interface H3EventContext {
    user?: {
      id: string
      email: string
      name: string | null
      role: string
    }
  }
}
