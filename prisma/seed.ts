import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const adminEmail = 'austinhoang8386@gmail.com'
    const adminPassword = 'admin123' // User can change this later

    console.log('Seeding default admin account...')

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
    })

    if (!existingAdmin) {
        const salt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(adminPassword, salt)

        const user = await prisma.user.create({
            data: {
                email: adminEmail,
                passwordHash,
                name: 'Super Admin',
                role: 'ADMIN'
            }
        })

        console.log(`✅ Admin account successfully created!`)
        console.log(`✉️  Email: ${adminEmail}`)
        console.log(`🔑 Password: ${adminPassword}`)
    } else {
        console.log('ℹ️ Default admin account already exists. Skipping...')
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
