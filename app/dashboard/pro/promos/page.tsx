import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PromoManager } from '@/components/pro/promo-manager'

export default async function PromosPage() {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== 'PRO') {
        redirect('/login')
    }

    const proProfile = await prisma.proProfile.findUnique({
        where: { userId: session.user.id }
    })

    if (!proProfile) {
        redirect('/register/pro')
    }

    return (
        <div className="space-y-6">
            <Link href="/dashboard/pro" className="flex items-center gap-2 text-[#A0A0B8] hover:text-white transition-colors mb-4 group">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Retour au tableau de bord
            </Link>
            <div>
                <h1 className="text-2xl font-bold text-white font-poppins">Codes Promos</h1>
                <p className="text-[#A0A0B8]">Créez des offres spéciales pour fidéliser vos clients et attirer de nouveaux rendez-vous.</p>
            </div>

            <PromoManager />
        </div>
    )
}
