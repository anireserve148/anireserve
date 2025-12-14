import { getBaseEmailTemplate } from './base'

export interface ReservationEmailData {
  clientName: string
  proName: string
  date: string
  time: string
  service: string
  price: string
  reservationId: string
}

export function getReservationConfirmationEmail(data: ReservationEmailData): string {
  const content = `
    <p>Bonjour <strong>${data.clientName}</strong>,</p>
    
    <p>Votre réservation a été confirmée avec succès ! 🎉</p>
    
    <div style="background: #f8f9fa; border-left: 4px solid #3DBAA2; padding: 20px; margin: 24px 0; border-radius: 8px;">
      <p style="margin: 0 0 12px 0; font-weight: 600; color: #1a1f36;">Détails de la réservation :</p>
      <p style="margin: 8px 0;"><strong>Professionnel :</strong> ${data.proName}</p>
      <p style="margin: 8px 0;"><strong>Service :</strong> ${data.service}</p>
      <p style="margin: 8px 0;"><strong>Date :</strong> ${data.date}</p>
      <p style="margin: 8px 0;"><strong>Heure :</strong> ${data.time}</p>
      <p style="margin: 8px 0;"><strong>Prix :</strong> ${data.price}</p>
      <p style="margin: 8px 0; color: #6b7280; font-size: 14px;"><strong>N° de réservation :</strong> ${data.reservationId}</p>
    </div>
    
    <p>Vous recevrez un rappel 24h avant votre rendez-vous.</p>
  `

  return getBaseEmailTemplate({
    title: 'Réservation confirmée',
    preheader: `Votre rendez-vous avec ${data.proName} est confirmé`,
    content,
    ctaText: 'Voir ma réservation',
    ctaLink: `https://anireserve.com/dashboard`,
    footerText: 'Besoin de modifier ou annuler ? Rendez-vous dans votre espace client.'
  })
}

export function getReservationReminderEmail(data: ReservationEmailData): string {
  const content = `
    <p>Bonjour <strong>${data.clientName}</strong>,</p>
    
    <p>⏰ Rappel : Votre rendez-vous est prévu <strong>demain</strong> !</p>
    
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 24px 0; border-radius: 8px;">
      <p style="margin: 0 0 12px 0; font-weight: 600; color: #92400e;">Rendez-vous demain :</p>
      <p style="margin: 8px 0;"><strong>Avec :</strong> ${data.proName}</p>
      <p style="margin: 8px 0;"><strong>Service :</strong> ${data.service}</p>
      <p style="margin: 8px 0;"><strong>Heure :</strong> ${data.time}</p>
    </div>
    
    <p>N'oubliez pas de vous présenter à l'heure. En cas d'empêchement, merci de prévenir au plus tôt.</p>
  `

  return getBaseEmailTemplate({
    title: 'Rappel de rendez-vous',
    preheader: `Votre rendez-vous avec ${data.proName} est demain`,
    content,
    ctaText: 'Voir les détails',
    ctaLink: `https://anireserve.com/dashboard`,
    footerText: 'Vous pouvez annuler jusqu\'à 24h avant le rendez-vous.'
  })
}

export function getReservationCancellationEmail(data: ReservationEmailData, cancelledBy: 'client' | 'pro'): string {
  const content = cancelledBy === 'client' ? `
    <p>Bonjour <strong>${data.clientName}</strong>,</p>
    
    <p>Votre réservation a été annulée avec succès.</p>
    
    <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 24px 0; border-radius: 8px;">
      <p style="margin: 0 0 12px 0; font-weight: 600; color: #991b1b;">Réservation annulée :</p>
      <p style="margin: 8px 0;"><strong>Professionnel :</strong> ${data.proName}</p>
      <p style="margin: 8px 0;"><strong>Date :</strong> ${data.date} à ${data.time}</p>
    </div>
    
    <p>Vous pouvez effectuer une nouvelle réservation à tout moment.</p>
  ` : `
    <p>Bonjour <strong>${data.clientName}</strong>,</p>
    
    <p>Nous sommes désolés de vous informer que <strong>${data.proName}</strong> a dû annuler votre rendez-vous.</p>
    
    <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 24px 0; border-radius: 8px;">
      <p style="margin: 0 0 12px 0; font-weight: 600; color: #991b1b;">Réservation annulée :</p>
      <p style="margin: 8px 0;"><strong>Date :</strong> ${data.date} à ${data.time}</p>
      <p style="margin: 8px 0;"><strong>Service :</strong> ${data.service}</p>
    </div>
    
    <p>Nous vous invitons à effectuer une nouvelle réservation. Toutes nos excuses pour ce désagrément.</p>
  `

  return getBaseEmailTemplate({
    title: 'Réservation annulée',
    preheader: 'Votre réservation a été annulée',
    content,
    ctaText: 'Trouver un professionnel',
    ctaLink: 'https://anireserve.com',
    footerText: cancelledBy === 'pro' ? 'Notre équipe reste à votre disposition pour toute question.' : undefined
  })
}

export function getNewReservationProEmail(data: ReservationEmailData): string {
  const content = `
    <p>Bonjour <strong>${data.proName}</strong>,</p>
    
    <p>🎉 Vous avez reçu une nouvelle réservation !</p>
    
    <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 8px;">
      <p style="margin: 0 0 12px 0; font-weight: 600; color: #1e40af;">Nouvelle réservation :</p>
      <p style="margin: 8px 0;"><strong>Client :</strong> ${data.clientName}</p>
      <p style="margin: 8px 0;"><strong>Service :</strong> ${data.service}</p>
      <p style="margin: 8px 0;"><strong>Date :</strong> ${data.date}</p>
      <p style="margin: 8px 0;"><strong>Heure :</strong> ${data.time}</p>
      <p style="margin: 8px 0;"><strong>Montant :</strong> ${data.price}</p>
    </div>
    
    <p>Préparez-vous pour ce rendez-vous et assurez-vous d'être disponible à l'heure prévue.</p>
  `

  return getBaseEmailTemplate({
    title: 'Nouvelle réservation',
    preheader: `${data.clientName} a réservé vos services`,
    content,
    ctaText: 'Voir dans mon agenda',
    ctaLink: 'https://anireserve.com/dashboard/pro',
    footerText: 'Vous pouvez contacter le client via la messagerie.'
  })
}

export function getReservationAcceptedEmail(data: ReservationEmailData): string {
  const content = `
    <p>Bonjour <strong>${data.clientName}</strong>,</p>
    
    <p>🎉 Bonne nouvelle ! Votre demande de réservation a été <strong style="color: #16a34a;">acceptée</strong> par ${data.proName}.</p>
    
    <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 20px; margin: 24px 0; border-radius: 8px;">
      <p style="margin: 0 0 12px 0; font-weight: 600; color: #166534;">✅ Réservation confirmée :</p>
      <p style="margin: 8px 0;"><strong>Professionnel :</strong> ${data.proName}</p>
      <p style="margin: 8px 0;"><strong>Service :</strong> ${data.service}</p>
      <p style="margin: 8px 0;"><strong>Date :</strong> ${data.date}</p>
      <p style="margin: 8px 0;"><strong>Heure :</strong> ${data.time}</p>
      <p style="margin: 8px 0;"><strong>Prix :</strong> ${data.price}</p>
      <p style="margin: 8px 0; color: #6b7280; font-size: 14px;"><strong>N° de réservation :</strong> ${data.reservationId}</p>
    </div>
    
    <p>Vous recevrez un rappel 24h avant votre rendez-vous. Merci de votre confiance !</p>
  `

  return getBaseEmailTemplate({
    title: 'Réservation acceptée ! ✅',
    preheader: `${data.proName} a accepté votre réservation`,
    content,
    ctaText: 'Voir ma réservation',
    ctaLink: `https://anireserve.com/dashboard`,
    footerText: 'Besoin de modifier ou annuler ? Rendez-vous dans votre espace client.'
  })
}

export function getReservationRejectedEmail(data: ReservationEmailData & { reason?: string }): string {
  const content = `
    <p>Bonjour <strong>${data.clientName}</strong>,</p>
    
    <p>Nous sommes désolés de vous informer que votre demande de réservation n'a pas pu être acceptée par ${data.proName}.</p>
    
    <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 24px 0; border-radius: 8px;">
      <p style="margin: 0 0 12px 0; font-weight: 600; color: #991b1b;">❌ Réservation refusée :</p>
      <p style="margin: 8px 0;"><strong>Professionnel :</strong> ${data.proName}</p>
      <p style="margin: 8px 0;"><strong>Date demandée :</strong> ${data.date} à ${data.time}</p>
      ${data.reason ? `<p style="margin: 8px 0;"><strong>Raison :</strong> ${data.reason}</p>` : ''}
    </div>
    
    <p>Ne vous découragez pas ! De nombreux autres professionnels sont disponibles sur AniReserve.</p>
  `

  return getBaseEmailTemplate({
    title: 'Réservation non disponible',
    preheader: 'Votre demande de réservation n\'a pas pu être acceptée',
    content,
    ctaText: 'Trouver un autre professionnel',
    ctaLink: 'https://anireserve.com',
    footerText: 'Notre équipe reste à votre disposition pour toute question.'
  })
}
