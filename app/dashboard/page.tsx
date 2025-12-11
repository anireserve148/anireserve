import { auth, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p>Votre session a expiré. Veuillez vous reconnecter.</p>
                <a href="/login" className="text-primary hover:underline mt-2">Aller à la page de connexion</a>
            </div>
        );
    }

    /* Fetch user with reservations */
    const user = await prisma.user.findUnique({
        where: { id: session?.user?.id },
        include: {
            clientReservations: {
                include: { pro: { include: { user: true } } },
                orderBy: { startDate: 'desc' }
            }
        }
    });

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-6">
            <div className="w-full max-w-4xl space-y-8 bg-card p-10 rounded-xl shadow-xl border">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-primary">Tableau de bord</h1>
                    <p className="text-lg text-muted-foreground">Bon retour, {session?.user?.name || session?.user?.email} !</p>
                </div>

                <div>
                    <h3 className="font-semibold mb-4 text-xl">Mes Réservations</h3>
                    <div className="space-y-4">
                        {user?.clientReservations.length === 0 ? (
                            <div className="h-40 rounded-lg border bg-background p-6 shadow-sm flex items-center justify-center text-muted-foreground">
                                Aucune réservation active.
                            </div>
                        ) : (
                            user?.clientReservations.map(res => (
                                <div key={res.id} className="flex justify-between items-center p-4 rounded-lg border bg-background shadow-sm">
                                    <div>
                                        <div className="font-bold">{res.pro.user.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {new Date(res.startDate).toLocaleDateString()} at {new Date(res.startDate).toLocaleTimeString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-semibold">{res.totalPrice}€</span>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${res.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                            res.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {res.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <form
                    action={async () => {
                        'use server';
                        await signOut();
                    }}
                >
                    <button
                        className="rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground hover:bg-destructive/90 transition-colors"
                    >
                        <button type="submit">Se déconnecter</button>
                    </button>
                </form>
            </div>
        </div>
    );
}
