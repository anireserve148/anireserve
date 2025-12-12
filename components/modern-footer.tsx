import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"

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
                            La plateforme de référence pour réserver des services professionnels pour vos animaux.
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
                            <li><Link href="/search?category=veterinaire" className="hover:text-primary transition-colors">Vétérinaire</Link></li>
                            <li><Link href="/search?category=toilettage" className="hover:text-primary transition-colors">Toilettage</Link></li>
                            <li><Link href="/search?category=education" className="hover:text-primary transition-colors">Éducation</Link></li>
                            <li><Link href="/search?category=garde" className="hover:text-primary transition-colors">Garde d'animaux</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold mb-4">Entreprise</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><Link href="/about" className="hover:text-primary transition-colors">À propos</Link></li>
                            <li><Link href="/register/pro" className="hover:text-primary transition-colors">Devenir Pro</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                            <li><Link href="/careers" className="hover:text-primary transition-colors">Carrières</Link></li>
                            <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-4">Contact</h4>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li className="flex items-center space-x-2">
                                <Mail className="h-4 w-4" />
                                <span>contact@anireserve.com</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Phone className="h-4 w-4" />
                                <span>+972 3 123 4567</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4" />
                                <span>Tel Aviv, Israël</span>
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
