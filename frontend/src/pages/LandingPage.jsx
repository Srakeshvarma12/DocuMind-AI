import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, Zap, Shield, MessageSquare, ArrowRight, Check } from 'lucide-react';

export default function LandingPage() {
    const { user } = useAuth();

    const features = [
        {
            title: 'Instant Summaries',
            description: 'Get a concise summary of any document in seconds, highlighting the most important points.',
            icon: <Zap className="text-brand-600" size={24} />
        },
        {
            title: 'Contextual Chat',
            description: 'Ask questions and get answers directly from your document with precise source page references.',
            icon: <MessageSquare className="text-brand-600" size={24} />
        },
        {
            title: 'Privacy First',
            description: 'Your documents are processed securely and never used for training models without permission.',
            icon: <Shield className="text-brand-600" size={24} />
        }
    ];

    const steps = [
        { title: 'Upload', description: 'Drag and drop your PDF, DOCX, or TXT file into the dashboard.' },
        { title: 'Process', description: 'Our AI analyzes and indexes the document for quick retrieval.' },
        { title: 'Understand', description: 'Read the summary or start a conversation to find exactly what you need.' }
    ];

    return (
        <div className="bg-[#fafafa] min-h-screen">
            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center animate-slide-up">

                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                        Upload any document. <br />
                        <span className="text-brand-600">Understand everything</span> instantly.
                    </h1>
                    <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                        DocuMind uses advanced AI to help you summarize, analyze, and chat with your documents so you can save hours of reading and find answers faster.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to={user ? "/upload" : "/login"} className="btn-primary py-3 px-8 text-base w-full sm:w-auto flex items-center justify-center gap-2 group">
                            Get Started Free
                            <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a href="#how-it-works" className="btn-secondary py-3 px-8 text-base w-full sm:w-auto flex items-center justify-center">
                            How it works
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white border-y border-gray-100 overflow-hidden">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
                        <p className="text-gray-500">Everything you need to master your documents.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <div key={i} className="card-premium animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Simple Workflow</h2>
                        <p className="text-gray-500">Go from file to insight in three simple steps.</p>
                    </div>
                    <div className="relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gray-100 z-0"></div>
                        <div className="grid md:grid-cols-3 gap-12 relative z-10">
                            {steps.map((step, i) => (
                                <div key={i} className="text-center">
                                    <div className="w-12 h-12 bg-brand-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-6 shadow-lg shadow-brand-500/20">
                                        {i + 1}
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                                    <p className="text-gray-500 text-sm">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>



            {/* Footer */}
            <footer className="py-12 border-t border-gray-100 text-center">
                <div className="flex items-center justify-center gap-2 mb-6 opacity-40">
                    <FileText size={20} />
                    <span className="font-bold">DocuMind</span>
                </div>
                <p className="text-xs text-gray-400">© 2026 DocuMind. All rights reserved.</p>
            </footer>
        </div>
    );
}
