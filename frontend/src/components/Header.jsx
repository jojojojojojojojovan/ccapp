export default function Header({ user, button, onLogout }) {
    return (
        <div className="home-header">
            <div>
                <h2>Hello, {user?.name || user?.username || 'User'}!</h2>
            </div>
            <div className="home-actions">
                {button}
                <button onClick={onLogout} className="home-btn-secondary">Log Out</button>
            </div>
        </div>
    );
}