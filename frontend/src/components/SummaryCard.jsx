import { BookOpen, Hash, FileText, Calendar, HardDrive } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function SummaryCard({ summary }) {
    if (!summary) return null;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString(undefined, {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const statItems = [
        { label: 'Pages', value: summary.page_count, icon: <BookOpen size={18} /> },
        { label: 'Words', value: summary.word_count.toLocaleString(), icon: <Hash size={18} /> },
        { label: 'File Type', value: summary.file_type.toUpperCase(), icon: <FileText size={18} /> },
        { label: 'Size', value: `${(summary.file_size / 1024 / 1024).toFixed(2)} MB`, icon: <HardDrive size={18} /> },
    ];

    return (
        <div className="space-y-12 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {statItems.map((stat, i) => (
                    <div
                        key={stat.label}
                        className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-slide-up"
                        style={{ animationDelay: `${i * 100}ms` }}
                    >
                        <div className="text-brand-600 mb-3">{stat.icon}</div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Summary Content */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-12 shadow-sm relative overflow-hidden animate-slide-up animation-delay-400">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-brand-50 rounded-full blur-3xl opacity-20"></div>

                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50 relative z-10">
                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                        <FileText size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">AI Document Summary</h2>
                </div>

                <article className="prose prose-sm md:prose-base max-w-none text-gray-600 leading-relaxed relative z-10">
                    <ReactMarkdown>{summary.summary}</ReactMarkdown>
                </article>
            </div>

            {/* Footer Info */}
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest px-2 group">
                <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>Uploaded on {formatDate(summary.uploaded_at)}</span>
                </div>
                <span>Ready for Analysis</span>
            </div>
        </div>
    );
}
