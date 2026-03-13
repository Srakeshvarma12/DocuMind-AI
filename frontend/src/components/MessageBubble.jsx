import { User, Sparkles, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function MessageBubble({ message }) {
    const isAI = message.role === 'assistant';

    return (
        <div className={`flex w-full animate-slide-up ${isAI ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex gap-4 max-w-[85%] ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${isAI
                        ? 'bg-brand-600 text-white border-brand-500'
                        : 'bg-white text-gray-400 border-gray-100'
                    }`}>
                    {isAI ? <Sparkles size={18} /> : <User size={18} />}
                </div>

                {/* Content */}
                <div className={`flex flex-col gap-3 py-1 ${isAI ? 'items-start' : 'items-end'}`}>
                    <div className={`px-5 py-4 rounded-2xl text-[15px] leading-relaxed shadow-sm transition-all duration-200 ${isAI
                            ? 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm'
                            : 'bg-brand-600 text-white rounded-tr-sm shadow-md shadow-brand-900/10'
                        }`}>
                        <article className={`prose prose-sm max-w-none ${isAI ? 'text-gray-700' : 'text-white prose-invert'}`}>
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                        </article>
                    </div>

                    {/* Source Citations */}
                    {isAI && message.source_pages?.length > 0 && (
                        <div className="flex flex-wrap gap-2 animate-fade-in animation-delay-200">
                            {message.source_pages.map((page, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 border border-brand-100 text-brand-700 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                                >
                                    <BookOpen size={10} />
                                    <span>Page {page}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function TypingIndicator() {
    return (
        <div className="flex justify-start w-full animate-fade-in">
            <div className="flex gap-4 max-w-[85%]">
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white border border-brand-500 flex items-center justify-center shrink-0 shadow-sm">
                    <Sparkles size={18} className="animate-pulse" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-2">
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">AI is analyzing</span>
                </div>
            </div>
        </div>
    );
}
