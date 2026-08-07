import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const getMonthOptions = () => {
    const options = [];
    const now = new Date();

    // From +3 months down to -8 months
    for (let offset = 3; offset >= -8; offset--) {
        const date = new Date(now.getFullYear(), now.getMonth() + offset, 1);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const value = `${year}-${month}`;

        // Formats as "Aug 2026"
        const label = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });

        options.push({ value, label });
    }

    return options;
};

export default function HomePage() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const getCurrentMonthYear = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    };

    // State for managing the budget
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [budgetValue, setBudgetValue] = useState('');
    const [savedBudget, setSavedBudget] = useState(null);
    const [amtSpent, setAmtSpent] = useState('0');
    const [loading, setLoading] = useState(false);

    // Dynamic calculations
    const budget = parseFloat(savedBudget) || 0;
    const spent = parseFloat(amtSpent) || 0;
    const remaining = budget - spent;
    const isOverBudget = remaining < 0;

    const handleLogout = () => {
        logout();
    };

    const handleRegisterUser = () => {
        navigate('/register');
    };

    // Fetch budget on page load
    useEffect(() => {
        const fetchBudget = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            setIsEditingBudget(false);
            setSavedBudget(null);
            setBudgetValue('');
            setLoading(true);

            try {
                const response = await fetch(
                    `http://localhost:8081/api/budgets/current?monthYear=${selectedMonth}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (response.status === 401) {
                    handleLogout();
                    return;
                }

                if (response.ok) {
                    const data = await response.json();
                    setSavedBudget(data.amount);
                    setBudgetValue(data.amount);
                }
            } catch (err) {
                console.error('Failed to fetch budget:', err);
                setSavedBudget(null);
                setBudgetValue('');
            } finally {
                setLoading(false);
            }
        };

        fetchBudget();
    }, [selectedMonth]);

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
                    monthYear: selectedMonth
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
        <div className="home-container">
            <div className="home-header">
                <div>
                    <h2>Hello, {user?.name || user?.username || 'User'}!</h2>
                    <p>Welcome to your home page.</p>
                </div>
                <div className="home-actions">
                    <button onClick={handleRegisterUser} className="home-btn-primary">
                        Register User
                    </button>

                    <button onClick={handleLogout} className="home-btn-secondary">
                        Log Out
                    </button>
                </div>
            </div>

            <div className="home-savings-section">
                <div className="home-section-top">
                    <div className="home-budget-controls">
                        {/* 1. Show Form when editing */}
                        {isEditingBudget ? (
                            <form onSubmit={handleBudgetSubmit} className="home-budget-form">
                                <label htmlFor="budget-input" className="home-budget-label">
                                    Edit budget:
                                </label>
                                <input
                                    id="budget-input"
                                    type="number"
                                    step="0.01"
                                    value={budgetValue}
                                    onChange={(e) => setBudgetValue(e.target.value)}
                                    placeholder="Enter budget amount"
                                    required
                                    disabled={loading}
                                    className="home-budget-input"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="home-btn-success"
                                >
                                    {loading ? 'Saving...' : 'Submit'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setBudgetValue(savedBudget || '');
                                        setIsEditingBudget(false);
                                    }}
                                    disabled={loading}
                                    className="home-btn-cancel"
                                >
                                    ✕
                                </button>
                            </form>
                        ) : (
                            /* 2. Show Budget Info when NOT editing */
                            <>
                                {savedBudget !== null ? (
                                    <div className="home-budget-display">
                                        <p className="home-budget-amount">
                                            Your budget is ${parseFloat(savedBudget).toFixed(2)}
                                        </p>

                                        <button
                                            onClick={() => {
                                                setBudgetValue(savedBudget);
                                                setIsEditingBudget(true);
                                            }}
                                            className="home-btn-edit"
                                        >
                                            Edit Budget
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsEditingBudget(true)}
                                        className="home-btn-add"
                                    >
                                        + Add Budget
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    {/* Date Filter Dropdown */}
                    <div className="home-date-filter">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="home-date-select"
                        >
                            {getMonthOptions().map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <p className="home-spent-text">
                    You have spent ${spent.toFixed(2)}.
                </p>

                {savedBudget !== null && (
                    <p className={`home-summary-text ${isOverBudget ? 'danger' : 'success'}`}>
                        {isOverBudget
                            ? `You overshot your spending by $${Math.abs(remaining).toFixed(2)}`
                            : `You have $${remaining.toFixed(2)} left to spend.`
                        }
                    </p>
                )}
            </div>
        </div>
    );
}