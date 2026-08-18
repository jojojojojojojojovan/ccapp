export default function AccountForm({ editingAccountId, accountForm, setAccountForm, onSubmit, onCancel }) {
    const isEditing = Boolean(editingAccountId);

    return (
        <form onSubmit={onSubmit} className="account-form">
            <h4>{isEditing ? 'Edit Account' : 'New Account'}</h4>

            {/* Inputs Row */}
            <div className="form-row inputs-row">
                <div className="form-group">
                    <label>Account Name</label>
                    <input
                        type="text"
                        placeholder="e.g. DBS Multiplier"
                        value={accountForm.name}
                        onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Initial Balance</label>
                    <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={accountForm.initial || '0.00'}
                        onChange={(e) => setAccountForm({ ...accountForm, initial: e.target.value })}
                        disabled={isEditing}
                        title={isEditing ? 'Initial balance cannot be modified during edit' : ''}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Current Amount</label>
                    <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={accountForm.amount}
                        onChange={(e) => setAccountForm({ ...accountForm, amount: e.target.value })}
                        required
                    />
                </div>
            </div>

            {/* Actions Row */}
            <div className="form-row actions-row">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={accountForm.include}
                        onChange={(e) => setAccountForm({ ...accountForm, include: e.target.checked })}
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