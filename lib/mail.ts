
import { Resend } from 'resend'
import {
    getReservationConfirmationEmail,
    getReservationReminderEmail,
    getReservationCancellationEmail,
    getNewReservationProEmail,
    type ReservationEmailData
} from './email-templates/reservations'
import {
    getReviewRequestEmail,
    getNewReviewProEmail,
    type ReviewEmailData
} from './email-templates/reviews'
import {
    getApplicationSubmittedEmail,
    getApplicationApprovedEmail,
    getApplicationRejectedEmail,
    getApplicationDocumentsRequestedEmail,
    getAdminNewProApplicationEmail,
    type ApplicationEmailData
} from './email-templates/applications'
import { getNewMessageEmail, type MessageEmailData } from './email-templates/messages'
import { getWelcomeClientEmail, getWelcomeProEmail } from './email-templates/auth'
import { getBaseEmailTemplate } from './email-templates/base'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = 'AniReserve <noreply@anireserve.com>'

async function sendEmail(to: string, subject: string, html: string) {
    console.log(`[Email Debug] Attempting to send email to ${to} with subject "${subject}"`)

    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is missing. Email not sent:', { to, subject })
        return { success: false, error: "Clé API Resend manquante" }
    }

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject,
            html
        })

        if (error) {
            console.error('[Email Debug] Resend API error:', error)
            return { success: false, error: error.message }
        }

        console.log(`[Email Debug] Email sent successfully to ${to}. ID:`, data?.id)
        return { success: true, data }
    } catch (error) {
        console.error('[Email Debug] Email sending unexpected fail:', error)
        return { success: false, error: 'Failed to send email' }
    }
}

// ===== RESERVATION EMAILS =====

export async function sendReservationConfirmation(to: string, data: ReservationEmailData) {
    const html = getReservationConfirmationEmail(data)
    return sendEmail(to, 'Réservation confirmée ✅', html)
}

export async function sendReservationReminder(to: string, data: ReservationEmailData) {
    const html = getReservationReminderEmail(data)
    return sendEmail(to, '⏰ Rappel : Rendez-vous demain', html)
}

export async function sendReservationCancellation(to: string, data: ReservationEmailData, cancelledBy: 'client' | 'pro') {
    const html = getReservationCancellationEmail(data, cancelledBy)
    return sendEmail(to, 'Réservation annulée', html)
}

export async function sendNewReservationToPro(to: string, data: ReservationEmailData) {
    const html = getNewReservationProEmail(data)
    return sendEmail(to, '🎉 Nouvelle réservation !', html)
}

// ===== REVIEW EMAILS =====

export async function sendReviewRequest(to: string, data: { clientName: string; proName: string; service: string; reservationId: string }) {
    const html = getReviewRequestEmail(data)
    return sendEmail(to, `Comment s'est passé votre rendez-vous avec ${data.proName} ?`, html)
}

export async function sendNewReviewToPro(to: string, data: ReviewEmailData) {
    const html = getNewReviewProEmail(data)
    return sendEmail(to, `⭐ Nouvel avis ${data.rating}/5 de ${data.clientName}`, html)
}

// ===== APPLICATION EMAILS =====

export async function sendApplicationSubmitted(to: string, data: ApplicationEmailData) {
    const html = getApplicationSubmittedEmail(data)
    return sendEmail(to, 'Demande reçue - AniReserve Pro', html)
}

export async function sendApplicationApproved(to: string, data: ApplicationEmailData) {
    const html = getApplicationApprovedEmail(data)
    return sendEmail(to, '🎉 Votre compte AniReserve Pro est activé !', html)
}

export async function sendApplicationRejected(to: string, data: ApplicationEmailData & { reason: string }) {
    const html = getApplicationRejectedEmail(data)
    return sendEmail(to, 'Mise à jour de votre candidature AniReserve', html)
}

export async function sendApplicationDocumentsRequested(to: string, data: ApplicationEmailData & { message: string }) {
    const html = getApplicationDocumentsRequestedEmail(data)
    return sendEmail(to, 'Documents supplémentaires requis - AniReserve', html)
}

export async function sendAdminNewApplication(data: ApplicationEmailData & { idPhotoUrl: string, phone: string, cities: string, categories: string }) {
    const html = getAdminNewProApplicationEmail(data)
    return sendEmail('admin@anireserve.com', 'Nouvelle candidature Pro 🚀', html)
}

// ===== MESSAGE EMAILS =====

export async function sendNewMessageNotification(to: string, data: MessageEmailData) {
    const html = getNewMessageEmail(data)
    return sendEmail(to, `💬 Nouveau message de ${data.senderName}`, html)
}

// ===== AUTH EMAILS =====

export async function sendWelcomeClient(to: string, name: string) {
    const html = getWelcomeClientEmail({ name })
    return sendEmail(to, 'Bienvenue sur AniReserve ! 🎉', html)
}

export async function sendWelcomePro(to: string, name: string) {
    const html = getWelcomeProEmail({ name })
    return sendEmail(to, 'Bienvenue chez AniReserve Pro ! 🚀', html)
}

export async function sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `https://anireserve.com/reset-password?token=${token}`

    const content = `
        <p>Vous avez demandé une réinitialisation de mot de passe pour votre compte AniReserve.</p>
        
        <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
        
        <p style="margin: 24px 0; padding: 16px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; color: #92400e;">
            ⚠️ Ce lien expirera dans <strong>1 heure</strong>.
        </p>
        
        <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
    `

    const html = getBaseEmailTemplate({
        title: 'Réinitialisation de mot de passe',
        preheader: 'Créez un nouveau mot de passe pour votre compte',
        content,
        ctaText: '🔒 Réinitialiser mon mot de passe',
        ctaLink: resetLink,
        footerText: 'Pour votre sécurité, ne partagez jamais ce lien avec personne.'
    })

    return sendEmail(email, 'Réinitialisation de votre mot de passe', html)
}
