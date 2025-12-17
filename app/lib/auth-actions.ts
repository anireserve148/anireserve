'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendWelcomeClient } from '@/lib/mail'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { headers } from 'next/headers'
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
        // Rate limiting by IP
        const headersList = await headers()
        const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
        const rateLimitResult = rateLimit(`register:${ip}`, RATE_LIMITS.REGISTER)

        if (!rateLimitResult.success) {
            const resetTime = new Date(rateLimitResult.resetTime)
            throw new Error(`Trop de tentatives d'inscription. Réessayez après ${resetTime.toLocaleTimeString('fr-FR')}`)
        }

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
