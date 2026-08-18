import { fmt } from '../utils/helpers';

export default function TransferForm({ fromAccount, transferForm, setTransferForm, accounts, onSubmit, onCancel }) {
    return (
        <form onSubmit={onSubmit} className="account-form transfer-form">
            <h4>
                Transfer from: <strong>{fromAccount?.name} (Bal: ${fmt(fromAccount?.amount)})</strong>
            </h4>
            <div className="form-row">
                <select
                    value={transferForm.toAccountId}
                    onChange={(e) => setTransferForm({ ...transferForm, toAccountId: e.target.value })}
                    required
                >
                    <option value="">-- Select Destination Account --</option>
                    {accounts
                        .filter(a => a.id !== transferForm.fromAccountId)
                        .map(a => (
                            <option key={a.id} value={a.id}>
                                {a.name} (Bal: ${fmt(a.amount)})
                            </option>
                        ))}
                </select>
                <input
                    type="number"
                    step="0.01"
                    placeholder="Transfer Amount"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                    required
                />
                <button type="submit" className="home-btn-success">Transfer</button>
                <button type="button" onClick={onCancel} className="home-btn-cancel">Cancel</button>
            </div>
        </form>
    );
}