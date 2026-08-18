export const fmt = (val) => parseFloat(val || 0).toFixed(2);

export const getCurrentMonthYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

export const getMonthOptions = () => {
    const options = [];
    const now = new Date();

    for (let offset = 3; offset >= -8; offset--) {
        const date = new Date(now.getFullYear(), now.getMonth() + offset, 1);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const value = `${year}-${month}`;
        const label = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });

        options.push({ value, label });
    }

    return options;
};