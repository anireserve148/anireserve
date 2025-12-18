import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://anireserve.com';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2eb190',
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "AniReserve - Trouvez les Meilleurs Pros Francophones en Israël",
    template: "%s | AniReserve"
  },
  description: "Plateforme de réservation pour les francophones en Israël. Trouvez des professionnels de confiance : coachs, thérapeutes, consultants et plus. Réservation simple, paiement sécurisé.",
  keywords: [
    "réservation professionnels israël",
    "français israël",
    "francophones israel",
    "coach israël",
    "thérapeute francophone",
    "consultant français israël",
    "plateforme réservation",
    "services professionnels tel aviv",
    "olim hadashim",
    "anireserve"
  ],
  authors: [{ name: "AniReserve Team" }],
  creator: "AniReserve",
  publisher: "AniReserve",

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: BASE_URL,
    siteName: 'AniReserve',
    title: 'AniReserve - Trouvez les Meilleurs Pros Francophones en Israël',
    description: 'Plateforme de réservation pour les francophones en Israël. Trouvez des professionnels de confiance.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AniReserve - Plateforme de réservation',
      },
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'AniReserve - Professionnels Francophones en Israël',
    description: 'Trouvez et réservez les meilleurs professionnels francophones en Israël.',
    images: ['/og-image.png'],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Icons
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },

  // Manifest
  manifest: '/manifest.json',

  // Verification (à remplir avec vos codes)
  // verification: {
  //   google: 'votre-code-google',
  //   yandex: 'votre-code-yandex',
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "AniReserve",
              "url": BASE_URL,
              "logo": `${BASE_URL}/logo.png`,
              "description": "Plateforme de réservation pour les francophones en Israël",
              "sameAs": [
                "https://facebook.com/anireserve",
                "https://instagram.com/anireserve"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "contact@anireserve.com",
                "contactType": "customer service"
              }
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ServiceWorkerRegistration />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
