import { fmt, getMonthOptions } from '../utils/helpers';

export default function BudgetSection({
    isEditingBudget, setIsEditingBudget, handleBudgetSubmit,
    budgetValue, setBudgetValue, savedBudget, selectedMonth,
    setSelectedMonth, spent, leftToSpend, isOverBudget, loading
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