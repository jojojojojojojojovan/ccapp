import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fmt, getCurrentMonthYear } from '../utils/helpers';

import Modal from '../components/Modal';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import BankForm from '../components/BankForm';
import CardForm from '../components/CardForm';
import '../App.css';

export default function AdminHomePage() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    // --- State ---
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());
    const [loading, setLoading] = useState(false);

    // Banks State
    const [banks, setBanks] = useState([]);
    const [isAddingBank, setIsAddingBank] = useState(false);
    const [editingBankId, setEditingBankId] = useState(null);
    const [bankForm, setBankForm] = useState({ name: '' });

    // Cards State
    const [cards, setCards] = useState([]);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [editingCardId, setEditingCardId] = useState(null);
    const [cardForm, setCardForm] = useState({
        bankId: '',
        name: '',
        cardType: 'VISA',
        minSpend: '',
        cap: '',
        isCapUnlimited: true
    });

    // Form Reset
    const closeAllForms = () => {
        setIsAddingBank(false);
        setEditingBankId(null);
        setBankForm({ name: '' });

        setIsAddingCard(false);
        setEditingCardId(null);
        setCardForm({
            bankId: '',
            name: '',
            cardType: 'VISA',
            minSpend: '',
            cap: '',
            isCapUnlimited: true
        });
    };

    // --- Calculations ---
    const totalIncludedBalance = banks
        .filter(acc => acc.include)
        .reduce((sum, acc) => sum + (parseFloat(acc.amount) || 0), 0);

    const totalAllBanksBalance = banks
        .reduce((sum, acc) => sum + (parseFloat(acc.amount) || 0), 0);

    const totalIncludedInitial = banks
        .filter(acc => acc.include)
        .reduce((sum, acc) => sum + (parseFloat(acc.initial) || 0), 0);

    const totalIncludedCards = cards
        .filter(exp => exp.include)
        .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

    const sortedBanks = useMemo(() => {
        return [...banks].sort((a, b) => {
            if (a.include !== b.include) return Number(b.include) - Number(a.include);
            return (a.name || '').localeCompare(b.name || '');
        });
    }, [banks]);

    const isAnyFormOpen = isAddingBank || isAddingCard;

    // --- API Effects & Handlers ---
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const fetchData = async () => {
            setLoading(true);
            closeAllForms();

            try {
                const [banksRes, cardsRes] = await Promise.all([
                    fetch(`http://localhost:8081/api/expenses?monthYear=${selectedMonth}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`http://localhost:8081/api/expenses?monthYear=${selectedMonth}`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                setBanks(banksRes.ok ? await banksRes.json() : []);
                setCards(cardsRes.ok ? await cardsRes.json() : []);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedMonth]);


    // Bank Handlers
    const startAddingBank = () => { closeAllForms(); setIsAddingBank(true); };
    const startEditingBank = (acc) => {
        closeAllForms();
        setEditingBankId(acc.id);
        setBankForm({ name: acc.name });
        setIsAddingBank(true);
    };

    const handleBankSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const payload = { ...BankForm, initial: parseFloat(BankForm.initial) || 0, amount: parseFloat(BankForm.amount) || 0, monthYear: selectedMonth };
        const isEditing = editingBankId !== null;

        try {
            const res = await fetch(isEditing ? `http://localhost:8081/api/banks/${editingBankId}` : `http://localhost:8081/api/banks`, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (res.status === 401) return logout();
            if (!res.ok) throw new Error('Failed to save bank');

            const saved = await res.json();
            setBanks(isEditing ? banks.map(a => a.id === editingBankId ? saved : a) : [...banks, saved]);
            closeAllForms();
        } catch (err) {
            alert('Failed to save bank.');
        }
    };

    const handleToggleBankInclude = async (bank) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:8081/api/banks/${bank.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...bank, include: !bank.include, monthYear: selectedMonth })
            });
            if (res.ok) {
                const data = await res.json();
                setBanks(banks.map(a => a.id === bank.id ? data : a));
            }
        } catch (err) { console.error(err); }
    };


    const handleDeleteBank = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8081/api/banks/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setBanks(banks.filter(a => a.id !== id));
    };

    // Card Handlers
    const startAddingCard = () => {
        if (banks.length === 0) {
            alert('No banks, please add a bank first before adding cards.');
            return;
        }
        closeAllForms();
        setIsAddingCard(true);
    };

    const startEditingCard = (exp) => {
        closeAllForms();
        setEditingCardId(exp.id);

        const isUnlimited = exp.cap === null || exp.cap === undefined;

        setCardForm({
            bankId: exp.bankId || '',
            name: exp.name || '',
            cardType: exp.cardType || 'VISA',
            minSpend: exp.minSpend ?? '',
            cap: isUnlimited ? '' : exp.cap,
            isCapUnlimited: isUnlimited
        });
        setIsAddingCard(true);
    };

    const handleCardSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        const payload = {
            bankId: cardForm.bankId,
            name: cardForm.name,
            cardType: cardForm.cardType,
            minSpend: cardForm.minSpend ? parseFloat(cardForm.minSpend) : null,
            cap: cardForm.isCapUnlimited ? null : (cardForm.cap ? parseFloat(cardForm.cap) : null),
            monthYear: selectedMonth
        };

        const isEditing = editingCardId !== null;

        try {
            const res = await fetch(isEditing ? `http://localhost:8081/api/cards/${editingCardId}` : `http://localhost:8081/api/cards`, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (res.status === 401) return logout();
            if (!res.ok) throw new Error('Failed to save card');

            const saved = await res.json();
            setCards(isEditing ? cards.map(e => e.id === editingCardId ? saved : e) : [...cards, saved]);
            closeAllForms();
        } catch (err) {
            alert('Failed to save card.');
        }
    };

    const handleToggleCardInclude = async (card) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:8081/api/cards/${card.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...card, include: !card.include, monthYear: selectedMonth })
            });
            if (res.ok) {
                const data = await res.json();
                setCards(cards.map(e => e.id === card.id ? data : e));
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteCard = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8081/api/cards/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setCards(cards.filter(e => e.id !== id));
    };

    return (
        <div className="home-container">
            <Header
              user={user}
              button={
                  user?.role === 'ROLE_ADMIN' ? (
                    <button onClick={() => navigate('/register')} className="home-btn-primary">
                      Register User
                    </button>
                  ) : null
                }
              onLogout={logout}
            />
            <div className="home-banks-section">
                <div className="banks-header">
                    <div>

                    </div>
                    {!isAnyFormOpen && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                            <button onClick={startAddingBank} className="home-btn-add">+ Add Bank</button>
                            <button onClick={startAddingCard} className="home-btn-add">+ Add Card</button>
                        </div>
                    )}
                </div>

                {/* Forms */}
                <Modal isOpen={isAddingBank || isAddingCard}>
                  {isAddingBank && (
                      <BankForm
                        editingBankId={editingBankId}
                        bankForm={bankForm}
                        setBankForm={setBankForm}
                        onSubmit={handleBankSubmit}
                        onCancel={closeAllForms}
                      />
                  )}
                  {isAddingCard && (
                      <CardForm
                        editingCardId={editingCardId}
                        cardForm={cardForm}
                        setCardForm={setCardForm}
                        onSubmit={handleCardSubmit}
                        onCancel={closeAllForms}
                        banks={banks}
                      />
                  )}
                </Modal>

                {/* Tables */}
                <h4 className="overview-subheader">Bank</h4>
                <DataTable
                    items={banks}
                    emptyMessage="No banks found for this month."
                    columns={['Name', 'Actions']}
                    renderRow={(acc) => (
                        <tr key={acc.id}>
                            <td>{acc.name}</td>
                            <td>
                                <button onClick={() => startEditingBank(acc)} className="btn-icon" title="Edit Bank">✏️</button>
                                <button onClick={() => handleDeleteBank(acc.id)} className="btn-icon" title="Delete Bank">🗑️</button>
                            </td>
                        </tr>
                    )}
                />

                <h4 className="overview-subheader" style={{ marginTop: '32px' }}>Cards</h4>
                <DataTable
                    items={cards}
                    emptyMessage="No cards found for this month."
                    columns={['Bank', 'Name', 'Type', 'Min Spend', 'Cap', 'Actions']}
                    renderRow={(exp) => {
                        const bankName = banks.find(b => b.id === exp.bankId)?.name || 'N/A';
                        return (
                            <tr key={exp.id}>
                                <td>{bankName}</td>
                                <td>{exp.name}</td>
                                <td>{exp.cardType}</td>
                                <td>{exp.minSpend ? `$${fmt(exp.minSpend)}` : '-'}</td>
                                <td>{exp.cap == null ? 'Unlimited' : `$${fmt(exp.cap)}`}</td>
                                <td>
                                    <button onClick={() => startEditingCard(exp)} className="btn-icon" title="Edit Card">✏️</button>
                                    <button onClick={() => handleDeleteCard(exp.id)} className="btn-icon" title="Delete Card">🗑️</button>
                                </td>
                            </tr>
                        );
                    }}
                />
            </div>
        </div>
    );
}