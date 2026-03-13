import { motion } from 'framer-motion';

const LoadingSpinner = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"
            />
            <p className="text-gray-500 text-sm animate-pulse font-medium">Loading magic...</p>
        </div>
    );
};

export default LoadingSpinner;
