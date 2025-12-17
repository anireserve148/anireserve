import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { ServiceForm } from '@/components/pro/service-form'
import { ServiceList } from '@/components/pro/service-list'

export default async function ProServicesPage() {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== 'PRO') {
        redirect('/login')
    }

    const proProfile = await prisma.proProfile.findUnique({
        where: { userId: session.user.id },
        include: {
            services: {
                include: {
                    category: true
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    if (!proProfile) {
        redirect('/register/pro')
    }

    // Fetch all categories for optional category selection
    const categories = await prisma.serviceCategory.findMany({
        orderBy: { name: 'asc' }
    })

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-navy">Mes Services</h1>
                        <p className="text-gray-600 mt-1">
                            Gérez vos services avec des prix et durées personnalisés
                        </p>
                    </div>
                </div>

                {/* Add Service Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-primary" />
                            Nouveau Service
                        </CardTitle>
                        <CardDescription>
                            Créez un service avec un nom personnalisé, prix et durée
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ServiceForm categories={categories} />
                    </CardContent>
                </Card>

                {/* Services List */}
                <ServiceList services={proProfile.services} />
            </div>
        </div>
    )
}
