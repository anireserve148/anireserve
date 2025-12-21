import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Conditions d'utilisation - AniReserve",
    description: "Conditions générales d'utilisation de la plateforme AniReserve",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Conditions d&apos;utilisation
                </h1>

                <div className="bg-white rounded-lg shadow-sm p-8 space-y-6 text-gray-700">
                    <p className="text-sm text-gray-500">Dernière mise à jour : 21 décembre 2024</p>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptation des conditions</h2>
                        <p>
                            En utilisant AniReserve, vous acceptez les présentes conditions d&apos;utilisation.
                            Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser notre service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description du service</h2>
                        <p>
                            AniReserve est une plateforme de mise en relation entre des clients et des
                            prestataires de services professionnels. Nous facilitons la prise de rendez-vous
                            mais ne sommes pas partie aux contrats entre clients et professionnels.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Inscription</h2>
                        <p>
                            Pour utiliser certaines fonctionnalités, vous devez créer un compte avec des
                            informations exactes et à jour. Vous êtes responsable de la confidentialité
                            de vos identifiants de connexion.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Utilisation acceptable</h2>
                        <p className="mb-2">Vous vous engagez à ne pas :</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Utiliser le service à des fins illégales</li>
                            <li>Harceler d&apos;autres utilisateurs</li>
                            <li>Publier du contenu offensant ou frauduleux</li>
                            <li>Tenter de compromettre la sécurité du service</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Réservations et annulations</h2>
                        <p>
                            Les conditions de réservation et d&apos;annulation sont définies par chaque
                            professionnel. Veuillez les consulter avant de confirmer une réservation.
                            AniReserve n&apos;est pas responsable des annulations ou modifications.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Responsabilité</h2>
                        <p>
                            AniReserve agit en tant qu&apos;intermédiaire et ne garantit pas la qualité des
                            services fournis par les professionnels. Nous ne sommes pas responsables des
                            litiges entre clients et professionnels.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Propriété intellectuelle</h2>
                        <p>
                            Le contenu de l&apos;application (logo, design, textes) est la propriété d&apos;AniReserve.
                            Toute reproduction sans autorisation est interdite.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Modifications</h2>
                        <p>
                            Nous nous réservons le droit de modifier ces conditions à tout moment.
                            Les utilisateurs seront informés des changements importants.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact</h2>
                        <p>
                            Pour toute question, contactez-nous à :
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
