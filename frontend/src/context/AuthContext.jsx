import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for mock user in session storage
        const mockData = sessionStorage.getItem('mockUser');
        if (mockData) {
            setUser(JSON.parse(mockData));
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const loginWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
    const loginMock = () => {
        const mockUser = {
            uid: 'guest-user-123',
            email: 'guest@documind.ai',
            displayName: 'Guest User',
            getIdToken: async () => 'mock-token-admin'
        };
        setUser(mockUser);
        sessionStorage.setItem('mockUser', JSON.stringify(mockUser));
    };

    const logout = () => {
        sessionStorage.removeItem('mockUser');
        signOut(auth);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginMock, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
