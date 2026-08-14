import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const getMonthOptions = () => {
    const options = [];
    const now = new Date();

    for (let offset = 3; offset >= -8; offset--) {
        const date = new Date(now.getFullYear(), now.getMonth() + offset, 1);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const value = `${year}-${month}`;
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

    // Accounts State
    const [accounts, setAccounts] = useState([]);
    const [isAddingAccount, setIsAddingAccount] = useState(false);
    const [editingAccountId, setEditingAccountId] = useState(null);
    const [accountForm, setAccountForm] = useState({
        name: '',
        initial: '',
        amount: '',
        include: true
    });
    const [isTransferring, setIsTransferring] = useState(false);
    const [transferForm, setTransferForm] = useState({
        fromAccountId: null,
        toAccountId: '',
        amount: ''
    });

    // Dynamic Budget Calculations
    const budget = parseFloat(savedBudget) || 0;
    const spent = parseFloat(amtSpent) || 0;

    // Calculate net account change for included accounts (sum of: current amount - initial amount)
    const netAccountChange = accounts
        .filter(acc => acc.include)
        .reduce((sum, acc) => {
            const current = parseFloat(acc.amount) || 0;
            const initial = parseFloat(acc.initial) || 0;
            return sum + (current - initial);
        }, 0);

    // Total remaining available to spend
    const remaining = budget - spent + netAccountChange;
    const isOverBudget = remaining < 0;

    // Accounts Total Balance (Sum of current amounts of included accounts)
    const totalIncludedBalance = accounts
        .filter(acc => acc.include)
        .reduce((sum, acc) => sum + (parseFloat(acc.amount) || 0), 0);

    const handleLogout = () => {
        logout();
    };

    const handleRegisterUser = () => {
        navigate('/register');
    };

    // 🔄 Fetch Budget and Accounts on month change
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const fetchData = async () => {
            setLoading(true);
            setIsEditingBudget(false);
            setEditingAccountId(null);
            setIsAddingAccount(false);

            try {
                // 1. Fetch Budget
                const budgetRes = await fetch(
                    `http://localhost:8081/api/budgets/current?monthYear=${selectedMonth}`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );

                if (budgetRes.status === 401) {
                    handleLogout();
                    return;
                }

                if (budgetRes.ok) {
                    const data = await budgetRes.json();
                    setSavedBudget(data.amount);
                    setBudgetValue(data.amount);
                } else {
                    setSavedBudget(null);
                    setBudgetValue('');
                }

                // 2. Fetch Accounts
                const accountsRes = await fetch(
                    `http://localhost:8081/api/accounts?monthYear=${selectedMonth}`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );

                if (accountsRes.ok) {
                    const data = await accountsRes.json();
                    setAccounts(data);
                } else {
                    setAccounts([]);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedMonth]);

    // 💾 Save Budget
    const handleBudgetSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!budgetValue) return alert('Please enter a budget amount!');

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

            if (response.status === 401) return handleLogout();
            if (!response.ok) throw new Error('Failed to save budget');

            const data = await response.json();
            setSavedBudget(data.amount);
            setIsEditingBudget(false);
        } catch (err) {
            console.error('Error saving budget:', err);
            alert('Failed to save budget.');
        } finally {
            setLoading(false);
        }
    };

    // 🏦 Create or Edit Account
    const handleAccountSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        const payload = {
            name: accountForm.name,
            initial: parseFloat(accountForm.initial) || 0,
            amount: parseFloat(accountForm.amount) || 0,
            monthYear: selectedMonth,
            include: accountForm.include
        };

        try {
            const isEditing = editingAccountId !== null;
            const url = isEditing
                ? `http://localhost:8081/api/accounts/${editingAccountId}`
                : `http://localhost:8081/api/accounts`;

            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.status === 401) return handleLogout();
            if (!response.ok) throw new Error('Failed to save account');

            const savedAccount = await response.json();

            if (isEditing) {
                setAccounts(accounts.map(a => a.id === editingAccountId ? savedAccount : a));
            } else {
                setAccounts([...accounts, savedAccount]);
            }

            resetAccountForm();
        } catch (err) {
            console.error('Error saving account:', err);
            alert('Failed to save account.');
        }
    };

    // ☑️ Toggle Include Checkbox directly
    const handleToggleInclude = async (account) => {
        const token = localStorage.getItem('token');
        const updated = { ...account, include: !account.include, monthYear: selectedMonth };

        try {
            const response = await fetch(`http://localhost:8081/api/accounts/${account.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updated)
            });

            if (response.ok) {
                const data = await response.json();
                setAccounts(accounts.map(a => a.id === account.id ? data : a));
            }
        } catch (err) {
            console.error('Error updating account:', err);
        }
    };
    // Handle Transfer Submit (Updates both accounts)
    const handleTransferSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const transferAmt = parseFloat(transferForm.amount);

        if (!transferForm.toAccountId) {
            return alert('Please select a target account!');
        }
        if (isNaN(transferAmt) || transferAmt <= 0) {
            return alert('Please enter a valid transfer amount!');
        }

        const fromAccount = accounts.find(a => a.id === transferForm.fromAccountId);
        const toAccount = accounts.find(a => a.id === parseInt(transferForm.toAccountId));

        try {
            // 1. Deduct from source account
            const updatedFrom = {
                ...fromAccount,
                amount: parseFloat(fromAccount.amount) - transferAmt,
                monthYear: selectedMonth
            };

            // 2. Add to destination account
            const updatedTo = {
                ...toAccount,
                amount: parseFloat(toAccount.amount) + transferAmt,
                monthYear: selectedMonth
            };

            // Execute API calls
            const [resFrom, resTo] = await Promise.all([
                fetch(`http://localhost:8081/api/accounts/${fromAccount.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(updatedFrom)
                }),
                fetch(`http://localhost:8081/api/accounts/${toAccount.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(updatedTo)
                })
            ]);

            if (resFrom.ok && resTo.ok) {
                const newFrom = await resFrom.json();
                const newTo = await resTo.json();

                // Update UI State
                setAccounts(accounts.map(a => {
                    if (a.id === newFrom.id) return newFrom;
                    if (a.id === newTo.id) return newTo;
                    return a;
                }));

                setIsTransferring(false);
            } else {
                alert('Failed to complete transfer.');
            }
        } catch (err) {
            console.error('Transfer error:', err);
            alert('An error occurred during transfer.');
        }
    };

    // 🗑️ Delete Account
    const handleDeleteAccount = async (id) => {
        if (!window.confirm('Are you sure you want to delete this account?')) return;
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:8081/api/accounts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setAccounts(accounts.filter(a => a.id !== id));
            }
        } catch (err) {
            console.error('Error deleting account:', err);
        }
    };

    const startAccountTransfer = (acc) => {
        setTransferForm({
            fromAccountId: acc.id,
            toAccountId: '',
            amount: ''
        });
        setIsTransferring(true);
        setIsAddingAccount(false);
    };

    const startEditingAccount = (acc) => {
        setEditingAccountId(acc.id);
        setAccountForm({
            name: acc.name,
            initial: acc.initial,
            amount: acc.amount,
            include: acc.include
        });
        setIsAddingAccount(true);
        setIsTransferring(false)
    };

    const resetAccountForm = () => {
        setEditingAccountId(null);
        setAccountForm({ name: '', initial: '', amount: '', include: true });
        setIsAddingAccount(false);
    };
    const fromAccount = accounts.find(a => a.id === transferForm.fromAccountId);

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

            {/* Budget & Date Summary Section */}
            <div className="home-savings-section">
                <div className="home-section-top">
                    <div className="home-budget-controls">
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
                                <button type="submit" disabled={loading} className="home-btn-success">
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

                    {/* Date Dropdown */}
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

            {/* --- Accounts Section --- */}
            <div className="home-accounts-section">
                <div className="accounts-header">
                    <h3>Accounts Overview</h3>
                    <p className="accounts-total">
                        Total Balance (Included): <strong>${totalIncludedBalance.toFixed(2)}</strong>
                    </p>
                    {!isAddingAccount && !isTransferring &&  (
                        <button onClick={() => setIsAddingAccount(true)} className="home-btn-add">
                            + Add Account
                        </button>
                    )}
                </div>

                {/* Add/Edit Account Form */}
                {isAddingAccount && (
                    <form onSubmit={handleAccountSubmit} className="account-form">
                        <h4>{editingAccountId ? 'Edit Account' : 'New Account'}</h4>
                        <div className="form-row">
                            <input
                                type="text"
                                placeholder="Account Name (e.g. Checking)"
                                value={accountForm.name}
                                onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Initial Balance"
                                value={accountForm.initial}
                                onChange={(e) => setAccountForm({ ...accountForm, initial: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Current Amount"
                                value={accountForm.amount}
                                onChange={(e) => setAccountForm({ ...accountForm, amount: e.target.value })}
                                required
                            />
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={accountForm.include}
                                    onChange={(e) => setAccountForm({ ...accountForm, include: e.target.checked })}
                                />
                                Include
                            </label>
                            <button type="submit" className="home-btn-success">Save</button>
                            <button type="button" onClick={resetAccountForm} className="home-btn-cancel">Cancel</button>
                        </div>
                    </form>
                )}

                {/* Transfer Modal / Form */}
                {isTransferring && (
                    <form onSubmit={handleTransferSubmit} className="account-form transfer-form">
                        <h4>
                            Transfer from: <strong>{fromAccount?.name} (Bal: ${parseFloat(fromAccount?.amount || 0).toFixed(2)})</strong>
                        </h4>
                        <div className="form-row">
                            <select
                                value={transferForm.toAccountId}
                                onChange={(e) => setTransferForm({ ...transferForm, toAccountId: e.target.value })}
                                required
                            >
                                <option value="">-- Select Destination Account --</option>
                                {accounts
                                    .filter(a => a.id !== transferForm.fromAccountId)
                                    .map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.name} (Bal: ${parseFloat(a.amount).toFixed(2)})
                                        </option>
                                    ))}
                            </select>

                            <input
                                type="number"
                                step="0.01"
                                placeholder="Transfer Amount"
                                value={transferForm.amount}
                                onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                                required
                            />

                            <button type="submit" className="home-btn-success">Transfer</button>
                            <button type="button" onClick={() => setIsTransferring(false)} className="home-btn-cancel">
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {/* Accounts Table */}
                <table className="accounts-table">
                    <thead>
                        <tr>
                            <th>Include</th>
                            <th>Name</th>
                            <th>Initial</th>
                            <th>Current Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center' }}>
                                    No accounts found for this month.
                                </td>
                            </tr>
                        ) : (
                            accounts.map((acc) => (
                                <tr key={acc.id} className={!acc.include ? 'disabled-row' : ''}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={acc.include}
                                            onChange={() => handleToggleInclude(acc)}
                                        />
                                    </td>
                                    <td>{acc.name}</td>
                                    <td>${parseFloat(acc.initial).toFixed(2)}</td>
                                    <td>${parseFloat(acc.amount).toFixed(2)}</td>
                                    <td>
                                        <button onClick={() => startAccountTransfer(acc)} className="btn-icon" title="Transfer Amount">↔️</button>
                                        <button onClick={() => startEditingAccount(acc)} className="btn-icon" title="Edit Account">✏️</button>
                                        <button onClick={() => handleDeleteAccount(acc.id)} className="btn-icon" title="Delete Account">🗑️</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}