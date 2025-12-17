import { CheckCircle, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PendingPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <Card className="max-w-2xl w-full">
                <CardContent className="pt-12 pb-8 text-center">
                    <div className="mb-6">
                        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-navy mb-2">Demande envoyée avec succès !</h1>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                        <div className="flex items-start gap-3">
                            <Clock className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                            <div className="text-left">
                                <h2 className="font-semibold text-navy mb-2">Votre dossier est en cours de vérification</h2>
                                <p className="text-gray-700">
                                    Notre équipe reviendra vers vous dans les <strong>24-48 heures</strong>.
                                </p>
                                <p className="text-gray-700 mt-2">
                                    Vous recevrez un email dès que votre compte sera activé.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-gray-600">
                            En attendant, vous pouvez consulter notre plateforme pour voir comment elle fonctionne.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link href="/">
                                <Button variant="outline">
                                    Retour à l'accueil
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button className="bg-navy hover:bg-navy-light">
                                    Se connecter
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t">
                        <p className="text-sm text-gray-500">
                            Des questions ? Contactez-nous à{" "}
                            <a href="mailto:contact@anireserve.com" className="text-navy hover:underline">
                                contact@anireserve.com
                            </a>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
