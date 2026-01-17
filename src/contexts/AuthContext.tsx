import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';

interface User {
    _id: string;
    username: string;
    email: string;
    phone?: string;
}

interface AuthResult {
    success: boolean;
    error?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<AuthResult>;
    signup: (username: string, email: string, password: string, phone: string) => Promise<AuthResult>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing auth on mount
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<AuthResult> => {
        try {
            const response = await api.post('/auth/login', { email, password });
            // Backend returns { success, data: { token, _id, username, email, ... }, message }
            const { token, ...userData } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
    };

    const signup = async (username: string, email: string, password: string, phone: string): Promise<AuthResult> => {
        try {
            const response = await api.post('/auth/register', { username, email, password, phone });
            // Backend returns { success, data: { token, _id, username, email, ... }, message }
            const { token, ...userData } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.response?.data?.message || 'Signup failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                loading,
                login,
                signup,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
