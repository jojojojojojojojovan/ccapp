import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fmt, getCurrentMonthYear } from '../utils/helpers';

import Modal from '../components/Modal';
import Header from '../components/Header';
import BudgetSection from '../components/BudgetSection';
import DataTable from '../components/DataTable';
import AccountForm from '../components/AccountForm';
import TransferForm from '../components/TransferForm';
import ExpenseForm from '../components/ExpenseForm';
import '../App.css';

export default function HomePage() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();

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
    const [accountForm, setAccountForm] = useState({ name: '', initial: '', amount: '', include: true });

    // Transfer State
    const [isTransferring, setIsTransferring] = useState(false);
    const [transferForm, setTransferForm] = useState({ fromAccountId: null, toAccountId: '', amount: '' });

    // Expenses State
    const [expenses, setExpenses] = useState([]);
    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [editingExpenseId, setEditingExpenseId] = useState(null);
    const [expenseForm, setExpenseForm] = useState({ name: '', amount: '', include: true });

    // Form Reset
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
    const totalIncludedBalance = accounts
        .filter(acc => acc.include)
        .reduce((sum, acc) => sum + (parseFloat(acc.amount) || 0), 0);

    const totalIncludedInitial = accounts
        .filter(acc => acc.include)
        .reduce((sum, acc) => sum + (parseFloat(acc.initial) || 0), 0);

    const totalIncludedExpenses = expenses
        .filter(exp => exp.include)
        .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

    const sortedAccounts = useMemo(() => {
        return [...accounts].sort((a, b) => {
            if (a.include !== b.include) return Number(b.include) - Number(a.include);
            return (a.name || '').localeCompare(b.name || '');
        });
    }, [accounts]);

    const budget = parseFloat(savedBudget) || 0;
    const spent = totalIncludedInitial - totalIncludedBalance + totalIncludedExpenses;
    const leftToSpend = budget - spent;
    const isOverBudget = leftToSpend < 0;
    const isAnyFormOpen = isAddingAccount || isTransferring || isAddingExpense;
    const fromAccount = accounts.find(a => a.id === transferForm.fromAccountId);

    // --- API Effects & Handlers ---
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const fetchData = async () => {
            setLoading(true);
            setIsEditingBudget(false);
            closeAllForms();

            try {
                const [budgetRes, accountsRes, expensesRes] = await Promise.all([
                    fetch(`http://localhost:8081/api/budgets/current?monthYear=${selectedMonth}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`http://localhost:8081/api/accounts?monthYear=${selectedMonth}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`http://localhost:8081/api/expenses?monthYear=${selectedMonth}`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                if (budgetRes.status === 401) return logout();

                if (budgetRes.ok) {
                    const data = await budgetRes.json();
                    setSavedBudget(data.amount);
                    setBudgetValue(data.amount);
                } else {
                    setSavedBudget(null);
                    setBudgetValue('');
                }

                setAccounts(accountsRes.ok ? await accountsRes.json() : []);
                setExpenses(expensesRes.ok ? await expensesRes.json() : []);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedMonth]);

    const handleBudgetSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!budgetValue) return alert('Please enter a budget amount!');

        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8081/api/budgets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ amount: parseFloat(budgetValue), monthYear: selectedMonth })
            });

            if (res.status === 401) return logout();
            if (!res.ok) throw new Error('Failed to save budget');

            const data = await res.json();
            setSavedBudget(data.amount);
            setIsEditingBudget(false);
        } catch (err) {
            console.error('Error saving budget:', err);
            alert('Failed to save budget.');
        } finally {
            setLoading(false);
        }
    };

    // Account Handlers
    const startAddingAccount = () => { closeAllForms(); setIsAddingAccount(true); };
    const startEditingAccount = (acc) => {
        closeAllForms();
        setEditingAccountId(acc.id);
        setAccountForm({ name: acc.name, initial: acc.initial, amount: acc.amount, include: acc.include });
        setIsAddingAccount(true);
    };
    const startAccountTransfer = (acc) => {
        closeAllForms();
        setTransferForm({ fromAccountId: acc.id, toAccountId: '', amount: '' });
        setIsTransferring(true);
    };

    const handleAccountSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const payload = { ...accountForm, initial: parseFloat(accountForm.initial) || 0, amount: parseFloat(accountForm.amount) || 0, monthYear: selectedMonth };
        const isEditing = editingAccountId !== null;

        try {
            const res = await fetch(isEditing ? `http://localhost:8081/api/accounts/${editingAccountId}` : `http://localhost:8081/api/accounts`, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (res.status === 401) return logout();
            if (!res.ok) throw new Error('Failed to save account');

            const saved = await res.json();
            setAccounts(isEditing ? accounts.map(a => a.id === editingAccountId ? saved : a) : [...accounts, saved]);
            closeAllForms();
        } catch (err) {
            alert('Failed to save account.');
        }
    };

    const handleToggleAccountInclude = async (account) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:8081/api/accounts/${account.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...account, include: !account.include, monthYear: selectedMonth })
            });
            if (res.ok) {
                const data = await res.json();
                setAccounts(accounts.map(a => a.id === account.id ? data : a));
            }
        } catch (err) { console.error(err); }
    };

    const handleTransferSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const transferAmt = parseFloat(transferForm.amount);
        if (!transferForm.toAccountId || isNaN(transferAmt) || transferAmt <= 0) return alert('Invalid transfer details.');

        const from = accounts.find(a => a.id === transferForm.fromAccountId);
        const to = accounts.find(a => a.id === parseInt(transferForm.toAccountId));

        try {
            const [resFrom, resTo] = await Promise.all([
                fetch(`http://localhost:8081/api/accounts/${from.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ ...from, amount: parseFloat(from.amount) - transferAmt, monthYear: selectedMonth })
                }),
                fetch(`http://localhost:8081/api/accounts/${to.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ ...to, amount: parseFloat(to.amount) + transferAmt, monthYear: selectedMonth })
                })
            ]);

            if (resFrom.ok && resTo.ok) {
                const [newFrom, newTo] = await Promise.all([resFrom.json(), resTo.json()]);
                setAccounts(accounts.map(a => a.id === newFrom.id ? newFrom : a.id === newTo.id ? newTo : a));
                closeAllForms();
            }
        } catch (err) { alert('Transfer failed.'); }
    };

    const handleDeleteAccount = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8081/api/accounts/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setAccounts(accounts.filter(a => a.id !== id));
    };

    // Expense Handlers
    const startAddingExpense = () => { closeAllForms(); setIsAddingExpense(true); };
    const startEditingExpense = (exp) => {
        closeAllForms();
        setEditingExpenseId(exp.id);
        setExpenseForm({ name: exp.name, amount: exp.amount, include: exp.include });
        setIsAddingExpense(true);
    };

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const payload = { ...expenseForm, amount: parseFloat(expenseForm.amount) || 0, monthYear: selectedMonth };
        const isEditing = editingExpenseId !== null;

        try {
            const res = await fetch(isEditing ? `http://localhost:8081/api/expenses/${editingExpenseId}` : `http://localhost:8081/api/expenses`, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (res.status === 401) return logout();
            if (!res.ok) throw new Error('Failed to save expense');

            const saved = await res.json();
            setExpenses(isEditing ? expenses.map(e => e.id === editingExpenseId ? saved : e) : [...expenses, saved]);
            closeAllForms();
        } catch (err) { alert('Failed to save expense.'); }
    };

    const handleToggleExpenseInclude = async (expense) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:8081/api/expenses/${expense.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...expense, include: !expense.include, monthYear: selectedMonth })
            });
            if (res.ok) {
                const data = await res.json();
                setExpenses(expenses.map(e => e.id === expense.id ? data : e));
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteExpense = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8081/api/expenses/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setExpenses(expenses.filter(e => e.id !== id));
    };

    return (
        <div className="home-container">
            <Header user={user} onRegister={() => navigate('/register')} onLogout={logout} />

            <BudgetSection
                isEditingBudget={isEditingBudget}
                setIsEditingBudget={setIsEditingBudget}
                handleBudgetSubmit={handleBudgetSubmit}
                budgetValue={budgetValue}
                setBudgetValue={setBudgetValue}
                savedBudget={savedBudget}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                spent={spent}
                leftToSpend={leftToSpend}
                isOverBudget={isOverBudget}
                loading={loading}
            />

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

                {/* Forms */}
                <Modal isOpen={isAddingAccount || isTransferring || isAddingExpense}>
                  {isAddingAccount && <AccountForm editingAccountId={editingAccountId} accountForm={accountForm} setAccountForm={setAccountForm} onSubmit={handleAccountSubmit} onCancel={closeAllForms} />}
                  {isTransferring && <TransferForm fromAccount={fromAccount} transferForm={transferForm} setTransferForm={setTransferForm} accounts={accounts} onSubmit={handleTransferSubmit} onCancel={closeAllForms} />}
                  {isAddingExpense && <ExpenseForm editingExpenseId={editingExpenseId} expenseForm={expenseForm} setExpenseForm={setExpenseForm} onSubmit={handleExpenseSubmit} onCancel={closeAllForms} />}
                </Modal>

                {/* Tables */}
                <h4 className="overview-subheader">Accounts</h4>
                <DataTable
                    items={sortedAccounts}
                    emptyMessage="No accounts found for this month."
                    columns={['Include', 'Name', 'Initial', 'Current Amount', 'Actions']}
                    renderRow={(acc) => (
                        <tr key={acc.id} className={!acc.include ? 'disabled-row' : ''}>
                            <td><input type="checkbox" checked={acc.include} onChange={() => handleToggleAccountInclude(acc)} /></td>
                            <td>{acc.name}</td>
                            <td>${fmt(acc.initial)}</td>
                            <td>${fmt(acc.amount)}</td>
                            <td>
                                <button onClick={() => startEditingAccount(acc)} className="btn-icon" title="Edit Account">✏️</button>
                                <button onClick={() => startAccountTransfer(acc)} className="btn-icon" title="Transfer Amount">↔️</button>
                                <button onClick={() => handleDeleteAccount(acc.id)} className="btn-icon" title="Delete Account">🗑️</button>
                            </td>
                        </tr>
                    )}
                />

                <h4 className="overview-subheader" style={{ marginTop: '32px' }}>Expenses</h4>
                <DataTable
                    items={expenses}
                    emptyMessage="No expenses found for this month."
                    columns={['Include', 'Name', 'Amount', 'Actions']}
                    renderRow={(exp) => (
                        <tr key={exp.id} className={!exp.include ? 'disabled-row' : ''}>
                            <td><input type="checkbox" checked={exp.include} onChange={() => handleToggleExpenseInclude(exp)} /></td>
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