import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, User, Briefcase } from 'lucide-react';
import { ModernNavbar } from '@/components/modern-navbar';
import { ModernFooter } from '@/components/modern-footer';
import { auth } from '@/auth';

export const metadata: Metadata = {
    title: 'Connexion | AniReserve',
};

export default async function LoginPage() {
    const session = await auth();

    return (
        <>
            <ModernNavbar user={session?.user} />
            <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 pt-24">
                <div className="relative mx-auto flex w-full max-w-[500px] flex-col space-y-6">
                    {/* Back Button */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors w-fit"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Retour à l'accueil</span>
                    </Link>

                    {/* Logo Header */}
                    <div className="flex w-full items-center justify-center p-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg">
                        <div className="text-center">
                            <h1 className="text-3xl font-black tracking-wide">AniReserve</h1>
                            <p className="text-white/80 mt-1">Choisissez votre espace</p>
                        </div>
                    </div>

                    {/* Choice Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Client Card */}
                        <Link href="/login/client" className="block group">
                            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-emerald-500 transition-all hover:shadow-xl cursor-pointer">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <User className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Espace Client</h2>
                                <p className="text-gray-500 text-sm mb-4">
                                    Réservez des services et gérez vos rendez-vous
                                </p>
                                <span className="text-emerald-600 font-semibold text-sm group-hover:underline">
                                    Connexion Client →
                                </span>
                            </div>
                        </Link>

                        {/* Pro Card */}
                        <Link href="/login/pro" className="block group">
                            <div className="bg-[#1E3A5F] rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-[#7B68EE] transition-all hover:shadow-xl cursor-pointer">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7B68EE] to-[#1E3A5F] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Briefcase className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">Espace Professionnel</h2>
                                <p className="text-gray-300 text-sm mb-4">
                                    Gérez vos clients, agenda et revenus
                                </p>
                                <span className="text-[#7B68EE] font-semibold text-sm group-hover:underline">
                                    Connexion Pro →
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Register Links */}
                    <div className="text-center space-y-2 pt-4">
                        <p className="text-gray-500 text-sm">
                            Pas encore de compte ?{' '}
                            <Link href="/register" className="text-emerald-600 font-semibold hover:underline">
                                S'inscrire comme client
                            </Link>
                        </p>
                        <p className="text-gray-500 text-sm">
                            Vous êtes un professionnel ?{' '}
                            <Link href="/register/pro" className="text-[#1E3A5F] font-semibold hover:underline">
                                Devenir Pro
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
            <ModernFooter />
        </>
    );
}
