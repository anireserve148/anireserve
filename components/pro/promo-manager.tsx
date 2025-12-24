'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Ticket, Plus, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { getPromoCodes, createPromoCode, togglePromoCode } from '@/app/lib/promo-actions'

export function PromoManager() {
    const [codes, setCodes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
        discountValue: 0,
        usageLimit: '',
        description: ''
    })

    useEffect(() => {
        loadCodes()
    }, [])

    const loadCodes = async () => {
        setLoading(true)
        const result = await getPromoCodes()
        if (result.success) setCodes(result.data || [])
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.code || formData.discountValue <= 0) {
            toast.error('Veuillez remplir les champs obligatoires')
            return
        }

        setCreating(true)
        const result = await createPromoCode({
            ...formData,
            usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined
        })

        if (result.success) {
            toast.success('Code promo créé !')
            setFormData({
                code: '',
                discountType: 'PERCENTAGE',
                discountValue: 0,
                usageLimit: '',
                description: ''
            })
            loadCodes()
        } else {
            toast.error(result.error)
        }
        setCreating(false)
    }

    const handleToggle = async (id: string, currentStatus: boolean) => {
        const result = await togglePromoCode(id, !currentStatus)
        if (result.success) {
            setCodes(codes.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c))
            toast.success('Statut mis à jour')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-[#2EB190] animate-spin" />
            </div>
        )
    }

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Create Form */}
            <Card className="bg-[#1A1A2E] border-[#2A2A4A] h-fit">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Plus className="w-5 h-5 text-[#2EB190]" />
                        Nouveau Code
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm text-[#A0A0B8]">Code (ex: ETE2024)</label>
                            <Input
                                placeholder="BIENVENUE10"
                                className="bg-[#16162D] border-[#2A2A4A] text-white uppercase"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-[#A0A0B8]">Type</label>
                                <Select
                                    value={formData.discountType}
                                    onValueChange={(v: any) => setFormData({ ...formData, discountType: v })}
                                >
                                    <SelectTrigger className="bg-[#16162D] border-[#2A2A4A] text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1A1A2E] border-[#2A2A4A] text-white">
                                        <SelectItem value="PERCENTAGE">Pourcentage (%)</SelectItem>
                                        <SelectItem value="FIXED">Fixe (₪)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-[#A0A0B8]">Valeur</label>
                                <Input
                                    type="number"
                                    className="bg-[#16162D] border-[#2A2A4A] text-white"
                                    value={formData.discountValue}
                                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-[#A0A0B8]">Limite d'utilisations (Optionnel)</label>
                            <Input
                                type="number"
                                placeholder="Illimité"
                                className="bg-[#16162D] border-[#2A2A4A] text-white"
                                value={formData.usageLimit}
                                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-[#2EB190] hover:bg-[#238B70]"
                            disabled={creating}
                        >
                            {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Créer le code
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* List */}
            <div className="lg:col-span-2 space-y-4">
                {codes.length === 0 ? (
                    <Card className="bg-[#1A1A2E] border-[#2A2A4A] border-dashed">
                        <CardContent className="p-12 text-center">
                            <Ticket className="w-12 h-12 text-[#2A2A4A] mx-auto mb-4" />
                            <p className="text-[#A0A0B8]">Vous n'avez pas encore de codes promos.</p>
                        </CardContent>
                    </Card>
                ) : (
                    codes.map((code) => (
                        <Card key={code.id} className="bg-[#1A1A2E] border-[#2A2A4A]">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[#2EB190]/10 flex items-center justify-center">
                                        <Ticket className="w-6 h-6 text-[#2EB190]" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold">{code.code}</h3>
                                        <p className="text-[#A0A0B8] text-sm">
                                            {code.discountValue}{code.discountType === 'PERCENTAGE' ? '%' : ' ₪'} de réduction
                                            {code.usageLimit ? ` • ${code.usageCount}/${code.usageLimit} utilisés` : ` • ${code.usageCount} utilisés`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Switch
                                        checked={code.isActive}
                                        onCheckedChange={() => handleToggle(code.id, code.isActive)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
