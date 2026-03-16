import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, LogOut, Menu, X, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showDropdown, setShowDropdown] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    const navLinks = [
        { label: 'Features', href: '/#features' },
        { label: 'How it works', href: '/#how-it-works' },
        { label: 'Pricing', href: '/#pricing' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
            <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <img src="/logo.png" alt="DocuMind-AI Logo" className="w-8 h-8 rounded-lg object-contain transition-transform group-hover:scale-110" />
                    <span className="text-lg font-bold tracking-tight text-gray-900">DocuMind-AI</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {!user ? (
                        <>
                            {navLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </>
                    ) : (
                        <>
                            <Link
                                to="/dashboard"
                                className={`text-sm font-medium transition-colors ${location.pathname === '/dashboard' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/upload"
                                className={`text-sm font-medium transition-colors ${location.pathname === '/upload' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                Upload
                            </Link>
                        </>
                    )}
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-4">
                    {!user ? (
                        <Link to="/login" className="btn-primary py-2 px-4 text-xs font-semibold">
                            Get Started
                        </Link>
                    ) : (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-100" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                                        <User size={16} />
                                    </div>
                                )}
                            </button>

                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-100 shadow-xl py-2 animate-fade-in origin-top-right">
                                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{user.displayName || 'User'}</p>
                                        <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-b border-gray-100 py-4 px-6 space-y-4 animate-fade-in">
                    {!user ? (
                        <>
                            {navLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block text-base font-medium text-gray-600 py-2 hover:text-brand-600"
                                >
                                    {link.label}
                                </a>
                            ))}
                            <div className="pt-2">
                                <Link
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block w-full btn-primary text-center"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/dashboard"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-base font-medium text-gray-600 py-2"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/upload"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-base font-medium text-gray-600 py-2"
                            >
                                Upload
                            </Link>
                            <hr className="border-gray-50 my-2" />
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-base font-medium text-red-600 py-2"
                            >
                                <LogOut size={20} />
                                Sign out
                            </button>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
