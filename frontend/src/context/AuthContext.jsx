import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Check localStorage when the app first loads
    useEffect(() => {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('userEmail');
        const role = localStorage.getItem('userRole');

        if (token && email) {
          setUser({ token, email, role });
        }
        setLoading(false);
    }, []);

    // Login function
    const login = (userData) => {
        localStorage.setItem('token', userData.token);
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userRole', userData.role);
        setUser({
            token: userData.token,
            email: userData.email,
            role: userData.role,
        });
        navigate('/home');
    };

    // Logout function
    const logout = () => {
        localStorage.clear();
        setUser(null);
        navigate('/login');
    };

    const value = {
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

// Custom hook for easy consumption across components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};