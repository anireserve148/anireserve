// Base email template with AniReserve branding

export interface EmailTemplateProps {
  title: string
  preheader?: string
  content: string
  ctaText?: string
  ctaLink?: string
  footerText?: string
}

// Logo URL - hosted on the site
const LOGO_URL = 'https://anireserve.com/logo.png'

export function getBaseEmailTemplate({
  title,
  preheader,
  content,
  ctaText,
  ctaLink,
  footerText
}: EmailTemplateProps): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${preheader ? `<meta name="description" content="${preheader}">` : ''}
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f8f9fa;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1f36 0%, #2d3748 100%); padding: 32px; text-align: center;">
              <img src="${LOGO_URL}" alt="AniReserve" width="180" style="display: block; margin: 0 auto;" />
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 48px 40px;">
              <h2 style="margin: 0 0 24px 0; color: #1a1f36; font-size: 24px; font-weight: 600;">
                ${title}
              </h2>
              
              <div style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                ${content}
              </div>

              ${ctaText && ctaLink ? `
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td style="border-radius: 8px; background: #3DBAA2;">
                    <a href="${ctaLink}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}

              ${footerText ? `
              <p style="margin: 24px 0 0 0; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                ${footerText}
              </p>
              ` : ''}
            </td>
          </tr>

          <!-- Footer - Simplified -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #1a1f36; font-size: 16px; font-weight: 600;">
                AniReserve
              </p>
              <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 13px;">
                📧 contact@anireserve.com
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                © ${new Date().getFullYear()} AniReserve. Tous droits réservés.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
