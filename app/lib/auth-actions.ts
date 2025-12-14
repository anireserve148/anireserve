'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendWelcomeClient } from '@/lib/mail'
import {
    handleActionError,
    createSuccessResponse,
    type ActionResponse
} from '@/lib/errors'

export async function registerClient(data: {
    name: string
    email: string
    password: string
}): Promise<ActionResponse<void>> {
    try {
        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        })

        if (existingUser) {
            throw new Error("Cet email est déjà utilisé")
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10)

        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                password: hashedPassword,
                role: 'CLIENT'
            }
        })

        // Send welcome email
        try {
            await sendWelcomeClient(data.email, data.name)
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError)
            // Don't fail registration if email fails
        }

        return createSuccessResponse(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}
