import React from 'react';

/**
 * Base skeleton component with shimmer animation
 */
const SkeletonBase = ({ className = "", children }) => (
    <div className={`animate-pulse ${className}`}>
        {children}
    </div>
);

/**
 * Generic skeleton bar
 */
const SkeletonBar = ({ width = "w-full", height = "h-4", className = "" }) => (
    <div className={`bg-gray-200 rounded ${width} ${height} ${className}`}></div>
);

/**
 * Skeleton for bus line items in the sidebar
 */
export const BusLineItemSkeleton = () => (
    <SkeletonBase>
        <div className="p-3 bg-white rounded-md border border-gray-200 space-y-2">
            <SkeletonBar width="w-20" height="h-5" className="bg-gray-300" />
            <SkeletonBar width="w-full" height="h-4" />
        </div>
    </SkeletonBase>
);

/**
 * Skeleton for multiple bus line items
 */
export const BusLinesListSkeleton = ({ count = 6 }) => (
    <div className="p-2 space-y-2">
        {Array.from({ length: count }).map((_, index) => (
            <BusLineItemSkeleton key={index} />
        ))}
    </div>
);

/**
 * Skeleton for search suggestions
 */
export const SearchSuggestionSkeleton = () => (
    <SkeletonBase>
        <div className="px-3 py-2 space-y-2">
            <SkeletonBar width="w-3/4" height="h-4" className="bg-gray-300" />
            <SkeletonBar width="w-1/2" height="h-3" />
        </div>
    </SkeletonBase>
);

/**
 * Skeleton for search suggestions list
 */
export const SearchSuggestionsListSkeleton = ({ count = 3 }) => (
    <ul className="absolute z-10 w-full top-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
        {Array.from({ length: count }).map((_, index) => (
            <li key={index} className="border-b border-gray-100 last:border-b-0">
                <SearchSuggestionSkeleton />
            </li>
        ))}
    </ul>
);

/**
 * Skeleton for route details header
 */
export const RouteHeaderSkeleton = () => (
    <SkeletonBase>
        <div className="p-4 border-b bg-gray-50 space-y-3">
            <div className="flex justify-between items-center">
                <SkeletonBar width="w-32" height="h-6" className="bg-gray-300" />
                <SkeletonBar width="w-24" height="h-4" />
            </div>
            <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="text-center space-y-1">
                        <SkeletonBar width="w-12" height="h-5" className="bg-gray-300 mx-auto" />
                        <SkeletonBar width="w-16" height="h-3" className="mx-auto" />
                    </div>
                ))}
            </div>
        </div>
    </SkeletonBase>
);

/**
 * Skeleton for individual route segment
 */
export const RouteSegmentSkeleton = () => (
    <SkeletonBase>
        <div className="flex items-start gap-5 p-6">
            <div className="mt-1">
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
            </div>
            <div className="flex-1 space-y-3">
                <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                        <SkeletonBar width="w-2/3" height="h-5" className="bg-gray-300" />
                        <SkeletonBar width="w-1/2" height="h-4" />
                    </div>
                    <div className="text-right space-y-1 ml-4">
                        <SkeletonBar width="w-16" height="h-5" className="bg-gray-300" />
                        <SkeletonBar width="w-12" height="h-4" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <SkeletonBar width="w-16" height="h-6" className="rounded-full" />
                    <SkeletonBar width="w-24" height="h-4" />
                </div>
            </div>
        </div>
    </SkeletonBase>
);

/**
 * Skeleton for complete route details
 */
export const RouteDetailsSkeleton = () => (
    <div className="bg-white rounded-lg shadow">
        <RouteHeaderSkeleton />

        {/* Tab navigation skeleton */}
        <SkeletonBase>
            <div className="flex border-b">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex-1 py-4 text-center">
                        <SkeletonBar width="w-20" height="h-4" className="mx-auto" />
                    </div>
                ))}
            </div>
        </SkeletonBase>

        {/* Route segments skeleton */}
        <div className="space-y-0">
            {Array.from({ length: 3 }).map((_, index) => (
                <RouteSegmentSkeleton key={index} />
            ))}
        </div>
    </div>
);

/**
 * Skeleton for line detail sidebar
 */
export const LineDetailSkeleton = () => (
    <SkeletonBase>
        <div className="p-4 space-y-6">
            {/* Header with back button */}
            <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-300 rounded"></div>
                <SkeletonBar width="w-16" height="h-6" className="bg-gray-300" />
            </div>

            {/* Line info */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <SkeletonBar width="w-24" height="h-4" />
                    <SkeletonBar width="w-full" height="h-5" className="bg-gray-300" />
                </div>
                <div className="space-y-2">
                    <SkeletonBar width="w-20" height="h-4" />
                    <SkeletonBar width="w-full" height="h-5" className="bg-gray-300" />
                </div>
                <div className="space-y-2">
                    <SkeletonBar width="w-16" height="h-4" />
                    <SkeletonBar width="w-24" height="h-5" className="bg-gray-300" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex-1 py-4 text-center">
                        <SkeletonBar width="w-16" height="h-4" className="mx-auto" />
                    </div>
                ))}
            </div>
        </div>
    </SkeletonBase>
);

/**
 * Skeleton for map loading
 */
export const MapSkeleton = () => (
    <SkeletonBase>
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="space-y-2">
                    <SkeletonBar width="w-32" height="h-4" className="mx-auto bg-gray-300" />
                    <SkeletonBar width="w-24" height="h-3" className="mx-auto" />
                </div>
            </div>
        </div>
    </SkeletonBase>
);

/**
 * Skeleton for strategy comparison results
 */
export const StrategyComparisonSkeleton = ({ count = 3 }) => (
    <div className="space-y-2">
        {Array.from({ length: count }).map((_, index) => (
            <SkeletonBase key={index}>
                <div className="p-3 border rounded-md space-y-2">
                    <div className="flex items-center justify-between">
                        <SkeletonBar width="w-32" height="h-4" className="bg-gray-300" />
                        {index === 0 && (
                            <div className="w-12 h-5 bg-green-200 rounded-full"></div>
                        )}
                    </div>
                    <div className="space-y-1">
                        <SkeletonBar width="w-24" height="h-3" />
                        <SkeletonBar width="w-20" height="h-3" />
                    </div>
                </div>
            </SkeletonBase>
        ))}
    </div>
);

/**
 * Skeleton for navigation tab
 */
export const NavigationTabSkeleton = () => (
    <SkeletonBase>
        <div className="p-4 space-y-4">
            {/* Location inputs */}
            <div className="flex items-start gap-3">
                <div className="flex flex-col items-center pt-3 space-y-1">
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                    <div className="h-8 w-px bg-gray-300"></div>
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                </div>
                <div className="flex-1 space-y-4">
                    <div className="flex gap-2">
                        <SkeletonBar width="w-full" height="h-10" className="rounded-md" />
                        <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
                    </div>
                    <div className="flex gap-2">
                        <SkeletonBar width="w-full" height="h-10" className="rounded-md" />
                        <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
                    </div>
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-md mt-auto mb-auto"></div>
            </div>

            {/* Strategy selection */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <SkeletonBar width="w-24" height="h-4" />
                    <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                </div>
                <SkeletonBar width="w-full" height="h-10" className="rounded-md" />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
                <SkeletonBar width="w-full" height="h-10" className="rounded-md bg-gray-300" />
                <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
            </div>
        </div>
    </SkeletonBase>
);

/**
 * Skeleton for stop list in line details
 */
export const StopListSkeleton = ({ count = 8 }) => (
    <SkeletonBase>
        <div className="px-2 space-y-1">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="px-3 py-2 rounded-md">
                    <SkeletonBar
                        width={`w-${Math.floor(Math.random() * 3) + 2}/3`}
                        height="h-4"
                        className="bg-gray-300"
                    />
                </div>
            ))}
        </div>
    </SkeletonBase>
);

export default {
    BusLineItemSkeleton,
    BusLinesListSkeleton,
    SearchSuggestionSkeleton,
    SearchSuggestionsListSkeleton,
    RouteHeaderSkeleton,
    RouteSegmentSkeleton,
    RouteDetailsSkeleton,
    LineDetailSkeleton,
    MapSkeleton,
    StrategyComparisonSkeleton,
    NavigationTabSkeleton,
    StopListSkeleton
};