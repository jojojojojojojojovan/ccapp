import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

// Helper for clean currency formatting
const fmt = (val) => parseFloat(val || 0).toFixed(2);

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

    // --- State ---
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [budgetValue, setBudgetValue] = useState('');
    const [savedBudget, setSavedBudget] = useState(null);
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

    // Account Transfer State
    const [isTransferring, setIsTransferring] = useState(false);
    const [transferForm, setTransferForm] = useState({
        fromAccountId: null,
        toAccountId: '',
        amount: ''
    });

    // Expenses State
    const [expenses, setExpenses] = useState([]);
    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [editingExpenseId, setEditingExpenseId] = useState(null);
    const [expenseForm, setExpenseForm] = useState({
        name: '',
        amount: '',
        include: true
    });

    // Helper: Reset/Close All Active Forms (Ensures Mutual Exclusivity)
    const closeAllForms = () => {
        setIsAddingAccount(false);
        setEditingAccountId(null);
        setAccountForm({ name: '', initial: '', amount: '', include: true });

        setIsTransferring(false);
        setTransferForm({ fromAccountId: null, toAccountId: '', amount: '' });

        setIsAddingExpense(false);
        setEditingExpenseId(null);
        setExpenseForm({ name: '', amount: '', include: true });
    };

    // --- Calculations ---
    // 1. Total Balance = Sum of current amounts of all INCLUDED accounts
    const totalIncludedBalance = accounts
        .filter(acc => acc.include)
        .reduce((sum, acc) => sum + (parseFloat(acc.amount) || 0), 0);

    // 2. Sum of all initial amounts for INCLUDED accounts
    const totalIncludedInitial = accounts
        .filter(acc => acc.include)
        .reduce((sum, acc) => sum + (parseFloat(acc.initial) || 0), 0);

    // 3. Sum of all current amounts for INCLUDED expenses
    const totalIncludedExpenses = expenses
        .filter(exp => exp.include)
        .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);



    const handleLogout = () => {
        logout();
    };

    const handleRegisterUser = () => {
        navigate('/register');
    };

    // 🔄 Fetch Budget, Accounts, and Expenses on month change
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const fetchData = async () => {
            setLoading(true);
            setIsEditingBudget(false);
            closeAllForms();

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

                // 3. Fetch Expenses
                const expensesRes = await fetch(
                    `http://localhost:8081/api/expenses?monthYear=${selectedMonth}`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );

                if (expensesRes.ok) {
                    const data = await expensesRes.json();
                    setExpenses(data);
                } else {
                    setExpenses([]);
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

    // --- ACCOUNTS HANDLERS ---
    const startAddingAccount = () => {
        closeAllForms();
        setIsAddingAccount(true);
    };

    const startEditingAccount = (acc) => {
        closeAllForms();
        setEditingAccountId(acc.id);
        setAccountForm({
            name: acc.name,
            initial: acc.initial,
            amount: acc.amount,
            include: acc.include
        });
        setIsAddingAccount(true);
    };

    const startAccountTransfer = (acc) => {
        closeAllForms();
        setTransferForm({
            fromAccountId: acc.id,
            toAccountId: '',
            amount: ''
        });
        setIsTransferring(true);
    };

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

            closeAllForms();
        } catch (err) {
            console.error('Error saving account:', err);
            alert('Failed to save account.');
        }
    };

    const handleToggleAccountInclude = async (account) => {
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
            const updatedFrom = {
                ...fromAccount,
                amount: parseFloat(fromAccount.amount) - transferAmt,
                monthYear: selectedMonth
            };

            const updatedTo = {
                ...toAccount,
                amount: parseFloat(toAccount.amount) + transferAmt,
                monthYear: selectedMonth
            };

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

                setAccounts(accounts.map(a => {
                    if (a.id === newFrom.id) return newFrom;
                    if (a.id === newTo.id) return newTo;
                    return a;
                }));

                closeAllForms();
            } else {
                alert('Failed to complete transfer.');
            }
        } catch (err) {
            console.error('Transfer error:', err);
            alert('An error occurred during transfer.');
        }
    };

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

    // --- EXPENSES HANDLERS ---
    const startAddingExpense = () => {
        closeAllForms();
        setIsAddingExpense(true);
    };

    const startEditingExpense = (exp) => {
        closeAllForms();
        setEditingExpenseId(exp.id);
        setExpenseForm({
            name: exp.name,
            amount: exp.amount,
            include: exp.include
        });
        setIsAddingExpense(true);
    };

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        const payload = {
            name: expenseForm.name,
            amount: parseFloat(expenseForm.amount) || 0,
            monthYear: selectedMonth,
            include: expenseForm.include
        };

        try {
            const isEditing = editingExpenseId !== null;
            const url = isEditing
                ? `http://localhost:8081/api/expenses/${editingExpenseId}`
                : `http://localhost:8081/api/expenses`;

            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.status === 401) return handleLogout();
            if (!response.ok) throw new Error('Failed to save expense');

            const savedExpense = await response.json();

            if (isEditing) {
                setExpenses(expenses.map(e => e.id === editingExpenseId ? savedExpense : e));
            } else {
                setExpenses([...expenses, savedExpense]);
            }

            closeAllForms();
        } catch (err) {
            console.error('Error saving expense:', err);
            alert('Failed to save expense.');
        }
    };

    const handleToggleExpenseInclude = async (expense) => {
        const token = localStorage.getItem('token');
        const updated = { ...expense, include: !expense.include, monthYear: selectedMonth };

        try {
            const response = await fetch(`http://localhost:8081/api/expenses/${expense.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updated)
            });

            if (response.ok) {
                const data = await response.json();
                setExpenses(expenses.map(e => e.id === expense.id ? data : e));
            }
        } catch (err) {
            console.error('Error updating expense:', err);
        }
    };

    const handleDeleteExpense = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:8081/api/expenses/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setExpenses(expenses.filter(e => e.id !== id));
            }
        } catch (err) {
            console.error('Error deleting expense:', err);
        }
    };

    // Helper reference for source transfer account
    const fromAccount = accounts.find(a => a.id === transferForm.fromAccountId);

    const isAnyFormOpen = isAddingAccount || isTransferring || isAddingExpense;
    // 1. Parse budget safely
    const budget = parseFloat(savedBudget) || 0;

    // 2. Calculate current amount spent from accounts & expenses
    const spent = totalIncludedInitial - totalIncludedBalance + totalIncludedExpenses;

    // 3. Calculate remaining budget (Budget - Spent)
    const leftToSpend = budget - spent;
    const isOverBudget = leftToSpend < 0;

    return (
            <div className="home-container">
                {/* Header */}
                <Header
                    user={user}
                    onRegister={handleRegisterUser}
                    onLogout={handleLogout}
                />

                {/* Savings & Budget Section */}
                <BudgetSection
                    isEditingBudget={isEditingBudget}
                    setIsEditingBudget={setIsEditingBudget}
                    handleBudgetSubmit={handleBudgetSubmit}
                    budgetValue={budgetValue}
                    setBudgetValue={setBudgetValue}
                    savedBudget={savedBudget}
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                    getMonthOptions={getMonthOptions}
                    spent={spent}
                    leftToSpend={leftToSpend}
                    isOverBudget={isOverBudget}
                    loading={loading}
                />

                {/* Overview Section */}
                <div className="home-accounts-section">
                    <div className="accounts-header">
                        <div>
                            <h3>Overview</h3>
                            <p className="accounts-total">
                                Total Balance (Included): <strong>${fmt(totalIncludedBalance)}</strong>
                            </p>
                        </div>
                        {!isAnyFormOpen && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                <button onClick={startAddingAccount} className="home-btn-add">+ Add Account</button>
                                <button onClick={startAddingExpense} className="home-btn-add">+ Add Expense</button>
                            </div>
                        )}
                    </div>

                    {/* Mutually Exclusive Forms */}
                    {isAddingAccount && (
                        <AccountForm
                            editingAccountId={editingAccountId}
                            accountForm={accountForm}
                            setAccountForm={setAccountForm}
                            onSubmit={handleAccountSubmit}
                            onCancel={closeAllForms}
                        />
                    )}

                    {isTransferring && (
                        <TransferForm
                            fromAccount={fromAccount}
                            transferForm={transferForm}
                            setTransferForm={setTransferForm}
                            accounts={accounts}
                            onSubmit={handleTransferSubmit}
                            onCancel={closeAllForms}
                        />
                    )}

                    {isAddingExpense && (
                        <ExpenseForm
                            editingExpenseId={editingExpenseId}
                            expenseForm={expenseForm}
                            setExpenseForm={setExpenseForm}
                            onSubmit={handleExpenseSubmit}
                            onCancel={closeAllForms}
                        />
                    )}

                    {/* Accounts Table */}
                    <h4 className="overview-subheader">Accounts</h4>
                    <DataTable
                        items={accounts}
                        emptyMessage="No accounts found for this month."
                        columns={['Include', 'Name', 'Initial', 'Current Amount', 'Actions']}
                        renderRow={(acc) => (
                            <tr key={acc.id} className={!acc.include ? 'disabled-row' : ''}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={acc.include}
                                        onChange={() => handleToggleAccountInclude(acc)}
                                    />
                                </td>
                                <td>{acc.name}</td>
                                <td>${fmt(acc.initial)}</td>
                                <td>${fmt(acc.amount)}</td>
                                <td>
                                    <button onClick={() => startAccountTransfer(acc)} className="btn-icon" title="Transfer Amount">↔️</button>
                                    <button onClick={() => startEditingAccount(acc)} className="btn-icon" title="Edit Account">✏️</button>
                                    <button onClick={() => handleDeleteAccount(acc.id)} className="btn-icon" title="Delete Account">🗑️</button>
                                </td>
                            </tr>
                        )}
                    />

                    {/* Expenses Table */}
                    <h4 className="overview-subheader" style={{ marginTop: '32px' }}>Expenses</h4>
                    <DataTable
                        items={expenses}
                        emptyMessage="No expenses found for this month."
                        columns={['Include', 'Name', 'Amount', 'Actions']}
                        renderRow={(exp) => (
                            <tr key={exp.id} className={!exp.include ? 'disabled-row' : ''}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={exp.include}
                                        onChange={() => handleToggleExpenseInclude(exp)}
                                    />
                                </td>
                                <td>{exp.name}</td>
                                <td>${fmt(exp.amount)}</td>
                                <td>
                                    <button onClick={() => startEditingExpense(exp)} className="btn-icon" title="Edit Expense">✏️</button>
                                    <button onClick={() => handleDeleteExpense(exp.id)} className="btn-icon" title="Delete Expense">🗑️</button>
                                </td>
                            </tr>
                        )}
                    />
                </div>
            </div>
        );
    }

    /* ====================================================================
       SUB-COMPONENTS (Keep at bottom of file or extract to separate files)
       ==================================================================== */

    function Header({ user, onRegister, onLogout }) {
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

    function BudgetSection({
        isEditingBudget, setIsEditingBudget, handleBudgetSubmit,
        budgetValue, setBudgetValue, savedBudget, selectedMonth,
        setSelectedMonth, getMonthOptions, spent, leftToSpend,
        isOverBudget, loading
    }) {
        return (
            <div className="home-savings-section">
                <div className="home-section-top">
                    <div className="home-budget-controls">
                        {isEditingBudget ? (
                            <form onSubmit={handleBudgetSubmit} className="home-budget-form">
                                <label htmlFor="budget-input" className="home-budget-label">Edit budget:</label>
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
                        ) : savedBudget !== null ? (
                            <div className="home-budget-display">
                                <p className="home-budget-amount">Your budget is ${fmt(savedBudget)}</p>
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
                            <button onClick={() => setIsEditingBudget(true)} className="home-btn-add">
                                + Add Budget
                            </button>
                        )}
                    </div>

                    <div className="home-date-filter">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="home-date-select"
                        >
                            {getMonthOptions().map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <p className="home-spent-text">
                    You have spent ${fmt(spent)}.
                </p>

                {savedBudget !== null && (
                    <p className={`home-summary-text ${isOverBudget ? 'danger' : 'success'}`}>
                        {isOverBudget
                            ? `You overshot your spending by $${fmt(Math.abs(leftToSpend))}`
                            : `You have $${fmt(leftToSpend)} left to spend.`
                        }
                    </p>
                )}
            </div>
        );
    }

    function DataTable({ items, columns, renderRow, emptyMessage }) {
        return (
            <table className="accounts-table">
                <thead>
                    <tr>
                        {columns.map((col, idx) => <th key={idx}>{col}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} style={{ textAlign: 'center' }}>
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        items.map(renderRow)
                    )}
                </tbody>
            </table>
        );
    }

    function AccountForm({ editingAccountId, accountForm, setAccountForm, onSubmit, onCancel }) {
        return (
            <form onSubmit={onSubmit} className="account-form">
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
                    <button type="button" onClick={onCancel} className="home-btn-cancel">Cancel</button>
                </div>
            </form>
        );
    }

    function TransferForm({ fromAccount, transferForm, setTransferForm, accounts, onSubmit, onCancel }) {
        return (
            <form onSubmit={onSubmit} className="account-form transfer-form">
                <h4>
                    Transfer from: <strong>{fromAccount?.name} (Bal: ${fmt(fromAccount?.amount)})</strong>
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
                                    {a.name} (Bal: ${fmt(a.amount)})
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
                    <button type="button" onClick={onCancel} className="home-btn-cancel">Cancel</button>
                </div>
            </form>
        );
    }

    function ExpenseForm({ editingExpenseId, expenseForm, setExpenseForm, onSubmit, onCancel }) {
        return (
            <form onSubmit={onSubmit} className="account-form">
                <h4>{editingExpenseId ? 'Edit Expense' : 'New Expense'}</h4>
                <div className="form-row">
                    <input
                        type="text"
                        placeholder="Expense Name (e.g. Groceries)"
                        value={expenseForm.name}
                        onChange={(e) => setExpenseForm({ ...expenseForm, name: e.target.value })}
                        required
                    />
                    <input
                        type="number"
                        step="0.01"
                        placeholder="Amount"
                        value={expenseForm.amount}
                        onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                        required
                    />
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={expenseForm.include}
                            onChange={(e) => setExpenseForm({ ...expenseForm, include: e.target.checked })}
                        />
                        Include
                    </label>
                    <button type="submit" className="home-btn-success">Save</button>
                    <button type="button" onClick={onCancel} className="home-btn-cancel">Cancel</button>
                </div>
            </form>
        );
    }