import { getBaseEmailTemplate } from './base'

export interface ApplicationEmailData {
  firstName: string
  lastName: string
  email: string
}

export function getApplicationSubmittedEmail(data: ApplicationEmailData): string {
  const content = `
    <p>Bonjour <strong>${data.firstName} ${data.lastName}</strong>,</p>
    
    <p>Nous avons bien reçu votre demande pour devenir professionnel sur AniReserve ! 🎉</p>
    
    <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 8px;">
      <p style="margin: 0 0 12px 0; font-weight: 600; color: #1e40af;">Prochaines étapes :</p>
      <p style="margin: 8px 0;">✅ Votre dossier est en cours de vérification</p>
      <p style="margin: 8px 0;">⏱️ Délai de traitement : <strong>24-48 heures</strong></p>
      <p style="margin: 8px 0;">📧 Vous recevrez un email dès que votre compte sera activé</p>
    </div>
    
    <p>Notre équipe examine attentivement chaque candidature pour garantir la qualité de notre plateforme.</p>
    
    <p>Merci de votre patience et à très bientôt sur AniReserve !</p>
  `

  return getBaseEmailTemplate({
    title: 'Demande reçue !',
    preheader: 'Votre candidature est en cours de vérification',
    content,
    footerText: 'Des questions ? Contactez-nous à support@anireserve.com'
  })
}

export function getApplicationApprovedEmail(data: ApplicationEmailData): string {
  const content = `
    <p>Bonjour <strong>${data.firstName}</strong>,</p>
    
    <p>🎉 <strong>Félicitations !</strong> Votre demande a été approuvée.</p>
    
    <p>Bienvenue dans la communauté des professionnels AniReserve ! Votre compte est maintenant actif et vous pouvez commencer à recevoir des réservations.</p>
    
    <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 24px 0; border-radius: 8px;">
      <p style="margin: 0 0 12px 0; font-weight: 600; color: #166534;">Pour bien démarrer :</p>
      <p style="margin: 8px 0;">✅ Complétez votre profil professionnel</p>
      <p style="margin: 8px 0;">✅ Ajoutez vos disponibilités</p>
      <p style="margin: 8px 0;">✅ Définissez vos tarifs</p>
      <p style="margin: 8px 0;">✅ Ajoutez des photos de vos réalisations</p>
    </div>
    
    <p>Plus votre profil est complet, plus vous aurez de visibilité auprès des clients !</p>
  `

  return getBaseEmailTemplate({
    title: 'Compte activé ! 🎉',
    preheader: 'Votre compte professionnel est maintenant actif',
    content,
    ctaText: 'Accéder à mon espace pro',
    ctaLink: 'https://anireserve.com/login',
    footerText: 'Besoin d\'aide ? Notre équipe est là pour vous accompagner.'
  })
}

export function getApplicationRejectedEmail(data: ApplicationEmailData & { reason: string }): string {
  const content = `
    <p>Bonjour <strong>${data.firstName}</strong>,</p>
    
    <p>Nous avons examiné votre demande pour rejoindre AniReserve en tant que professionnel.</p>
    
    <p>Malheureusement, nous ne pouvons pas donner suite à votre candidature pour le moment.</p>
    
    <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 24px 0; border-radius: 8px;">
      <p style="margin: 0 0 12px 0; font-weight: 600; color: #991b1b;">Raison :</p>
      <p style="margin: 0; color: #7f1d1d;">${data.reason}</p>
    </div>
    
    <p>Vous pouvez soumettre une nouvelle demande après avoir pris en compte ces remarques.</p>
    
    <p>Merci de votre compréhension.</p>
  `

  return getBaseEmailTemplate({
    title: 'Mise à jour de votre candidature',
    preheader: 'Réponse à votre demande professionnelle',
    content,
    ctaText: 'Soumettre une nouvelle demande',
    ctaLink: 'https://anireserve.com/register/pro',
    footerText: 'Notre équipe reste à votre disposition pour toute question.'
  })
}

export function getApplicationDocumentsRequestedEmail(data: ApplicationEmailData & { message: string }): string {
  const content = `
    <p>Bonjour <strong>${data.firstName}</strong>,</p>
    
    <p>Nous examinons actuellement votre demande pour rejoindre AniReserve.</p>
    
    <p>Pour finaliser votre dossier, nous avons besoin de documents supplémentaires :</p>
    
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 24px 0; border-radius: 8px;">
      <p style="margin: 0 0 12px 0; font-weight: 600; color: #92400e;">Documents requis :</p>
      <p style="margin: 0; color: #78350f;">${data.message}</p>
    </div>
    
    <p>Merci de nous transmettre ces éléments dans les plus brefs délais pour que nous puissions traiter votre candidature.</p>
  `

  return getBaseEmailTemplate({
    title: 'Documents supplémentaires requis',
    preheader: 'Action requise pour votre candidature',
    content,
    ctaText: 'Envoyer les documents',
    ctaLink: 'mailto:support@anireserve.com',
    footerText: 'Répondez directement à cet email avec les documents demandés.'
  })
}

export function getAdminNewProApplicationEmail(data: ApplicationEmailData & { idPhotoUrl: string, phone: string, cities: string, categories: string }): string {
  const content = `
    <p><strong>Nouvelle candidature Pro ! 🚀</strong></p>
    
    <p>Un nouveau professionnel souhaite rejoindre la plateforme :</p>
    
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; margin: 24px 0; border-radius: 8px;">
      <p style="margin: 8px 0;"><strong>Nom :</strong> ${data.firstName} ${data.lastName}</p>
      <p style="margin: 8px 0;"><strong>Email :</strong> ${data.email}</p>
      <p style="margin: 8px 0;"><strong>Téléphone :</strong> ${data.phone}</p>
      <p style="margin: 8px 0;"><strong>Villes :</strong> ${data.cities}</p>
      <p style="margin: 8px 0;"><strong>Services :</strong> ${data.categories}</p>
      <p style="margin: 16px 0 8px 0;"><strong>Document d'identité :</strong></p>
      <a href="${data.idPhotoUrl}" target="_blank" style="display: inline-block; padding: 8px 16px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 4px;">Voir la pièce d'identité</a>
    </div>
    
    <p>Vous pouvez valider ou rejeter cette candidature depuis le Dashboard Admin.</p>
  `

  return getBaseEmailTemplate({
    title: 'Nouvelle candidature Pro',
    preheader: `Candidature de ${data.firstName} ${data.lastName}`,
    content,
    ctaText: 'Gérer les candidatures',
    ctaLink: 'https://anireserve.com/dashboard/admin',
    footerText: 'Email automatique du système AniReserve.'
  })
}
