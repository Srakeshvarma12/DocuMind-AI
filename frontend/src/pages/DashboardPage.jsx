import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, Plus, Search, Filter } from 'lucide-react';
import client from '../api/client';
import DocumentCard from '../components/DocumentCard';
import { CardSkeleton } from '../components/SkeletonLoader';
import toast from 'react-hot-toast';

export default function DashboardPage() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchDocuments = useCallback(async () => {
        try {
            setLoading(true);
            const res = await client.get('/documents/');
            if (res.data.success) {
                setDocuments(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch documents:', err);
            toast.error('Failed to load documents');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleDelete = async (docId) => {
        try {
            await client.delete(`/documents/${docId}/`);
            setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
            toast.success('Document deleted');
        } catch (err) {
            toast.error('Failed to delete document');
        }
    };

    const filteredDocs = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="pt-24 pb-16 px-6 bg-[#fafafa] min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Documents</h1>
                        <p className="text-gray-500 mt-2 text-sm leading-relaxed max-w-md">
                            Your personal library of documents. Add new files to summarize or chat with your content.
                        </p>
                    </div>
                    <Link to="/upload" className="btn-primary flex items-center gap-2 self-start md:self-auto">
                        <Plus size={18} />
                        Upload New
                    </Link>
                </div>

                {/* Search & Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 animate-fade-in">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-premium pl-10 w-full"
                        />
                    </div>
                    <button className="btn-secondary flex items-center gap-2 whitespace-nowrap w-full sm:w-auto justify-center">
                        <Filter size={16} />
                        Filter
                    </button>
                </div>

                {/* Content Section */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <CardSkeleton key={i} />
                        ))}
                    </div>
                ) : filteredDocs.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-20 text-center animate-fade-in shadow-sm">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 mx-auto mb-6">
                            <FileText size={28} className="text-gray-300" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">
                            {searchTerm ? 'No documents match your search' : 'Your library is empty'}
                        </h2>
                        <p className="text-gray-500 mb-10 max-w-sm mx-auto leading-relaxed">
                            {searchTerm
                                ? "Try searching for something else or clear the search to see all your files."
                                : "Securely upload your first document to unlock AI-powered summaries and deep content chatting."
                            }
                        </p>
                        {!searchTerm && (
                            <Link to="/upload" className="btn-primary inline-flex items-center gap-2">
                                <Upload size={18} />
                                Upload File
                            </Link>
                        )}
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="btn-secondary"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredDocs.map((doc, i) => (
                            <div key={doc.id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                                <DocumentCard document={doc} onDelete={handleDelete} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
