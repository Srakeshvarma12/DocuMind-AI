import { FileText } from 'lucide-react';

export default function Logo({ size = "md", className = "" }) {
    const sizeClasses = {
        sm: {
            container: "w-8 h-8 rounded-lg",
            icon: 14
        },
        md: {
            container: "w-10 h-10 rounded-lg",
            icon: 18
        },
        lg: {
            container: "w-12 h-12 rounded-xl",
            icon: 20
        },
        xl: {
            container: "w-16 h-16 rounded-2xl",
            icon: 28
        }
    };

    const config = sizeClasses[size] || sizeClasses.md;

    return (
        <div className={`${config.container} bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20 transition-all duration-300 ${className}`}>
            <FileText size={config.icon} className="text-white" />
        </div>
    );
}
