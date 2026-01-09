import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setTokenState] = useState(() => localStorage.getItem('token'));

    // Memoized user data derived from token
    const user = useMemo(() => {
        if (!token) return null;
        try {
            const decoded = jwtDecode(token);
            return decoded.user || null;
        } catch (e) {
            return null;
        }
    }, [token]);

    // Login function
    const login = useCallback((newToken) => {
        localStorage.setItem('token', newToken);
        setTokenState(newToken);
    }, []);

    // Logout function
    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setTokenState(null);
    }, []);

    // Check if user has specific role
    const hasRole = useCallback((role) => {
        return user?.role === role;
    }, [user]);

    const value = useMemo(() => ({
        token,
        user,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
        isStudent: user?.role === 'student',
        login,
        logout,
        hasRole
    }), [token, user, login, logout, hasRole]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for using auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
