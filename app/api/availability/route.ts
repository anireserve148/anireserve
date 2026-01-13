import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export interface TimeSlot {
    start: string
    end: string
    available: boolean
}

// Slot granularity options (from old platform)
type SlotGranularity = '15m' | '30m' | '60m'

function getSlotMinutes(granularity: SlotGranularity): number {
    switch (granularity) {
        case '15m': return 15
        case '60m': return 60
        default: return 30
    }
}

// Check if two intervals overlap (from old platform availability.service.ts)
function overlaps(a: { start: Date; end: Date }, b: { start: Date; end: Date }): boolean {
    return a.start < b.end && b.start < a.end
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const professionalId = searchParams.get('professionalId') || searchParams.get('proId')
        const from = searchParams.get('from')
        const to = searchParams.get('to')
        const granularity = (searchParams.get('granularity') as SlotGranularity) || '30m'

        if (!professionalId) {
            return NextResponse.json({ error: 'professionalId is required' }, { status: 400 })
        }

        const slotMinutes = getSlotMinutes(granularity)

        // Get pro profile
        const proProfile = await prisma.proProfile.findUnique({
            where: { id: professionalId },
            include: {
                availability: true,
                blockedPeriods: {
                    where: {
                        ...(from && to ? {
                            startDate: { lte: new Date(to) },
                            endDate: { gte: new Date(from) }
                        } : {})
                    }
                },
                reservations: {
                    where: {
                        status: { in: ['CONFIRMED', 'PENDING'] },
                        ...(from && to ? {
                            startDate: { lte: new Date(to) },
                            endDate: { gte: new Date(from) }
                        } : {})
                    }
                }
            }
        })

        if (!proProfile) {
            return NextResponse.json({ error: 'Professional not found' }, { status: 404 })
        }

        // Generate slots for the next 7 days
        const slots: TimeSlot[] = []
        const startDate = from ? new Date(from) : new Date()
        const endDate = to ? new Date(to) : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)

        // Build busy windows from reservations and blocked periods
        const busyWindows = [
            ...proProfile.reservations.map(res => ({
                start: new Date(res.startDate),
                end: new Date(res.endDate)
            })),
            ...proProfile.blockedPeriods.map(period => ({
                start: new Date(period.startDate),
                end: new Date(period.endDate)
            }))
        ]

        // Loop through each day
        for (let day = new Date(startDate); day <= endDate; day.setDate(day.getDate() + 1)) {
            const dayOfWeek = day.getDay() // 0 = Sunday

            // Find availability for this day
            const dayAvailability = proProfile.availability.find(a => a.dayOfWeek === dayOfWeek)

            if (dayAvailability && dayAvailability.isAvailable) {
                // Parse start and end times
                const [startH, startM] = dayAvailability.startTime.split(':').map(Number)
                const [endH, endM] = dayAvailability.endTime.split(':').map(Number)

                const dayStart = new Date(day)
                dayStart.setHours(startH, startM, 0, 0)

                const dayEnd = new Date(day)
                dayEnd.setHours(endH, endM, 0, 0)

                // Parse breaks from JSON field
                let breakWindows: Array<{ start: Date; end: Date }> = []
                if (dayAvailability.breaks) {
                    try {
                        const breaks = JSON.parse(dayAvailability.breaks as string)
                        breakWindows = breaks.map((b: { start: string; end: string }) => {
                            const [bStartH, bStartM] = b.start.split(':').map(Number)
                            const [bEndH, bEndM] = b.end.split(':').map(Number)
                            const breakStart = new Date(day)
                            breakStart.setHours(bStartH, bStartM, 0, 0)
                            const breakEnd = new Date(day)
                            breakEnd.setHours(bEndH, bEndM, 0, 0)
                            return { start: breakStart, end: breakEnd }
                        })
                    } catch (e) {
                        console.error('Error parsing breaks:', e)
                    }
                }

                // Generate slots based on granularity
                for (let slotStart = new Date(dayStart); slotStart < dayEnd;) {
                    const slotEnd = new Date(slotStart.getTime() + slotMinutes * 60 * 1000)

                    // Don't create slots that go past dayEnd
                    if (slotEnd > dayEnd) break

                    // Check if slot overlaps with any break
                    const isDuringBreak = breakWindows.some(breakWin =>
                        overlaps(breakWin, { start: slotStart, end: slotEnd })
                    )

                    // Check if slot overlaps with any busy window
                    const isBooked = busyWindows.some(window =>
                        overlaps(window, { start: slotStart, end: slotEnd })
                    )

                    slots.push({
                        start: slotStart.toISOString(),
                        end: slotEnd.toISOString(),
                        available: !isBooked && !isDuringBreak  // Exclude breaks
                    })

                    slotStart = slotEnd
                }
            }
        }

        return NextResponse.json({
            slots,
            availability: proProfile.availability,
            granularity,
            professional: {
                id: proProfile.id,
                hourlyRate: proProfile.hourlyRate
            }
        })

    } catch (error) {
        console.error('Availability API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
