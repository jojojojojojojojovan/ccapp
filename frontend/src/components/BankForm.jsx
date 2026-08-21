export default function BankForm({ editingBankId, bankForm, setBankForm, onSubmit, onCancel }) {
    const isEditing = Boolean(editingBankId);

    return (
        <form onSubmit={onSubmit} className="account-form">
            <h4>{isEditing ? 'Edit Bank' : 'New Bank'}</h4>

            <div className="form-row inputs-row">
                <div className="form-group">
                    <label>Bank Name</label>
                    <input
                        type="text"
                        placeholder="e.g. DBS Bank"
                        value={bankForm.name}
                        onChange={(e) => setBankForm({ ...bankForm, name: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className="form-row actions-row">
                <div className="button-group">
                    <button type="submit" className="home-btn-success">Save</button>
                    <button type="button" onClick={onCancel} className="home-btn-cancel">Cancel</button>
                </div>
            </div>
        </form>
    );
}