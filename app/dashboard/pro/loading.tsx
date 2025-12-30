import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-24 rounded-full" />
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-5 w-48" />
                </div>
                <Skeleton className="h-10 w-48" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="bg-[#1A1A2E] border-[#2A2A4A]">
                        <CardContent className="p-6">
                            <div className="w-12 h-12 rounded-xl bg-white/5 mb-4">
                                <Skeleton className="w-full h-full rounded-xl" />
                            </div>
                            <Skeleton className="h-8 w-32 mb-2" />
                            <Skeleton className="h-4 w-40" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Skeleton */}
            <div className="space-y-6">
                <Card className="bg-[#1A1A2E] border-[#2A2A4A]">
                    <div className="p-4 border-b border-[#2A2A4A]">
                        <Skeleton className="h-6 w-48" />
                    </div>
                    <CardContent className="p-4 space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-[#16162D] rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-10 h-10 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-48" />
                                    </div>
                                </div>
                                <Skeleton className="h-6 w-16" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="bg-[#1A1A2E] border-[#2A2A4A]">
                    <div className="p-4 border-b border-[#2A2A4A]">
                        <Skeleton className="h-6 w-48" />
                    </div>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-[#16162D] rounded-lg">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-12" />
                                    </div>
                                    <Skeleton className="h-5 w-12" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
