import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail } from "lucide-react"

export function ModernFooter() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-navy text-white mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold gradient-text">AniReserve</h3>
                        <p className="text-sm text-gray-300">
                            La plateforme qui connecte les francophones avec les meilleurs professionnels en Israël.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="hover:text-primary transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="hover:text-primary transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="hover:text-primary transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="font-semibold mb-4">Services</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><Link href="/search" className="hover:text-primary transition-colors">Santé</Link></li>
                            <li><Link href="/search" className="hover:text-primary transition-colors">Beauté & Bien-être</Link></li>
                            <li><Link href="/search" className="hover:text-primary transition-colors">Business</Link></li>
                            <li><Link href="/search" className="hover:text-primary transition-colors">Services à domicile</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold mb-4">Entreprise</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><Link href="/register/pro" className="hover:text-primary transition-colors">Devenir Pro</Link></li>
                            <li><Link href="/login" className="hover:text-primary transition-colors">Connexion</Link></li>
                            <li><Link href="/register" className="hover:text-primary transition-colors">Inscription</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-4">Contact</h4>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li className="flex items-center space-x-2">
                                <Mail className="h-4 w-4" />
                                <a href="mailto:contact@anireserve.com" className="hover:text-primary transition-colors">
                                    contact@anireserve.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                    <p>&copy; {currentYear} AniReserve. Tous droits réservés.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link href="/privacy" className="hover:text-primary transition-colors">
                            Confidentialité
                        </Link>
                        <Link href="/terms" className="hover:text-primary transition-colors">
                            Conditions d'utilisation
                        </Link>
                        <Link href="/cookies" className="hover:text-primary transition-colors">
                            Cookies
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
