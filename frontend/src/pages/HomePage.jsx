import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

export default function HomePage() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    // State for managing the budget
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [budgetValue, setBudgetValue] = useState('');
    const [savedBudget, setSavedBudget] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleLogout = () => {
        logout();
    };

    const handleRegisterUser = () => {
        navigate('/register');
    };

    const getCurrentMonthYear = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    };

    // 1. Fetch budget on page load
    useEffect(() => {
        const fetchBudget = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const response = await fetch(
                    `http://localhost:8081/api/budgets/current?monthYear=${getCurrentMonthYear()}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (response.status === 401) {
                    handleLogout(); // Now safe to call
                    return;
                }

                if (response.ok) {
                    const data = await response.json();
                    setSavedBudget(data.amount);
                    setBudgetValue(data.amount); // Pre-fill input
                }
            } catch (err) {
                console.error('Failed to fetch budget:', err);
            }
        };

        fetchBudget();
    }, []);

    const handleBudgetSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        if (!budgetValue) {
            alert('Please enter a budget amount!');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`http://localhost:8081/api/budgets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: parseFloat(budgetValue),
                    monthYear: getCurrentMonthYear()
                })
            });

            if (response.status === 401) {
                alert('Session expired. Please log in again.');
                handleLogout();
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to save budget');
            }

            const data = await response.json();
            setSavedBudget(data.amount);
            setIsEditingBudget(false);
        } catch (err) {
            console.error('Error saving budget:', err);
            alert('Failed to save budget. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div>
                <h2>Hello, {user?.name || 'User'}!</h2>
                <p>Welcome to your home page.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                {/* 1. Display Budget Message if set */}
                {savedBudget !== null && !isEditingBudget ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        margin: '6px 0'
                    }}>
                        <p style={{ fontSize: '18px', fontWeight: '600', color: '#16a34a', margin: 0 }}>
                            Your budget is ${savedBudget ? parseFloat(savedBudget).toFixed(2) : '0.00'}
                        </p>

                        <button
                            onClick={() => setIsEditingBudget(true)}
                            style={{
                                padding: '4px 4px',
                                cursor: 'pointer',
                                backgroundColor: 'transparent',
                                border: '1px solid #16a34a',
                                color: '#16a34a',
                                borderRadius: '4px',
                                fontSize: '12px'
                            }}
                        >
                            Edit Budget
                        </button>
                    </div>

                /* 2. Display Form when editing */
                ) : isEditingBudget ? (
                    <form
                        onSubmit={handleBudgetSubmit}
                        style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '340px' }}
                    >
                        <input
                            type="number"
                            step="0.01"
                            value={budgetValue}
                            onChange={(e) => setBudgetValue(e.target.value)}
                            placeholder="Enter budget amount"
                            required
                            disabled={loading}
                            style={{
                                flex: 1,
                                minWidth: '0',
                                padding: '8px 12px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '8px 12px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                backgroundColor: '#16a34a',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontWeight: '600',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Saving...' : 'Submit'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditingBudget(false)}
                            disabled={loading}
                            style={{
                                padding: '8px 10px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                backgroundColor: '#f3f4f6',
                                color: '#4b5563',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontWeight: '500'
                            }}
                        >
                        X
                        </button>
                    </form>

                /* 3. Initial "+ Add Budget" Button */
                ) : (
                    <button
                        onClick={() => setIsEditingBudget(true)}
                        style={{
                            padding: '10px 20px',
                            cursor: 'pointer',
                            backgroundColor: '#16a34a',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: '600',
                            width: '100%',
                            maxWidth: '260px'
                        }}
                    >
                        + Add Budget
                    </button>
                )}
            </div>

            {/* Bottom Buttons */}
            <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'center', marginTop: '10px'  }}>
                <button
                    onClick={handleRegisterUser}
                    style={{
                        padding: '8px 16px',
                        cursor: 'pointer',
                        backgroundColor: '#0066cc',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: '500'
                    }}
                >
                    Register User
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