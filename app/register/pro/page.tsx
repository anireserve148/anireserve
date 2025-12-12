import { prisma } from '@/lib/prisma'
import { ProRegisterForm } from '@/components/pro-register-form'

export default async function ProRegisterPage() {
    const [cities, allCategories] = await Promise.all([
        prisma.city.findMany({
            orderBy: { name: 'asc' }
        }),
        prisma.serviceCategory.findMany({
            orderBy: { name: 'asc' }
        })
    ])

    const parentCategories = allCategories.filter(c => !c.parentId)

    return <ProRegisterForm cities={cities} categories={parentCategories} allCategories={allCategories} />
}
