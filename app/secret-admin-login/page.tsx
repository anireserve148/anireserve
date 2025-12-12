import { auth, signIn } from '@/auth';
import { redirect } from 'next/navigation';

export default async function SecretAdminLogin() {
    const session = await auth();

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

    // Auto-login as admin
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20">
            <div className="max-w-md w-full bg-card p-8 rounded-xl shadow-xl border">
                <h1 className="text-2xl font-bold mb-6 text-center">Connexion Admin</h1>
                <form
                    action={async () => {
                        'use server';
                        await signIn('credentials', {
                            email: 'admin@anireserve.com',
                            password: 'password123',
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
                    🔒 Route secrète - Ne pas partager
                </p>
            </div>
        </div>
    );
}
