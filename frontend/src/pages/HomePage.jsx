import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function HomePage() {
    const navigate = useNavigate();
        const userEmail = localStorage.getItem('userEmail');

        const handleLogout = () => {
            localStorage.clear(); // Clear token and user info
            navigate('/login');
        };

    return (
        <div className="login-container">
            <h2>Hello, {userEmail || 'User'}!</h2>
            <p>Welcome to your home page.</p>
            <button
                onClick={handleLogout}
                style={{ marginTop: '20px', padding: '8px 16px', cursor: 'pointer' }}
            >
                Log Out
            </button>
        </div>
    );
}
