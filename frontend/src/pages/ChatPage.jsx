import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Info, MoreVertical, FileText } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';

export default function ChatPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div className="h-screen flex flex-col bg-white">
            {/* Dynamic Header */}
            <header className="h-[60px] border-b border-gray-100 flex items-center justify-between px-6 shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-10 transition-on-layout">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/document/${id}/summary`)}
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="h-6 w-px bg-gray-100 hidden sm:block"></div>

                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate(`/document/${id}/summary`)}>
                        <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600 transition-on-layout">
                            <FileText size={16} />
                        </div>
                        <span className="text-sm font-bold text-gray-900 transition-on-layout">Chat Analytics</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                        <Info size={20} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </header>

            {/* Main Chat Area */}
            <main className="flex-1 overflow-hidden relative">
                <div className="h-full max-w-4xl mx-auto border-x border-gray-50 bg-[#fafafa]/30">
                    <ChatWindow documentId={id} />
                </div>
            </main>
        </div>
    );
}
