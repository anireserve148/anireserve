import LoginForm from '@/components/login-form';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Connexion | AniReserve',
};

export default function LoginPage() {
    return (
        <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
            <div className="relative mx-auto flex w-full max-w-[420px] flex-col space-y-4">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors w-fit"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Retour à l'accueil</span>
                </Link>

                {/* Logo Header */}
                <div className="flex w-full items-center justify-center p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg">
                    <h1 className="text-2xl font-black tracking-wide">AniReserve</h1>
                </div>

                <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100 rounded-xl" />}>
                    <LoginForm />
                </Suspense>
            </div>
        </main>
    );
}
