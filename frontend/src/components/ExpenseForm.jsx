export default function ExpenseForm({ editingExpenseId, expenseForm, setExpenseForm, onSubmit, onCancel }) {
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