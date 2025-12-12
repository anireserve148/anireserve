import { getBaseEmailTemplate } from './base'

export interface ReviewEmailData {
    clientName: string
    proName: string
    service: string
    rating: number
    comment?: string
    reservationId: string
}

export function getReviewRequestEmail(data: { clientName: string; proName: string; service: string; reservationId: string }): string {
    const content = `
    <p>Bonjour <strong>${data.clientName}</strong>,</p>
    
    <p>Votre rendez-vous avec <strong>${data.proName}</strong> est terminé. Nous espérons que tout s'est bien passé ! ⭐</p>
    
    <p>Votre avis est précieux pour nous et pour la communauté. Il aide les autres utilisateurs à faire le bon choix et permet aux professionnels de s'améliorer.</p>
    
    <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 24px 0; border-radius: 8px;">
      <p style="margin: 0 0 12px 0; font-weight: 600; color: #166534;">Service reçu :</p>
      <p style="margin: 8px 0;"><strong>Professionnel :</strong> ${data.proName}</p>
      <p style="margin: 8px 0;"><strong>Service :</strong> ${data.service}</p>
    </div>
    
    <p>Prenez quelques secondes pour partager votre expérience !</p>
  `

    return getBaseEmailTemplate({
        title: 'Donnez votre avis',
        preheader: `Comment s'est passé votre rendez-vous avec ${data.proName} ?`,
        content,
        ctaText: '⭐ Laisser un avis',
        ctaLink: `https://anireserve.com/dashboard`,
        footerText: 'Merci de votre confiance !'
    })
}

export function getNewReviewProEmail(data: ReviewEmailData): string {
    const stars = '⭐'.repeat(data.rating)

    const content = `
    <p>Bonjour <strong>${data.proName}</strong>,</p>
    
    <p>🎉 Vous avez reçu un nouvel avis de <strong>${data.clientName}</strong> !</p>
    
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 24px 0; border-radius: 8px;">
      <p style="margin: 0 0 12px 0; font-size: 24px;">${stars}</p>
      <p style="margin: 8px 0;"><strong>Note :</strong> ${data.rating}/5</p>
      ${data.comment ? `
      <p style="margin: 16px 0 8px 0; font-weight: 600; color: #92400e;">Commentaire :</p>
      <p style="margin: 0; font-style: italic; color: #78350f;">"${data.comment}"</p>
      ` : ''}
    </div>
    
    <p>Continuez votre excellent travail ! Les avis positifs renforcent votre visibilité sur la plateforme.</p>
  `

    return getBaseEmailTemplate({
        title: 'Nouvel avis reçu',
        preheader: `${data.clientName} a laissé un avis ${data.rating}/5`,
        content,
        ctaText: 'Voir tous mes avis',
        ctaLink: 'https://anireserve.com/dashboard/pro',
        footerText: 'Merci de votre professionnalisme !'
    })
}
