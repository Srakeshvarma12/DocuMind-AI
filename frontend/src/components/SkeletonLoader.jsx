export default function SkeletonLoader({ lines = 3, className = '' }) {
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="skeleton-loader h-3.5"
                    style={{
                        width: i === lines - 1 ? '55%' : i % 2 === 0 ? '100%' : '80%',
                        animationDelay: `${i * 0.06}s`,
                    }}
                />
            ))}
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4 animate-fade-in">
            <div className="flex items-center gap-3">
                <div className="skeleton-loader h-9 w-9 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                    <div className="skeleton-loader h-3.5 w-3/4" />
                    <div className="skeleton-loader h-3 w-1/3" />
                </div>
            </div>
            <div className="skeleton-loader h-5 w-16 rounded-full" />
            <div className="flex items-center gap-4">
                <div className="skeleton-loader h-3 w-20" />
                <div className="skeleton-loader h-3 w-14" />
            </div>
        </div>
    );
}
