"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts"

interface MonthlyData {
    month: string
    reservations: number
    revenue: number
}

interface ServiceData {
    name: string
    count: number
}

interface StatsChartsProps {
    monthlyData: MonthlyData[]
    serviceData: ServiceData[]
    hourlyData: { hour: string; count: number }[]
}

const COLORS = ['#2EB190', '#7B68EE', '#F39C12', '#3498DB', '#E74C3C', '#9B59B6']

export function RevenueChart({ data }: { data: MonthlyData[] }) {
    return (
        <Card className="bg-[#1A1A2E] border-[#2A2A4A]">
            <CardHeader>
                <CardTitle className="text-lg text-white">Revenus par mois</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2EB190" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#2EB190" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A4A" />
                        <XAxis dataKey="month" stroke="#6C6C8A" fontSize={12} />
                        <YAxis stroke="#6C6C8A" fontSize={12} tickFormatter={(v) => `${v}₪`} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1A1A2E',
                                border: '1px solid #2A2A4A',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                            formatter={(value: number) => [`${value} ₪`, 'Revenus']}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#2EB190"
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

export function ReservationsChart({ data }: { data: MonthlyData[] }) {
    return (
        <Card className="bg-[#1A1A2E] border-[#2A2A4A]">
            <CardHeader>
                <CardTitle className="text-lg text-white">Réservations par mois</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A4A" />
                        <XAxis dataKey="month" stroke="#6C6C8A" fontSize={12} />
                        <YAxis stroke="#6C6C8A" fontSize={12} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1A1A2E',
                                border: '1px solid #2A2A4A',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                            formatter={(value: number) => [value, 'Réservations']}
                        />
                        <Bar dataKey="reservations" fill="#7B68EE" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

export function ServicesChart({ data }: { data: ServiceData[] }) {
    if (data.length === 0) return null

    return (
        <Card className="bg-[#1A1A2E] border-[#2A2A4A]">
            <CardHeader>
                <CardTitle className="text-lg text-white">Services les plus demandés</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data as any}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="count"
                            nameKey="name"
                            label={(({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`) as any}
                            labelLine={false}
                        >
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1A1A2E',
                                border: '1px solid #2A2A4A',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                            formatter={(value: number) => [value, 'Réservations']}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

export function HourlyChart({ data }: { data: { hour: string; count: number }[] }) {
    return (
        <Card className="bg-[#1A1A2E] border-[#2A2A4A]">
            <CardHeader>
                <CardTitle className="text-lg text-white">Heures les plus demandées</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A4A" />
                        <XAxis type="number" stroke="#6C6C8A" fontSize={12} />
                        <YAxis dataKey="hour" type="category" stroke="#6C6C8A" fontSize={12} width={50} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1A1A2E',
                                border: '1px solid #2A2A4A',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                            formatter={(value: number) => [value, 'Réservations']}
                        />
                        <Bar dataKey="count" fill="#F39C12" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
