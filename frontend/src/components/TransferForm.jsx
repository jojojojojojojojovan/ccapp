import { fmt } from '../utils/helpers';

export default function TransferForm({ fromAccount, transferForm, setTransferForm, accounts, onSubmit, onCancel }) {
    return (
        <form onSubmit={onSubmit} className="account-form transfer-form">
            <h4>
                Transfer from: <strong>{fromAccount?.name} (Bal: ${fmt(fromAccount?.amount)})</strong>
            </h4>

            {/* Inputs Row */}
            <div className="form-row inputs-row">
                <div className="form-group">
                    <label>Destination Account</label>
                    <select
                        value={transferForm.toAccountId}
                        onChange={(e) => setTransferForm({ ...transferForm, toAccountId: e.target.value })}
                        required
                    >
                        <option value="">-- Select Destination --</option>
                        {accounts
                            .filter(a => a.id !== transferForm.fromAccountId)
                            .map(a => (
                                <option key={a.id} value={a.id}>
                                    {a.name} (Bal: ${fmt(a.amount)})
                                </option>
                            ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Transfer Amount</label>
                    <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={transferForm.amount}
                        onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                        required
                    />
                </div>
            </div>

            {/* Actions Row */}
            <div className="form-row actions-row" style={{ justifyContent: 'flex-end' }}>
                <div className="button-group">
                    <button type="submit" className="home-btn-success">Transfer</button>
                    <button type="button" onClick={onCancel} className="home-btn-cancel">Cancel</button>
                </div>
            </div>
        </form>
    );
}