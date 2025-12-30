import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"

export default function Loading() {
    return (
        <div className="min-h-screen bg-background animate-in fade-in duration-500">
            <div className="container mx-auto py-8 px-4 max-w-5xl">
                {/* Back Button Skeleton */}
                <div className="inline-flex items-center text-sm font-medium text-muted-foreground mb-8">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    <Skeleton className="h-4 w-32" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Header Skeleton */}
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-full" />

                            <div className="flex-1 space-y-6">
                                <div className="flex flex-wrap items-center gap-4">
                                    <Skeleton className="h-8 w-64" />
                                    <div className="flex gap-2">
                                        <Skeleton className="h-10 w-28 rounded-lg" />
                                        <Skeleton className="h-10 w-10 rounded-lg" />
                                    </div>
                                </div>

                                {/* Stats Row Skeleton */}
                                <div className="flex gap-8 py-4 md:py-0">
                                    <div className="space-y-2">
                                        <Skeleton className="h-6 w-12" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-6 w-12" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-6 w-12" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                        </div>

                        {/* Tabs Skeleton */}
                        <div className="w-full mt-12 border-b flex gap-8 h-14">
                            <Skeleton className="h-full w-24" />
                            <Skeleton className="h-full w-24" />
                            <Skeleton className="h-full w-24" />
                        </div>

                        <div className="grid gap-6 mt-8">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-32 w-full rounded-xl" />
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Booking Widget Skeleton */}
                    <div className="lg:col-span-1">
                        <Skeleton className="h-96 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        </div>
    )
}
