import { Skeleton } from "@/components/ui/skeleton"
import { Search, MapPin, Star } from "lucide-react"

export default function Loading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30">
            {/* Navbar Placeholder */}
            <div className="h-16 border-b bg-white/80 backdrop-blur-md flex items-center px-4">
                <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
                    <Skeleton className="h-8 w-32" />
                    <div className="flex gap-4">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                </div>
            </div>

            <section className="py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Filters Sidebar Skeleton */}
                        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-border/50">
                                <Skeleton className="h-6 w-32 mb-6" />
                                <div className="space-y-4">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>
                        </div>

                        {/* Results Skeleton */}
                        <div className="lg:col-span-8 xl:col-span-9">
                            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm border border-border/50 h-full min-h-[600px]">
                                <div className="flex items-center gap-2 mb-2">
                                    <Skeleton className="h-8 w-48" />
                                </div>
                                <Skeleton className="h-4 w-64 mb-8" />

                                <div className="space-y-4">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="border border-gray-100 rounded-2xl p-6">
                                            <div className="flex flex-col sm:flex-row gap-6">
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="space-y-2">
                                                            <Skeleton className="h-6 w-48" />
                                                            <Skeleton className="h-4 w-32" />
                                                        </div>
                                                        <div className="hidden sm:flex gap-2">
                                                            <Skeleton className="h-10 w-10 rounded-full" />
                                                            <Skeleton className="h-10 w-28 rounded-full" />
                                                        </div>
                                                    </div>
                                                    <Skeleton className="h-4 w-full mb-2" />
                                                    <Skeleton className="h-4 w-2/3 mb-4" />
                                                    <div className="flex justify-between items-center">
                                                        <Skeleton className="h-4 w-24" />
                                                        <Skeleton className="h-6 w-12 rounded-lg" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
