import { auth, signIn } from '@/auth';
import { redirect } from 'next/navigation';

export default async function SecretAdminLogin({ searchParams }: { searchParams: Promise<{ secret?: string }> }) {
    const session = await auth();
    const params = await searchParams;

    // If already logged in as admin, redirect to admin dashboard
    if (session?.user?.role === 'ADMIN') {
        redirect('/dashboard/admin');
    }

    // If logged in as non-admin, show message
    if (session?.user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/20">
                <div className="max-w-md w-full bg-card p-8 rounded-xl shadow-xl border text-center">
                    <h1 className="text-2xl font-bold text-destructive mb-4">Accès Refusé</h1>
                    <p className="text-muted-foreground mb-6">
                        Vous êtes connecté en tant que {session.user.role}.
                        Seuls les administrateurs peuvent accéder à cette page.
                    </p>
                    <a href="/dashboard" className="text-primary hover:underline">
                        Retour au tableau de bord
                    </a>
                </div>
            </div>
        );
    }

    // Verify secret from URL parameter
    const ADMIN_SECRET = process.env.ADMIN_SECRET;

    if (!ADMIN_SECRET) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/20">
                <div className="max-w-md w-full bg-card p-8 rounded-xl shadow-xl border text-center">
                    <h1 className="text-2xl font-bold text-destructive mb-4">Erreur Configuration</h1>
                    <p className="text-muted-foreground">
                        ADMIN_SECRET non configuré. Contactez l'administrateur système.
                    </p>
                </div>
            </div>
        );
    }

    const isSecretValid = params.secret === ADMIN_SECRET;

    if (!isSecretValid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/20">
                <div className="max-w-md w-full bg-card p-8 rounded-xl shadow-xl border text-center">
                    <h1 className="text-2xl font-bold text-destructive mb-4">Accès Refusé</h1>
                    <p className="text-muted-foreground">
                        Secret invalide ou manquant.
                    </p>
                    <p className="text-xs text-muted-foreground mt-4">
                        URL format: /secret-admin-login?secret=YOUR_SECRET
                    </p>
                </div>
            </div>
        );
    }

    // Auto-login as admin with credentials from env
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@anireserve.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_PASSWORD) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/20">
                <div className="max-w-md w-full bg-card p-8 rounded-xl shadow-xl border text-center">
                    <h1 className="text-2xl font-bold text-destructive mb-4">Erreur Configuration</h1>
                    <p className="text-muted-foreground">
                        ADMIN_PASSWORD non configuré. Contactez l'administrateur système.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20">
            <div className="max-w-md w-full bg-card p-8 rounded-xl shadow-xl border">
                <h1 className="text-2xl font-bold mb-6 text-center">Connexion Admin</h1>
                <form
                    action={async () => {
                        'use server';
                        await signIn('credentials', {
                            email: ADMIN_EMAIL,
                            password: ADMIN_PASSWORD,
                            redirectTo: '/dashboard/admin',
                        });
                    }}
                >
                    <button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Se connecter en tant qu'Admin
                    </button>
                </form>
                <p className="text-xs text-muted-foreground text-center mt-4">
                    🔒 Route secrète protégée
                </p>
            </div>
        </div>
    );
}
