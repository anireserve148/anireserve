"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

interface UserGrowthChartProps {
    data: any[]
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Croissance Utilisateurs</CardTitle>
                <CardDescription>
                    Nouveaux inscrits par mois (Clients vs Pros)
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorPros" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="Clients" stroke="#8884d8" fillOpacity={1} fill="url(#colorClients)" />
                            <Area type="monotone" dataKey="Pros" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPros)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
