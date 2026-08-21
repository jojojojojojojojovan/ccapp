export default function CardForm({ editingCardId, cardForm, setCardForm, onSubmit, onCancel, banks = [] }) {
    const isEditing = Boolean(editingCardId);

    return (
        <form onSubmit={onSubmit} className="account-form">
            <h4>{isEditing ? 'Edit Card' : 'New Card'}</h4>

            <div className="form-row inputs-row">
                {/* Bank Dropdown */}
                <div className="form-group">
                    <label>Bank</label>
                    <select
                        value={cardForm.bankId || ''}
                        onChange={(e) => setCardForm({ ...cardForm, bankId: e.target.value })}
                        required
                    >
                        <option value="" disabled>Select Bank</option>
                        <option key = 'test' >
                                                        test bank
                                                    </option>
                        {banks.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Card Name */}
                <div className="form-group">
                    <label>Card Name</label>
                    <input
                        type="text"
                        placeholder="e.g. Everyday Card"
                        value={cardForm.name}
                        onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className="form-row inputs-row">
                {/* Card Type Dropdown */}
                <div className="form-group">
                    <label>Card Type</label>
                    <select
                        value={cardForm.cardType || 'VISA'}
                        onChange={(e) => setCardForm({ ...cardForm, cardType: e.target.value })}
                        required
                    >
                        <option value="VISA">VISA</option>
                        <option value="MASTER">MASTER</option>
                        <option value="AMEX">AMEX</option>
                    </select>
                </div>

                {/* Minimum Spend (Optional) */}
                <div className="form-group">
                    <label>Min Spend (Optional)</label>
                    <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 500.00"
                        value={cardForm.minSpend || ''}
                        onChange={(e) => setCardForm({ ...cardForm, minSpend: e.target.value })}
                    />
                </div>

                {/* Cap Field with Unlimited Checkbox */}
                <div className="form-group">
                    <label>Cap</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label className="checkbox-label" style={{ fontSize: '0.85rem' }}>
                            <input
                                type="checkbox"
                                checked={cardForm.isCapUnlimited}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setCardForm({
                                        ...cardForm,
                                        isCapUnlimited: checked,
                                        cap: checked ? '' : cardForm.cap
                                    });
                                }}
                            />
                            Unlimited
                        </label>

                        {!cardForm.isCapUnlimited && (
                            <input
                                type="number"
                                step="0.01"
                                placeholder="e.g. 1000.00"
                                value={cardForm.cap || ''}
                                onChange={(e) => setCardForm({ ...cardForm, cap: e.target.value })}
                                required
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Actions Row */}
            <div className="form-row actions-row">
                <div className="button-group">
                    <button type="submit" className="home-btn-success">Save</button>
                    <button type="button" onClick={onCancel} className="home-btn-cancel">Cancel</button>
                </div>
            </div>
        </form>
    );
}