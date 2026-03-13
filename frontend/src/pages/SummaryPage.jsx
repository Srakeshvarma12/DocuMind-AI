import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Download, Share2 } from 'lucide-react';
import client from '../api/client';
import SummaryCard from '../components/SummaryCard';
import { CardSkeleton } from '../components/SkeletonLoader';
import toast from 'react-hot-toast';

export default function SummaryPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                setLoading(true);
                const res = await client.get(`/documents/${id}/summary/`);
                if (res.data.success) {
                    setSummary(res.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch summary:', err);
                toast.error(err.response?.data?.error || 'Failed to load summary');
                if (err.response?.status === 404) {
                    navigate('/dashboard');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [id, navigate]);

    return (
        <div className="pt-24 pb-16 px-6 bg-[#fafafa] min-h-screen">
            <div className="max-w-4xl mx-auto">
                {/* Navigation & Actions */}
                <div className="flex items-center justify-between mb-10 animate-fade-in">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 transition-colors py-2"
                    >
                        <ArrowLeft size={16} />
                        Library
                    </button>

                    <div className="flex items-center gap-3">
                        <button className="btn-secondary p-2.5 sm:px-4 sm:py-2 flex items-center gap-2" title="Share">
                            <Share2 size={16} />
                            <span className="hidden sm:inline">Share</span>
                        </button>
                        <Link to={`/document/${id}/chat`} className="btn-primary flex items-center gap-2">
                            <MessageSquare size={16} />
                            Start Chat
                        </Link>
                    </div>
                </div>

                {/* Title Section */}
                <div className="mb-12 animate-fade-in">
                    {loading ? (
                        <div className="h-10 bg-gray-100 rounded-xl animate-pulse w-3/4"></div>
                    ) : (
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">
                            {summary?.title}
                        </h1>
                    )}
                </div>

                {/* Content Section */}
                {loading ? (
                    <div className="space-y-12">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse"></div>)}
                        </div>
                        <div className="bg-white rounded-3xl border border-gray-100 p-12 h-[400px] animate-pulse"></div>
                    </div>
                ) : (
                    <SummaryCard summary={summary} />
                )}
            </div>
        </div>
    );
}
