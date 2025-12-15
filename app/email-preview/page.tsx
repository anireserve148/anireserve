import {
    getReservationConfirmationEmail,
    getReservationReminderEmail,
    getNewReservationProEmail,
    type ReservationEmailData
} from '@/lib/email-templates/reservations'
import {
    getApplicationSubmittedEmail,
    getApplicationApprovedEmail,
    getApplicationRejectedEmail,
    type ApplicationEmailData
} from '@/lib/email-templates/applications'
import { getReviewRequestEmail, getNewReviewProEmail } from '@/lib/email-templates/reviews'
import { getNewMessageEmail } from '@/lib/email-templates/messages'
import { getWelcomeClientEmail, getWelcomeProEmail } from '@/lib/email-templates/auth'

const sampleReservationData: ReservationEmailData = {
    clientName: "Sarah Cohen",
    proName: "Dr. David Levy",
    date: "15 décembre 2024",
    time: "14:30",
    service: "Consultation vétérinaire",
    price: "150₪",
    reservationId: "RES-2024-001"
}

const sampleApplicationData: ApplicationEmailData = {
    firstName: "Rachel",
    lastName: "Ben David",
    email: "rachel@example.com"
}

export default async function EmailPreviewPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
    const params = await searchParams
    const type = params.type || 'reservation-confirmation'

    let html = ''
    let title = ''

    switch (type) {
        case 'reservation-confirmation':
            html = getReservationConfirmationEmail(sampleReservationData)
            title = 'Confirmation de réservation (Client)'
            break
        case 'reservation-reminder':
            html = getReservationReminderEmail(sampleReservationData)
            title = 'Rappel de rendez-vous (Client)'
            break
        case 'reservation-pro':
            html = getNewReservationProEmail(sampleReservationData)
            title = 'Nouvelle réservation (Pro)'
            break
        case 'application-submitted':
            html = getApplicationSubmittedEmail(sampleApplicationData)
            title = 'Demande soumise (Pro)'
            break
        case 'application-approved':
            html = getApplicationApprovedEmail(sampleApplicationData)
            title = 'Demande approuvée (Pro)'
            break
        case 'application-rejected':
            html = getApplicationRejectedEmail({ ...sampleApplicationData, reason: "Documents incomplets" })
            title = 'Demande rejetée (Pro)'
            break
        case 'review-request':
            html = getReviewRequestEmail({
                clientName: "Sarah Cohen",
                proName: "Dr. David Levy",
                service: "Consultation vétérinaire",
                reservationId: "RES-001"
            })
            title = 'Demande d\'avis (Client)'
            break
        case 'review-received':
            html = getNewReviewProEmail({
                clientName: "Sarah Cohen",
                proName: "Dr. David Levy",
                service: "Consultation",
                rating: 5,
                comment: "Excellent service, très professionnel !",
                reservationId: "RES-001"
            })
            title = 'Nouvel avis reçu (Pro)'
            break
        case 'message':
            html = getNewMessageEmail({
                recipientName: "Dr. David Levy",
                senderName: "Sarah Cohen",
                messagePreview: "Bonjour, je voudrais savoir si vous êtes disponible demain..."
            })
            title = 'Nouveau message'
            break
        case 'welcome-client':
            html = getWelcomeClientEmail({ name: "Sarah Cohen" })
            title = 'Bienvenue Client'
            break
        case 'welcome-pro':
            html = getWelcomeProEmail({ name: "Dr. David Levy" })
            title = 'Bienvenue Pro'
            break
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-navy mb-4">📧 Preview des Emails</h1>
                    <p className="text-gray-600 mb-6">Sélectionnez un type d'email pour voir le rendu</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <EmailTypeButton type="reservation-confirmation" label="Réservation confirmée" currentType={type} />
                        <EmailTypeButton type="reservation-reminder" label="Rappel 24h" currentType={type} />
                        <EmailTypeButton type="reservation-pro" label="Nouvelle résa (Pro)" currentType={type} />
                        <EmailTypeButton type="application-submitted" label="Demande soumise" currentType={type} />
                        <EmailTypeButton type="application-approved" label="Demande approuvée" currentType={type} />
                        <EmailTypeButton type="application-rejected" label="Demande rejetée" currentType={type} />
                        <EmailTypeButton type="review-request" label="Demande d'avis" currentType={type} />
                        <EmailTypeButton type="review-received" label="Avis reçu" currentType={type} />
                        <EmailTypeButton type="message" label="Nouveau message" currentType={type} />
                        <EmailTypeButton type="welcome-client" label="Bienvenue Client" currentType={type} />
                        <EmailTypeButton type="welcome-pro" label="Bienvenue Pro" currentType={type} />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-navy mb-4">{title}</h2>
                    <div className="border rounded-lg overflow-hidden">
                        <iframe
                            srcDoc={html}
                            className="w-full h-[800px] border-0"
                            title="Email Preview"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

function EmailTypeButton({ type, label, currentType }: { type: string; label: string; currentType: string }) {
    const isActive = type === currentType
    return (
        <a
            href={`/email-preview?type=${type}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors ${isActive
                ? 'bg-turquoise text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
        >
            {label}
        </a>
    )
}
