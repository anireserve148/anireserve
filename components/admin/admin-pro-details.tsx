'use client'

import { useState } from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { verifyPro, rejectPro } from '@/app/lib/admin-actions'
import { toast } from 'sonner'
import { Shield, CheckCircle, XCircle } from 'lucide-react'

interface ProDetailsProps {
    pro: any // Using any for simplicity in rapid dev, ideally strictly typed
}

export function AdminProDetails({ pro }: ProDetailsProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleVerify = async () => {
        setIsLoading(true)
        const result = await verifyPro(pro.id)
        setIsLoading(false)
        if (result.success) {
            toast.success('Professionnel vérifié avec succès')
            setIsOpen(false)
        } else {
            toast.error('Erreur lors de la vérification')
        }
    }

    const handleReject = async () => {
        setIsLoading(true)
        const result = await rejectPro(pro.id)
        setIsLoading(false)
        if (result.success) {
            toast.success('Professionnel rejeté')
            setIsOpen(false)
        } else {
            toast.error('Erreur lors du rejet')
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button className="bg-navy hover:bg-navy-light text-white">
                    <Shield className="w-4 h-4 mr-2" />
                    Gérer
                </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto sm:max-w-xl w-full">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2 text-2xl">
                        {pro.user.name}
                        {pro.verificationStatus === 'VERIFIED' && <CheckCircle className="w-5 h-5 text-green-500" />}
                    </SheetTitle>
                    <SheetDescription>
                        {pro.user.email} · Inscrit le {new Date(pro.createdAt).toLocaleDateString()}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Status Sections */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-600">Statut actuel</span>
                        <Badge variant={
                            pro.verificationStatus === 'VERIFIED' ? 'default' :
                                pro.verificationStatus === 'REJECTED' ? 'destructive' : 'secondary'
                        }>
                            {pro.verificationStatus || 'PENDING'}
                        </Badge>
                    </div>

                    <Tabs defaultValue="details" className="w-full">
                        <TabsList className="w-full grid grid-cols-2">
                            <TabsTrigger value="details">Détails</TabsTrigger>
                            <TabsTrigger value="services">Services & Tarifs</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-4 mt-4">
                            <div>
                                <h3 className="font-semibold text-navy mb-2">Biographie</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {pro.bio || "Aucune biographie fournie."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 border rounded-lg">
                                    <div className="text-xs text-gray-500">Ville</div>
                                    <div className="font-medium">{pro.city?.name}</div>
                                </div>
                                <div className="p-3 border rounded-lg">
                                    <div className="text-xs text-gray-500">Tarif horaire de base</div>
                                    <div className="font-medium">{pro.hourlyRate}₪ /h</div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-navy mb-2">Catégories</h3>
                                <div className="flex flex-wrap gap-2">
                                    {pro.serviceCategories.map((cat: any) => (
                                        <Badge key={cat.id} variant="outline">{cat.name}</Badge>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="services" className="space-y-4 mt-4">
                            {/* Placeholder for custom services if implemented later */}
                            <p className="text-sm text-gray-500 italic">Ce professionnel n'a pas encore défini de services personnalisés.</p>
                        </TabsContent>
                    </Tabs>

                    {/* Action Buttons */}
                    <div className="pt-6 border-t flex flex-col gap-3">
                        <h3 className="font-semibold text-navy">Actions Administrateur</h3>
                        <div className="flex gap-3">
                            <Button
                                onClick={handleVerify}
                                disabled={isLoading || pro.verificationStatus === 'VERIFIED'}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Valider le compte
                            </Button>
                            <Button
                                onClick={handleReject}
                                disabled={isLoading || pro.verificationStatus === 'REJECTED'}
                                variant="destructive"
                                className="flex-1"
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Rejeter / Suspendre
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
