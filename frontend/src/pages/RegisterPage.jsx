import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'
import '../App.css'

export default function RegisterPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    const handleGoHome = () => {
        navigate('/home');
    };

    return (
        <div className="login-container">
            <h2>Hello!</h2>
            <p>Welcome to the register page.</p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'center' }}>
                <button
                    onClick={handleGoHome}
                    style={{
                        padding: '8px 16px',
                        cursor: 'pointer',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: '500'
                    }}
                >
                    Back
                </button>

                <button
                    onClick={handleLogout}
                    style={{
                        padding: '8px 16px',
                        cursor: 'pointer',
                        backgroundColor: 'transparent',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}
                >
                    Log Out
                </button>
            </div>
        </div>
    );
}