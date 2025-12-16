import { NextResponse } from 'next/server'

// Health check endpoint - called by external cron/uptime monitor
// This keeps the server active and can be pinged by services like UptimeRobot

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: 'AniReserve',
        version: '0.39.7'
    })
}
