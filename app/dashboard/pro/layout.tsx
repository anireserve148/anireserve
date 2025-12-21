import { ProSidebar } from '@/components/dashboard/ProSidebar'
import { ProTopbar } from '@/components/dashboard/ProTopbar'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function ProDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user || session.user.role !== 'PRO') {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-[#0F0F23]">
            {/* Sidebar */}
            <ProSidebar />

            {/* Main Content */}
            <div className="md:pl-64">
                <ProTopbar
                    userName={session.user.name || 'Professionnel'}
                    userRole="Professionnel"
                />
                <main className="p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
