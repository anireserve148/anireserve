/**
 * Simple in-memory rate limiter
 * For production, use Redis or a dedicated service
 */

interface RateLimitEntry {
    count: number
    resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now()
    for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetTime) {
            rateLimitStore.delete(key)
        }
    }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
    maxRequests: number  // Max requests per window
    windowMs: number     // Time window in milliseconds
}

export function rateLimit(identifier: string, config: RateLimitConfig): {
    success: boolean
    remaining: number
    resetTime: number
} {
    const now = Date.now()
    const entry = rateLimitStore.get(identifier)

    if (!entry || now > entry.resetTime) {
        // First request or window expired
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime: now + config.windowMs
        })
        return {
            success: true,
            remaining: config.maxRequests - 1,
            resetTime: now + config.windowMs
        }
    }

    if (entry.count >= config.maxRequests) {
        // Limit exceeded
        return {
            success: false,
            remaining: 0,
            resetTime: entry.resetTime
        }
    }

    // Increment count
    entry.count++
    return {
        success: true,
        remaining: config.maxRequests - entry.count,
        resetTime: entry.resetTime
    }
}

// Predefined limits
export const RATE_LIMITS = {
    LOGIN: { maxRequests: 5, windowMs: 15 * 60 * 1000 },      // 5 attempts per 15 minutes
    REGISTER: { maxRequests: 3, windowMs: 60 * 60 * 1000 },   // 3 attempts per hour
    MESSAGE: { maxRequests: 30, windowMs: 60 * 1000 },        // 30 messages per minute
    BOOKING: { maxRequests: 10, windowMs: 60 * 60 * 1000 },   // 10 bookings per hour
} as const
