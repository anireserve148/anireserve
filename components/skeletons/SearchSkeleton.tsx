'use client'

export function ProCardSkeleton() {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 animate-pulse">
            <div className="flex flex-col sm:flex-row gap-5">
                {/* Image skeleton */}
                <div className="w-full sm:w-32 h-40 sm:h-32 rounded-2xl bg-gray-200" />

                {/* Content skeleton */}
                <div className="flex-1 space-y-3">
                    {/* Title */}
                    <div className="h-6 bg-gray-200 rounded-lg w-3/4" />

                    {/* Location */}
                    <div className="h-4 bg-gray-200 rounded w-1/2" />

                    {/* Categories */}
                    <div className="flex gap-2">
                        <div className="h-6 bg-gray-200 rounded-full w-20" />
                        <div className="h-6 bg-gray-200 rounded-full w-24" />
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-4">
                        <div className="h-4 bg-gray-200 rounded w-24" />
                        <div className="h-10 bg-gray-200 rounded-xl w-32" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export function SearchSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <ProCardSkeleton key={i} />
            ))}
        </div>
    )
}
