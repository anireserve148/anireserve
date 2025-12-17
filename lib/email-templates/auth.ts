import { getBaseEmailTemplate } from './base'

export function getWelcomeClientEmail(data: { name: string }): string {
    const content = `
    <p>Bonjour <strong>${data.name}</strong>,</p>
    
    <p>🎉 Bienvenue sur <strong>AniReserve</strong>, la plateforme #1 pour trouver les meilleurs professionnels !</p>
    
    <p>Nous sommes ravis de vous compter parmi nous. Avec AniReserve, vous pouvez :</p>
    
    <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 24px 0; border-radius: 8px;">
      <p style="margin: 8px 0;">✅ Trouver des professionnels qualifiés près de chez vous</p>
      <p style="margin: 8px 0;">✅ Réserver en ligne en quelques clics</p>
      <p style="margin: 8px 0;">✅ Consulter les avis d'autres clients</p>
      <p style="margin: 8px 0;">✅ Gérer toutes vos réservations en un seul endroit</p>
    </div>
    
    <p>Prêt à commencer ? Explorez notre catalogue de professionnels dès maintenant !</p>
  `

    return getBaseEmailTemplate({
        title: 'Bienvenue sur AniReserve ! 🎉',
        preheader: 'Votre compte a été créé avec succès',
        content,
        ctaText: 'Trouver un professionnel',
        ctaLink: 'https://anireserve.com',
        footerText: 'Besoin d\'aide ? Notre équipe est là pour vous : contact@anireserve.com'
    })
}

export function getWelcomeProEmail(data: { name: string }): string {
    const content = `
    <p>Bonjour <strong>${data.name}</strong>,</p>
    
    <p>🎉 Bienvenue dans la communauté des professionnels AniReserve !</p>
    
    <p>Votre compte professionnel est maintenant actif. Vous faites désormais partie d'un réseau de professionnels de confiance.</p>
    
    <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 8px;">
      <p style="margin: 0 0 12px 0; font-weight: 600; color: #1e40af;">Pour maximiser votre visibilité :</p>
      <p style="margin: 8px 0;">📸 Ajoutez des photos professionnelles</p>
      <p style="margin: 8px 0;">📝 Rédigez une bio complète et attractive</p>
      <p style="margin: 8px 0;">📅 Configurez vos disponibilités</p>
      <p style="margin: 8px 0;">💰 Définissez vos tarifs</p>
      <p style="margin: 8px 0;">⭐ Encouragez vos clients à laisser des avis</p>
    </div>
    
    <p>Plus votre profil est complet, plus vous recevrez de réservations !</p>
  `

    return getBaseEmailTemplate({
        title: 'Bienvenue chez AniReserve Pro ! 🚀',
        preheader: 'Votre compte professionnel est actif',
        content,
        ctaText: 'Compléter mon profil',
        ctaLink: 'https://anireserve.com/dashboard/pro',
        footerText: 'Notre équipe vous accompagne dans votre réussite : contact@anireserve.com'
    })
}
