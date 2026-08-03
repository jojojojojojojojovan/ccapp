import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

export default function HomePage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // State for managing the budget
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [budgetValue, setBudgetValue] = useState('');
    const [savedBudget, setSavedBudget] = useState(null);

    const handleLogout = () => {
        logout();
    };

    const handleRegisterUser = () => {
        navigate('/register');
    };

    const handleBudgetSubmit = (e) => {
        e.preventDefault();
        if (budgetValue.trim() !== '') {
            setSavedBudget(budgetValue);
            setIsEditingBudget(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Hello, {user?.email || 'User'}!</h2>
            <p>Welcome to your home page.</p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '20px' }}>

                {/* 1. Display Budget Message if budget is set and not editing */}
                {savedBudget !== null && !isEditingBudget ? (
                    <div style={{ textAlign: 'center', margin: '6px 0' }}>
                        <p style={{ fontSize: '18px', fontWeight: '600', color: '#16a34a', margin: '0 0 6px 0' }}>
                            Your budget is ${savedBudget}
                        </p>
                        <button
                            onClick={() => setIsEditingBudget(true)}
                            style={{
                                padding: '4px 10px',
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

                /* 2. Display Form when Add/Edit Budget is clicked */
                ) : isEditingBudget ? (
                    <form
                        onSubmit={handleBudgetSubmit}
                        style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '280px' }}
                    >
                        <input
                            type="number"
                            value={budgetValue}
                            onChange={(e) => setBudgetValue(e.target.value)}
                            placeholder="Enter budget amount"
                            required
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                padding: '8px 16px',
                                cursor: 'pointer',
                                backgroundColor: '#16a34a',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontWeight: '600'
                            }}
                        >
                            Submit
                        </button>
                    </form>

                /* 3. Initial state: "+ Add Budget" Button */
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

                {/* Bottom Row: Register User & Log Out */}
                <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'center' }}>
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
        </div>
    );
}