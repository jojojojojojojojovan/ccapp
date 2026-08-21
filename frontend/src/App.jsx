import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext';

import Home from './pages/Home';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

import ProtectedRoute from './components/ProtectedRoute';

function DefaultRedirect() {
    const { isAuthenticated } = useAuth();
    return <Navigate to={isAuthenticated ? "/home" : "/login"} replace />;
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    <Route path="/home" element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                        }
                    />

                    <Route path="/register" element={
                        <ProtectedRoute adminOnly>
                            <RegisterPage />
                        </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<DefaultRedirect />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

