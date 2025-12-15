import 'dotenv/config'
import { Resend } from 'resend'
import {
    getReservationConfirmationEmail,
    getReservationReminderEmail,
    getReservationCancellationEmail,
    getNewReservationProEmail,
    getReservationAcceptedEmail,
    getReservationRejectedEmail,
} from '../lib/email-templates/reservations'
import {
    getReviewRequestEmail,
    getNewReviewProEmail,
} from '../lib/email-templates/reviews'
import {
    getApplicationSubmittedEmail,
    getApplicationApprovedEmail,
    getApplicationRejectedEmail,
    getApplicationDocumentsRequestedEmail,
    getAdminNewProApplicationEmail,
} from '../lib/email-templates/applications'
import { getNewMessageEmail } from '../lib/email-templates/messages'
import { getWelcomeClientEmail, getWelcomeProEmail } from '../lib/email-templates/auth'
import { getBaseEmailTemplate } from '../lib/email-templates/base'

const resend = new Resend(process.env.RESEND_API_KEY)
const TEST_EMAIL = 'admin@anireserve.com'
const FROM_EMAIL = 'AniReserve <noreply@anireserve.com>'

// Sample data for testing
const sampleReservation = {
    clientName: 'Jean Dupont',
    proName: 'Marie Cohen',
    date: '20 Décembre 2024',
    time: '14:30',
    service: 'Coiffure à domicile',
    price: '150 ₪',
    reservationId: 'test-123'
}

const sampleApplication = {
    firstName: 'David',
    lastName: 'Levy',
    email: 'david@example.com'
}

async function sendTestEmail(subject: string, html: string, index: number) {
    console.log(`📧 [${index}] Envoi: ${subject}`)

    // Delay to avoid rate limiting (max 2/sec on free plan)
    await new Promise(resolve => setTimeout(resolve, 600))

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: TEST_EMAIL,
            subject: `[TEST ${index}] ${subject}`,
            html
        })

        if (error) {
            console.error(`   ❌ Erreur:`, error.message)
            return false
        }

        console.log(`   ✅ Envoyé! ID: ${data?.id}`)
        return true
    } catch (e) {
        console.error(`   ❌ Exception:`, e)
        return false
    }
}

async function main() {
    console.log('🚀 Test de tous les emails AniReserve')
    console.log(`📬 Destination: ${TEST_EMAIL}`)
    console.log('━'.repeat(50))

    let success = 0
    let total = 0

    // 1. Welcome Client
    total++
    if (await sendTestEmail(
        'Bienvenue sur AniReserve ! 🎉',
        getWelcomeClientEmail({ name: 'Jean' }),
        total
    )) success++

    // 2. Welcome Pro
    total++
    if (await sendTestEmail(
        'Bienvenue chez AniReserve Pro ! 🚀',
        getWelcomeProEmail({ name: 'Marie' }),
        total
    )) success++

    // 3. Application Submitted
    total++
    if (await sendTestEmail(
        'Demande reçue - AniReserve Pro',
        getApplicationSubmittedEmail(sampleApplication),
        total
    )) success++

    // 4. Application Approved
    total++
    if (await sendTestEmail(
        '🎉 Votre compte AniReserve Pro est activé !',
        getApplicationApprovedEmail(sampleApplication),
        total
    )) success++

    // 5. Application Rejected
    total++
    if (await sendTestEmail(
        'Mise à jour de votre candidature AniReserve',
        getApplicationRejectedEmail({ ...sampleApplication, reason: 'Documents incomplets' }),
        total
    )) success++

    // 6. Documents Requested
    total++
    if (await sendTestEmail(
        'Documents supplémentaires requis - AniReserve',
        getApplicationDocumentsRequestedEmail({ ...sampleApplication, message: 'Veuillez fournir une photo de votre diplôme.' }),
        total
    )) success++

    // 7. Admin New Application
    total++
    if (await sendTestEmail(
        'Nouvelle candidature Pro 🚀',
        getAdminNewProApplicationEmail({
            ...sampleApplication,
            idPhotoUrl: 'https://example.com/photo.jpg',
            phone: '+972 50 123 4567',
            cities: 'Tel Aviv, Jérusalem',
            categories: 'Coiffure, Maquillage'
        }),
        total
    )) success++

    // 8. New Reservation (to Pro)
    total++
    if (await sendTestEmail(
        '🎉 Nouvelle réservation !',
        getNewReservationProEmail(sampleReservation),
        total
    )) success++

    // 9. Reservation Accepted
    total++
    if (await sendTestEmail(
        '✅ Votre réservation est confirmée !',
        getReservationAcceptedEmail(sampleReservation),
        total
    )) success++

    // 10. Reservation Rejected
    total++
    if (await sendTestEmail(
        'Mise à jour de votre demande de réservation',
        getReservationRejectedEmail({ ...sampleReservation, reason: 'Créneau indisponible' }),
        total
    )) success++

    // 11. Reservation Confirmation
    total++
    if (await sendTestEmail(
        'Réservation confirmée ✅',
        getReservationConfirmationEmail(sampleReservation),
        total
    )) success++

    // 12. Reservation Reminder (24h)
    total++
    if (await sendTestEmail(
        '⏰ Rappel : Rendez-vous demain',
        getReservationReminderEmail(sampleReservation),
        total
    )) success++

    // 13. Reservation Cancellation
    total++
    if (await sendTestEmail(
        'Réservation annulée',
        getReservationCancellationEmail(sampleReservation, 'client'),
        total
    )) success++

    // 14. Review Request
    total++
    if (await sendTestEmail(
        `Comment s'est passé votre rendez-vous avec ${sampleReservation.proName} ?`,
        getReviewRequestEmail({
            clientName: sampleReservation.clientName,
            proName: sampleReservation.proName,
            service: sampleReservation.service,
            reservationId: sampleReservation.reservationId
        }),
        total
    )) success++

    // 15. New Review (to Pro)
    total++
    if (await sendTestEmail(
        '⭐ Nouvel avis 5/5 de Jean Dupont',
        getNewReviewProEmail({
            clientName: 'Jean Dupont',
            proName: 'Marie Cohen',
            rating: 5,
            comment: 'Excellente prestation, très professionnel !',
            service: 'Coiffure à domicile'
        }),
        total
    )) success++

    // 16. New Message
    total++
    if (await sendTestEmail(
        '💬 Nouveau message de Jean Dupont',
        getNewMessageEmail({
            senderName: 'Jean Dupont',
            messagePreview: 'Bonjour, je voulais savoir si vous êtes disponible samedi prochain ?',
            conversationId: 'conv-123'
        }),
        total
    )) success++

    // 17. Password Reset
    total++
    const resetContent = `
        <p>Vous avez demandé une réinitialisation de mot de passe pour votre compte AniReserve.</p>
        <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
        <p style="margin: 24px 0; padding: 16px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; color: #92400e;">
            ⚠️ Ce lien expirera dans <strong>1 heure</strong>.
        </p>
    `
    if (await sendTestEmail(
        'Réinitialisation de votre mot de passe',
        getBaseEmailTemplate({
            title: 'Réinitialisation de mot de passe',
            preheader: 'Créez un nouveau mot de passe pour votre compte',
            content: resetContent,
            ctaText: '🔒 Réinitialiser mon mot de passe',
            ctaLink: 'https://anireserve.com/reset-password?token=test-token',
            footerText: 'Pour votre sécurité, ne partagez jamais ce lien avec personne.'
        }),
        total
    )) success++

    console.log('━'.repeat(50))
    console.log(`📊 Résultat: ${success}/${total} emails envoyés avec succès`)

    if (success === total) {
        console.log('🎉 Tous les emails ont été envoyés !')
    } else {
        console.log(`⚠️ ${total - success} email(s) en échec`)
    }
}

main().catch(console.error)
