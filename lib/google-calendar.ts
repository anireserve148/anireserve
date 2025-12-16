'use server'

import { auth } from '@/auth'
import { google } from 'googleapis'

// Google Calendar sync utilities
// Requires: npm install googleapis
// Requires: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET in .env

interface CalendarEvent {
    summary: string
    description: string
    startTime: Date
    endTime: Date
    attendeeEmail?: string
}

/**
 * Create OAuth2 client for Google Calendar
 */
function getOAuth2Client(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    )
    oauth2Client.setCredentials({ access_token: accessToken })
    return oauth2Client
}

/**
 * Add a reservation to Google Calendar
 */
export async function addToGoogleCalendar(
    accessToken: string,
    event: CalendarEvent
) {
    try {
        const oauth2Client = getOAuth2Client(accessToken)
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

        const calendarEvent = {
            summary: event.summary,
            description: event.description,
            start: {
                dateTime: event.startTime.toISOString(),
                timeZone: 'Asia/Jerusalem',
            },
            end: {
                dateTime: event.endTime.toISOString(),
                timeZone: 'Asia/Jerusalem',
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 }, // 24h before
                    { method: 'popup', minutes: 60 }, // 1h before
                ],
            },
            attendees: event.attendeeEmail ? [{ email: event.attendeeEmail }] : undefined,
        }

        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: calendarEvent,
            sendUpdates: 'all',
        })

        return { success: true, eventId: response.data.id }
    } catch (error) {
        console.error('Google Calendar error:', error)
        return { success: false, error: 'Erreur lors de l\'ajout au calendrier' }
    }
}

/**
 * Delete a reservation from Google Calendar
 */
export async function removeFromGoogleCalendar(
    accessToken: string,
    eventId: string
) {
    try {
        const oauth2Client = getOAuth2Client(accessToken)
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

        await calendar.events.delete({
            calendarId: 'primary',
            eventId: eventId,
        })

        return { success: true }
    } catch (error) {
        console.error('Google Calendar delete error:', error)
        return { success: false, error: 'Erreur lors de la suppression' }
    }
}
