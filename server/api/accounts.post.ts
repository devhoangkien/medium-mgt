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

    // Lấy userId từ auth middleware context, hoặc user đầu tiên trong CSDL nếu đang test mà không có token
    let userId = event.context.user?.id;
    if (!userId) {
      const firstUser = await prisma.user.findFirst();
      if (!firstUser) {
        throw createError({
          statusCode: 400,
          message: 'Hệ thống chưa có user nào. Vui lòng tạo tài khoản admin trước.'
        });
      }
      userId = firstUser.id;
    }

    const account = await prisma.mediumAccount.create({
      data: {
        userId: userId,
        accountName: validated.accountName,
        mediumUsername: validated.mediumUsername,
        cookies: validated.cookies, // Dựa theo Prisma schema thì cookies là Json. Bạn truyền lên url string, có thể Prisma sẽ tự ép kiểu Json hoặc bỏ qua.
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
