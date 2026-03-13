import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, Sparkles, MessageSquare, Info, AlertCircle } from 'lucide-react';
import MessageBubble, { TypingIndicator } from './MessageBubble';
import SkeletonLoader from './SkeletonLoader';
import { chatApi } from '../utils/api';
import toast from 'react-hot-toast';

const ChatWindow = ({ documentId }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await chatApi.getHistory(documentId);
                if (response.data.success) {
                    setMessages(response.data.data.messages || []);
                }
            } catch (err) {
                console.error('Failed to load chat history:', err);
                toast.error('Failed to load chat history');
            } finally {
                setIsInitialLoad(false);
            }
        };
        if (documentId) fetchHistory();
    }, [documentId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chatApi.sendMessage(documentId, input);
            if (response.data.success) {
                setMessages(prev => [...prev, response.data.data.ai_message]);
            } else {
                toast.error(response.data.error || 'Failed to get answer');
                // Remove the last message on failure to allow retry
                setMessages(prev => prev.slice(0, -1));
                setInput(input);
            }
        } catch (err) {
            toast.error('AI Service is temporarily busy. Please try again.');
            console.error(err);
            setMessages(prev => prev.slice(0, -1));
            setInput(input);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = async () => {
        if (!window.confirm('Are you sure you want to clear this entire conversation?')) return;
        try {
            await chatApi.clearHistory(documentId);
            setMessages([]);
            toast.success('Chat history cleared');
        } catch (err) {
            toast.error('Failed to clear history');
        }
    };

    if (isInitialLoad) {
        return (
            <div className="flex flex-col h-full bg-white p-6 space-y-6">
                <SkeletonLoader lines={10} />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header info (optional/minimal) */}
            <div className="px-6 py-3 border-b border-gray-50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Chat Assistant</span>
                </div>
                <button
                    onClick={handleClear}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                    title="Clear history"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-12 animate-fade-in">
                        <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-6 mx-auto">
                            <MessageSquare size={32} />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Start a conversation</h4>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-[280px]">
                            Ask questions, request summaries, or clarify details about this document.
                        </p>
                        <div className="mt-8 grid grid-cols-1 gap-2 w-full max-w-[320px]">
                            <button
                                onClick={() => setInput("What are the key points in this document?")}
                                className="px-4 py-2.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
                            >
                                "What are the key points?"
                            </button>
                            <button
                                onClick={() => setInput("Summarize this document for me.")}
                                className="px-4 py-2.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
                            >
                                "Summarize this for me"
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 min-h-full flex flex-col">
                        <AnimatePresence initial={false}>
                            {messages.map((msg, i) => (
                                <MessageBubble key={i} message={msg} />
                            ))}
                        </AnimatePresence>
                        {isLoading && <TypingIndicator />}
                        <div className="h-4 shrink-0" /> {/* Bottom spacing */}
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-gray-50 bg-white shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.03)]">
                <form
                    onSubmit={handleSend}
                    className="relative max-w-3xl mx-auto group"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your question..."
                        className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4.5 pl-6 pr-14 text-[15px] focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/5 transition-all placeholder:text-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-20 disabled:hover:bg-brand-600 rounded-xl transition-all shadow-md shadow-brand-900/10 flex items-center justify-center"
                    >
                        <Send size={18} />
                    </button>
                </form>
                <p className="text-[10px] text-center text-gray-400 mt-4 font-medium">
                    DocuMind AI can make mistakes. Verify important information.
                </p>
            </div>
        </div>
    );
};

export default ChatWindow;
