import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Clock, ShieldCheck, Zap } from 'lucide-react';
import UploadDropzone from '../components/UploadDropzone';
import client from '../api/client';
import toast from 'react-hot-toast';

export default function UploadPage() {
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleUpload = async (file) => {
        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name);

        try {
            const res = await client.post('/documents/upload/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                },
            });

            if (res.data.success) {
                const docId = res.data.data.id;
                toast.success('Upload complete! Now processing...');

                // Polling for processing status
                let retryCount = 0;
                const maxRetries = 150; // 150 * 2s = 5 minutes

                const pollInterval = setInterval(async () => {
                    retryCount++;
                    
                    if (retryCount >= maxRetries) {
                        clearInterval(pollInterval);
                        toast.error('Processing is taking longer than expected. Please check your library later.');
                        setUploading(false);
                        return;
                    }

                    try {
                        const statusRes = await client.get(`/documents/${docId}/status/`);
                        const status = statusRes.data.data?.status;
                        const errorMessage = statusRes.data.data?.error_message;

                        if (status === 'ready') {
                            clearInterval(pollInterval);
                            toast.success('Document ready for review!');
                            navigate(`/document/${docId}/summary`);
                        } else if (status === 'failed') {
                            clearInterval(pollInterval);
                            toast.error(errorMessage || 'Document processing failed.');
                            setUploading(false);
                        }
                    } catch (err) {
                        console.error('Polling error:', err);
                        // If we get a 403 or 401, stop polling to avoid loops
                        if (err.response?.status === 403 || err.response?.status === 401) {
                            clearInterval(pollInterval);
                            toast.error('Authentication session expired. Please refresh.');
                            setUploading(false);
                        }
                    }
                }, 2000);
            }
        } catch (err) {
            console.error('Upload failed:', err);
            toast.error(err.response?.data?.error || 'Failed to upload document');
            setUploading(false);
        }
    };

    return (
        <div className="pt-24 pb-16 px-6 min-h-screen bg-[#fafafa]">
            <div className="max-w-xl mx-auto">
                {/* Back Link */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 mb-10 transition-colors animate-fade-in"
                >
                    <ArrowLeft size={16} />
                    Back to library
                </button>

                {/* Header */}
                <div className="mb-12 animate-fade-in">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Add New Document</h1>
                    <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                        Upload your document and let our AI extract insights for you in seconds.
                    </p>
                </div>

                {/* Upload Zone */}
                <div className="animate-slide-up">
                    <UploadDropzone
                        onUpload={handleUpload}
                        uploading={uploading}
                        uploadProgress={uploadProgress}
                    />
                </div>

                {/* Information Grid */}
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-8 animate-fade-in animation-delay-200">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center shrink-0 text-brand-600">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-1">Secure & Private</h3>
                            <p className="text-[13px] text-gray-400 leading-relaxed">
                                Your data is encrypted end-to-end and never used for training models.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center shrink-0 text-amber-500">
                            <Zap size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-1">Instant Insights</h3>
                            <p className="text-[13px] text-gray-400 leading-relaxed">
                                Get a high-level summary immediately after processing completes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
