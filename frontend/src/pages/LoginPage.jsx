import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

import client from '../api/client';
import Logo from '../components/Logo';

export default function LoginPage() {
    const { user, loginWithGoogle, loginMock } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    const handleGoogleLogin = async () => {
        try {
            const loginResult = await loginWithGoogle();
            
            // Sync with backend to ensure user record exists before dashboard loads
            if (loginResult && loginResult.user) {
                const token = await loginResult.user.getIdToken();
                await client.post('/auth/verify/', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            toast.success('Successfully logged in!');
            navigate('/dashboard');
        } catch (err) {
            console.error('Login failed:', err);
            toast.error('Login failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-white">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-brand-50 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 bg-brand-50 rounded-full blur-3xl opacity-50"></div>

            <div className="w-full max-w-sm relative z-10 animate-slide-up">
                {/* Back Link */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 mb-12 transition-colors transition-on-layout"
                >
                    <ArrowLeft size={16} />
                    Back to home
                </button>

                {/* Branding */}
                <div className="mb-10 text-center sm:text-left">
                    <Logo size="lg" className="mb-6 mx-auto sm:mx-0" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
                    <p className="text-gray-500 leading-relaxed">
                        Ready to dive back into your documents? Sign in to get started.
                    </p>
                </div>

                {/* Login Button */}
                <div className="space-y-4">
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 shadow-sm"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                        Continue with Google
                    </button>

                    {/* Continue as Guest */}
                    <button
                        onClick={() => {
                            loginMock();
                            toast.success('Browsing as Guest');
                            navigate('/dashboard');
                        }}
                        className="w-full flex items-center justify-center gap-3 bg-brand-50 text-brand-700 border border-brand-200 py-3 px-4 rounded-xl font-semibold hover:bg-brand-100 transition-all duration-150 shadow-sm mt-4"
                    >
                        <FileText size={20} className="text-brand-600" />
                        Continue as Guest
                    </button>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center sm:text-left text-xs text-gray-400 leading-relaxed border-t border-gray-50 pt-8">
                    By signing in, you agree to our <a href="#" className="underline hover:text-gray-600">Terms of Service</a> and <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
                </p>
            </div>
        </div>
    );
}
