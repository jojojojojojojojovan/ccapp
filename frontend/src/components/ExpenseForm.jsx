export default function ExpenseForm({ editingExpenseId, expenseForm, setExpenseForm, onSubmit, onCancel }) {
    const isEditing = Boolean(editingExpenseId);

    return (
        <form onSubmit={onSubmit} className="account-form">
            <h4>{isEditing ? 'Edit Expense' : 'New Expense'}</h4>

            {/* Inputs Row */}
            <div className="form-row inputs-row">
                <div className="form-group">
                    <label>Expense Name</label>
                    <input
                        type="text"
                        placeholder="e.g. Groceries"
                        value={expenseForm.name}
                        onChange={(e) => setExpenseForm({ ...expenseForm, name: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Amount</label>
                    <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={expenseForm.amount}
                        onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                        required
                    />
                </div>
            </div>

            {/* Actions Row */}
            <div className="form-row actions-row">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={expenseForm.include}
                        onChange={(e) => setExpenseForm({ ...expenseForm, include: e.target.checked })}
                    />
                    Include
                </label>
                <div className="button-group">
                    <button type="submit" className="home-btn-success">Save</button>
                    <button type="button" onClick={onCancel} className="home-btn-cancel">Cancel</button>
                </div>
            </div>
        </form>
    );
}