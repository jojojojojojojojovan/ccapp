export default function Header({ user, onRegister, onLogout }) {
    return (
        <div className="home-header">
            <div>
                <h2>Hello, {user?.name || user?.username || 'User'}!</h2>
                <p>Welcome to your home page.</p>
            </div>
            <div className="home-actions">
                <button onClick={onRegister} className="home-btn-primary">Register User</button>
                <button onClick={onLogout} className="home-btn-secondary">Log Out</button>
            </div>
        </div>
    );
}