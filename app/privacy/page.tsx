import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Politique de Confidentialité - AniReserve',
    description: 'Politique de confidentialité de la plateforme AniReserve',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Politique de Confidentialité
                </h1>

                <div className="bg-white rounded-lg shadow-sm p-8 space-y-6 text-gray-700">
                    <p className="text-sm text-gray-500">Dernière mise à jour : 21 décembre 2024</p>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
                        <p>
                            AniReserve (&quot;nous&quot;, &quot;notre&quot;) s&apos;engage à protéger la vie privée de ses utilisateurs.
                            Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons
                            vos informations personnelles lorsque vous utilisez notre application et notre site web.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Informations collectées</h2>
                        <p className="mb-2">Nous collectons les informations suivantes :</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Nom et prénom</li>
                            <li>Adresse email</li>
                            <li>Numéro de téléphone (optionnel)</li>
                            <li>Historique des réservations</li>
                            <li>Messages échangés avec les professionnels</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Utilisation des données</h2>
                        <p className="mb-2">Vos données sont utilisées pour :</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Gérer votre compte et vos réservations</li>
                            <li>Vous envoyer des confirmations et rappels</li>
                            <li>Permettre la communication avec les professionnels</li>
                            <li>Améliorer nos services</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Partage des données</h2>
                        <p>
                            Nous ne vendons jamais vos données personnelles. Vos informations ne sont partagées
                            qu&apos;avec les professionnels que vous contactez pour effectuer une réservation.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Sécurité</h2>
                        <p>
                            Nous utilisons des mesures de sécurité standard de l&apos;industrie (HTTPS, chiffrement)
                            pour protéger vos données contre tout accès non autorisé.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Vos droits</h2>
                        <p className="mb-2">Vous avez le droit de :</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Accéder à vos données personnelles</li>
                            <li>Corriger vos informations</li>
                            <li>Supprimer votre compte et vos données</li>
                            <li>Exporter vos données</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contact</h2>
                        <p>
                            Pour toute question concernant cette politique de confidentialité, contactez-nous à :
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
