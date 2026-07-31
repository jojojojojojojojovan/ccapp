import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate  = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Please fill in all fields')
            return;
        }
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8081/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const text = await response.text();
            // 2. Parse only if content exists, otherwise default to empty object
            const data = text ? JSON.parse(text) : {};

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Invalid email or password.');
                }
                throw new Error(data.message || `Server error (${response.status})`);
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('userEmail', data.email);
            localStorage.setItem('userRole', data.role);

            navigate('/home');
        } catch (err) {
            setError(err.message || 'Server error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2 className="login-title">Log In</h2>
            {error && <p className="login-error">{error}</p>}

            <form onSubmit={handleSubmit} className="login-form">
                <div className="input-group">
                    <label htmlFor="email">Email address</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="test@example.com"
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button type="submit" className="login-button" disabled={loading}>
                    {loading ? 'Logging in...' : 'Sign In'}
                </button>
            </form>
        </div>
    );
}
