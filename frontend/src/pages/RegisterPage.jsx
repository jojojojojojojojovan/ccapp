import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'

import Header from '../components/Header';
import '../App.css'

export default function RegisterPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleGoHome = () => {
        navigate('/home');
    };

    return (
        <div className="home-container">
            <Header
              user={user}
              button={
                <button onClick={handleGoHome} className="home-btn-primary">
                  Home
                </button>
              }
              onLogout={logout}
            />

            <p>Welcome to the register page.</p>
        </div>
    );
}