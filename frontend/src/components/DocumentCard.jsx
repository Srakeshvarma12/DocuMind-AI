import { useNavigate } from 'react-router-dom';
import { FileText, FileType, File, Calendar, BookOpen, Trash2, Clock } from 'lucide-react';

const icons = {
    pdf: <FileText className="text-red-500" size={18} />,
    docx: <FileType className="text-blue-500" size={18} />,
    txt: <File className="text-gray-400" size={18} />,
};

const statusColors = {
    uploading: 'bg-amber-50 text-amber-700 border-amber-100',
    processing: 'bg-brand-50 text-brand-700 border-brand-100',
    ready: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    failed: 'bg-red-50 text-red-700 border-red-100',
};

export default function DocumentCard({ document, onDelete }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (document.status === 'ready') {
            navigate(`/document/${document.id}/summary`);
        }
    };

    const handleChat = (e) => {
        e.stopPropagation();
        navigate(`/document/${document.id}/chat`);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this document?')) {
            onDelete(document.id);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div
            onClick={handleClick}
            className={`card-premium group ${document.status === 'ready' ? 'cursor-pointer' : 'cursor-default'}`}
        >
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:border-brand-200 group-hover:bg-brand-50/30 transition-colors">
                        {icons[document.file_type] || <File size={18} />}
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 truncate pr-2 group-hover:text-brand-600 transition-colors">
                            {document.title}
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1 uppercase font-semibold">
                            <Clock size={10} />
                            {(document.file_size / 1024 / 1024).toFixed(2)} MB • {document.file_type}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleDelete}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-4">
                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[document.status]} uppercase tracking-wider`}>
                        {document.status}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-medium">
                        <Calendar size={12} />
                        {formatDate(document.uploaded_at)}
                    </div>
                </div>

                {document.status === 'ready' && (
                    <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400">
                        <span className="flex items-center gap-1">
                            <BookOpen size={12} />
                            {document.page_count}p
                        </span>
                    </div>
                )}
            </div>

            {document.status === 'failed' && document.error_message && (
                <div className="mt-4 p-2 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-[10px] text-red-600 leading-tight line-clamp-2">
                        {document.error_message}
                    </p>
                </div>
            )}
        </div>
    );
}
