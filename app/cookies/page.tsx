import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Politique de Cookies - AniReserve',
    description: 'Politique de cookies de la plateforme AniReserve',
};

export default function CookiesPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Politique de Cookies
                </h1>

                <div className="bg-white rounded-lg shadow-sm p-8 space-y-6 text-gray-700">
                    <p className="text-sm text-gray-500">Dernière mise à jour : 22 décembre 2024</p>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
                        <p>
                            Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous visitez un site web.
                            Les cookies nous permettent de vous reconnaître et de mémoriser vos préférences.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Cookies que nous utilisons</h2>
                        <p className="mb-2">AniReserve utilise les types de cookies suivants :</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <strong>Cookies essentiels :</strong> Nécessaires au fonctionnement du site
                                (authentification, sécurité, préférences de langue).
                            </li>
                            <li>
                                <strong>Cookies de session :</strong> Permettent de maintenir votre connexion
                                pendant votre visite.
                            </li>
                            <li>
                                <strong>Cookies de préférences :</strong> Mémorisent vos choix
                                (thème sombre/clair, ville préférée).
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Cookies tiers</h2>
                        <p>
                            Nous n&apos;utilisons pas de cookies publicitaires ni de trackers tiers.
                            Votre navigation sur AniReserve n&apos;est pas suivie à des fins marketing.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Gérer vos cookies</h2>
                        <p>
                            Vous pouvez à tout moment modifier les paramètres de votre navigateur pour
                            refuser les cookies. Notez que cela pourrait affecter le fonctionnement du site.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Contact</h2>
                        <p>
                            Pour toute question concernant notre utilisation des cookies :
                            <br />
                            <a href="mailto:contact@anireserve.com" className="text-green-600 hover:underline">
                                contact@anireserve.com
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
