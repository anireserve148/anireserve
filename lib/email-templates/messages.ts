import { getBaseEmailTemplate } from './base'

export interface MessageEmailData {
    recipientName: string
    senderName: string
    messagePreview: string
}

export function getNewMessageEmail(data: MessageEmailData): string {
    const content = `
    <p>Bonjour <strong>${data.recipientName}</strong>,</p>
    
    <p>💬 Vous avez reçu un nouveau message de <strong>${data.senderName}</strong> !</p>
    
    <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 24px 0; border-radius: 8px;">
      <p style="margin: 0 0 12px 0; font-weight: 600; color: #166534;">Aperçu du message :</p>
      <p style="margin: 0; font-style: italic; color: #166534;">"${data.messagePreview}"</p>
    </div>
    
    <p>Connectez-vous pour lire le message complet et y répondre.</p>
  `

    return getBaseEmailTemplate({
        title: 'Nouveau message',
        preheader: `${data.senderName} vous a envoyé un message`,
        content,
        ctaText: 'Lire le message',
        ctaLink: 'https://anireserve.com/dashboard/messages',
        footerText: 'Répondez rapidement pour maintenir une bonne communication avec vos clients/professionnels.'
    })
}
