export default function AccountForm({ editingAccountId, accountForm, setAccountForm, onSubmit, onCancel }) {
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