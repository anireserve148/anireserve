import { Metadata } from 'next';
import { Mail, Phone, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Support - AniReserve',
    description: 'Contactez le support AniReserve pour toute assistance',
};

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Centre d&apos;aide
                </h1>
                <p className="text-gray-600 mb-8">
                    Besoin d&apos;aide ? Nous sommes là pour vous.
                </p>

                {/* Contact Cards */}
                <div className="grid gap-6 md:grid-cols-2 mb-12">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <Mail className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                        <p className="text-gray-600 text-sm mb-3">
                            Envoyez-nous un email, nous répondons sous 24h.
                        </p>
                        <a
                            href="mailto:support@anireserve.com"
                            className="text-green-600 hover:underline font-medium"
                        >
                            support@anireserve.com
                        </a>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <MessageCircle className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Chat</h3>
                        <p className="text-gray-600 text-sm mb-3">
                            Discutez avec notre équipe en temps réel.
                        </p>
                        <span className="text-gray-500 text-sm">
                            Disponible dans l&apos;application
                        </span>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Questions fréquentes
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">
                                Comment créer un compte ?
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Téléchargez l&apos;application AniReserve, cliquez sur &quot;Créer un compte&quot;
                                et suivez les instructions. Vous pouvez aussi vous inscrire avec Google.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">
                                Comment réserver un professionnel ?
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Parcourez les professionnels, sélectionnez celui qui vous convient,
                                choisissez une date et un créneau horaire, puis confirmez votre réservation.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">
                                Comment annuler une réservation ?
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Allez dans &quot;Mes Réservations&quot;, sélectionnez la réservation à annuler,
                                et cliquez sur &quot;Annuler&quot;. Veuillez respecter les conditions d&apos;annulation
                                du professionnel.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">
                                Comment devenir professionnel sur AniReserve ?
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Cliquez sur &quot;Devenir Pro&quot; sur la page d&apos;inscription, remplissez le formulaire
                                avec vos informations et documents, puis attendez la validation de votre profil.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">
                                Comment supprimer mon compte ?
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Contactez-nous à support@anireserve.com avec votre demande de suppression.
                                Votre compte et toutes vos données seront supprimés sous 48h.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
