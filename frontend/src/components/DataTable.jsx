export default function DataTable({ items, columns, renderRow, emptyMessage }) {
    return (
        <table className="accounts-table">
            <thead>
                <tr>
                    {columns.map((col, idx) => <th key={idx}>{col}</th>)}
                </tr>
            </thead>
            <tbody>
                {items.length === 0 ? (
                    <tr>
                        <td colSpan={columns.length} style={{ textAlign: 'center' }}>
                            {emptyMessage}
                        </td>
                    </tr>
                ) : (
                    items.map(renderRow)
                )}
            </tbody>
        </table>
    );
}