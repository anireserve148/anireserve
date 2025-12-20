import * as Calendar from 'expo-calendar';
import * as Linking from 'expo-linking';
import { Platform, Alert } from 'react-native';

class CalendarService {
    private async requestPermissions(): Promise<boolean> {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        return status === 'granted';
    }

    private async getDefaultCalendarId(): Promise<string | null> {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

        // Try to find a modifiable calendar
        const defaultCalendar = calendars.find(
            (cal) => cal.allowsModifications && cal.isPrimary
        ) || calendars.find((cal) => cal.allowsModifications);

        return defaultCalendar?.id || null;
    }

    async addToCalendar(reservation: {
        proName: string;
        startDate: string;
        endDate: string;
        location?: string;
        notes?: string;
    }): Promise<boolean> {
        try {
            const hasPermission = await this.requestPermissions();

            if (!hasPermission) {
                Alert.alert(
                    'Permission requise',
                    'Veuillez autoriser l\'accès au calendrier dans les paramètres de l\'application.',
                    [
                        { text: 'Annuler', style: 'cancel' },
                        { text: 'Paramètres', onPress: () => Linking.openSettings() },
                    ]
                );
                return false;
            }

            const calendarId = await this.getDefaultCalendarId();

            if (!calendarId) {
                // If no calendar available, create Google Calendar URL
                this.openGoogleCalendar(reservation);
                return true;
            }

            const eventId = await Calendar.createEventAsync(calendarId, {
                title: `RDV avec ${reservation.proName}`,
                startDate: new Date(reservation.startDate),
                endDate: new Date(reservation.endDate),
                location: reservation.location || 'Lieu à confirmer',
                notes: reservation.notes || 'Réservation via AniReserve',
                timeZone: 'Asia/Jerusalem',
                alarms: [
                    { relativeOffset: -60 }, // 1 hour before
                    { relativeOffset: -1440 }, // 1 day before
                ],
            });

            if (eventId) {
                Alert.alert(
                    'Ajouté au calendrier !',
                    'Votre réservation a été ajoutée à votre calendrier avec des rappels.',
                    [{ text: 'OK' }]
                );
                return true;
            }

            return false;
        } catch (error) {
            console.error('Add to calendar error:', error);
            // Fallback to Google Calendar web
            this.openGoogleCalendar(reservation);
            return true;
        }
    }

    private openGoogleCalendar(reservation: {
        proName: string;
        startDate: string;
        endDate: string;
        location?: string;
    }) {
        const startDate = new Date(reservation.startDate);
        const endDate = new Date(reservation.endDate);

        // Format dates for Google Calendar URL
        const formatDate = (date: Date) => {
            return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
        };

        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: `RDV avec ${reservation.proName}`,
            dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
            details: 'Réservation via AniReserve',
            location: reservation.location || '',
        });

        const url = `https://calendar.google.com/calendar/render?${params.toString()}`;

        Alert.alert(
            'Ajouter au calendrier',
            'Voulez-vous ouvrir Google Calendar ?',
            [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Ouvrir', onPress: () => Linking.openURL(url) },
            ]
        );
    }

    async openInGoogleCalendar(reservation: {
        proName: string;
        startDate: string;
        endDate: string;
        location?: string;
    }) {
        this.openGoogleCalendar(reservation);
    }
}

export const calendarService = new CalendarService();
