export default function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
            {/* Image skeleton */}
            <div className="h-48 bg-gray-200"></div>
            
            {/* Content skeleton */}
            <div className="p-4 space-y-3">
                {/* Badge skeleton */}
                <div className="w-20 h-5 bg-gray-200 rounded-full"></div>
                
                {/* Title skeleton */}
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                
                {/* Subtitle skeleton */}
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                
                {/* Description skeleton */}
                <div className="space-y-2 pt-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
                
                {/* Info skeleton */}
                <div className="flex items-center gap-4 pt-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                
                {/* Button skeleton */}
                <div className="h-10 bg-gray-200 rounded mt-4"></div>
            </div>
        </div>
    );
}
