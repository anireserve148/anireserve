'use client'

import { Trophy, Star, TrendingUp } from 'lucide-react'

interface TopPro {
    rank: number
    name: string
    avatar?: string
    rating: number
    revenue: string
    bookings: number
    trend?: string
}

const MOCK_TOP_PROS: TopPro[] = [
    { rank: 1, name: 'David Cohen', rating: 5.0, revenue: '62,800₪', bookings: 203, trend: '+15%' },
    { rank: 2, name: 'Marie Levy', rating: 4.9, revenue: '45,200₪', bookings: 156, trend: '+8%' },
    { rank: 3, name: 'Sarah Ben', rating: 4.8, revenue: '38,400₪', bookings: 134, trend: '+12%' },
    { rank: 4, name: 'Michel Azoulay', rating: 4.7, revenue: '32,100₪', bookings: 98, trend: '+5%' },
    { rank: 5, name: 'Lea Mizrahi', rating: 4.7, revenue: '28,500₪', bookings: 87, trend: '+3%' },
]

export function ProLeaderboard() {
    const [first, second, third, ...rest] = MOCK_TOP_PROS

    return (
        <div className="bg-[#1A1A2E] rounded-2xl border border-[#2A2A4A] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2A1A4A] to-[#1A1A2E] p-6 border-b border-[#2A2A4A]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFD700]/20 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-[#FFD700]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Top Pros du Mois</h3>
                        <p className="text-sm text-[#A0A0B8]">Classement par revenus</p>
                    </div>
                </div>
            </div>

            {/* Podium */}
            <div className="p-6 flex justify-center items-end gap-4">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-[#16162D] border-3 border-[#C0C0C0] flex items-center justify-center">
                            <span className="text-xl font-bold text-white">{second.name[0]}</span>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#C0C0C0] flex items-center justify-center shadow-lg">
                            <span className="text-xs font-bold text-black">2</span>
                        </div>
                    </div>
                    <p className="text-sm font-medium text-white mt-3">{second.name}</p>
                    <p className="text-xs text-[#A0A0B8]">⭐ {second.rating}</p>
                    <div className="h-16 w-full bg-[#C0C0C0]/20 rounded-t-lg mt-2 flex items-end justify-center pb-2">
                        <span className="text-xs font-bold text-white">{second.revenue}</span>
                    </div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center">
                    <span className="text-2xl mb-1">👑</span>
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-[#16162D] border-4 border-[#FFD700] flex items-center justify-center shadow-lg shadow-[#FFD700]/20">
                            <span className="text-2xl font-bold text-white">{first.name[0]}</span>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center shadow-lg">
                            <span className="text-sm font-bold text-black">1</span>
                        </div>
                    </div>
                    <p className="text-sm font-semibold text-white mt-3">{first.name}</p>
                    <p className="text-xs text-[#A0A0B8]">⭐ {first.rating}</p>
                    <div className="h-24 w-full bg-[#FFD700]/20 rounded-t-lg mt-2 flex items-end justify-center pb-2">
                        <span className="text-sm font-bold text-[#FFD700]">{first.revenue}</span>
                    </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-[#16162D] border-3 border-[#CD7F32] flex items-center justify-center">
                            <span className="text-xl font-bold text-white">{third.name[0]}</span>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#CD7F32] flex items-center justify-center shadow-lg">
                            <span className="text-xs font-bold text-black">3</span>
                        </div>
                    </div>
                    <p className="text-sm font-medium text-white mt-3">{third.name}</p>
                    <p className="text-xs text-[#A0A0B8]">⭐ {third.rating}</p>
                    <div className="h-12 w-full bg-[#CD7F32]/20 rounded-t-lg mt-2 flex items-end justify-center pb-2">
                        <span className="text-xs font-bold text-white">{third.revenue}</span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="p-4 pt-0">
                <table className="w-full">
                    <thead>
                        <tr className="text-[#6C6C8A] text-xs uppercase">
                            <th className="text-left py-3 px-4">Rang</th>
                            <th className="text-left py-3 px-4">Pro</th>
                            <th className="text-center py-3 px-4">Note</th>
                            <th className="text-right py-3 px-4">Revenus</th>
                            <th className="text-right py-3 px-4">Performance</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {MOCK_TOP_PROS.map((pro) => (
                            <tr key={pro.rank} className="border-t border-[#2A2A4A] hover:bg-[#252545] transition-colors">
                                <td className="py-3 px-4">
                                    <span className={`font-bold ${pro.rank <= 3 ? 'text-[#FFD700]' : 'text-[#A0A0B8]'}`}>
                                        #{pro.rank.toString().padStart(2, '0')}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#7B68EE]/30 flex items-center justify-center">
                                            <span className="text-xs font-bold text-[#7B68EE]">{pro.name[0]}</span>
                                        </div>
                                        <span className="text-white font-medium">{pro.name}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Star className="w-4 h-4 text-[#FFD700] fill-[#FFD700]" />
                                        <span className="text-white">{pro.rating}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-right text-[#2EB190] font-semibold">{pro.revenue}</td>
                                <td className="py-3 px-4 text-right">
                                    <span className="inline-flex items-center gap-1 text-[#2EB190] bg-[#2EB190]/20 px-2 py-1 rounded-full text-xs font-medium">
                                        <TrendingUp className="w-3 h-3" />
                                        {pro.trend}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
