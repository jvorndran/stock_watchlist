import React, {useMemo, useState} from 'react';
import '../style/stock-research-brief-style.css';

const fields = [
    {
        key: 'thesis',
        label: 'Investment thesis',
        placeholder: 'What makes this idea worth owning or watching?',
    },
    {
        key: 'catalyst',
        label: 'Catalyst to watch',
        placeholder: 'What event, result, or trend could validate the thesis?',
    },
    {
        key: 'invalidation',
        label: 'Risk / invalidation',
        placeholder: 'What would make the thesis no longer hold?',
    },
];

const emptyBrief = () => ({
    thesis: '',
    catalyst: '',
    invalidation: '',
});

const getStorageKey = (symbol) => `stock-watchlist-research-brief:${String(symbol || '').trim().toUpperCase()}`;

export const normalizeResearchBrief = (brief) => fields.reduce((normalized, field) => {
    const value = brief && typeof brief[field.key] === 'string' ? brief[field.key].trim() : '';

    normalized[field.key] = value.slice(0, 600);
    return normalized;
}, emptyBrief());

export const buildResearchBriefSummary = (brief) => {
    const normalized = normalizeResearchBrief(brief);
    const completedFields = fields.filter((field) => Boolean(normalized[field.key]));
    const nextField = fields.find((field) => !normalized[field.key]);

    return {
        completedCount: completedFields.length,
        isComplete: completedFields.length === fields.length,
        nextStep: nextField ? `Add ${nextField.label.toLowerCase()}.` : 'Research brief is ready for review.',
        totalCount: fields.length,
    };
};

const loadResearchBrief = (symbol) => {
    try {
        const stored = window.localStorage.getItem(getStorageKey(symbol));
        return stored ? normalizeResearchBrief(JSON.parse(stored)) : emptyBrief();
    } catch (error) {
        return emptyBrief();
    }
};

const StockResearchBrief = ({stockData}) => {
    const {summary} = stockData;
    const symbol = summary.Symbol;
    const [brief, setBrief] = useState(() => loadResearchBrief(symbol));
    const [message, setMessage] = useState('');
    const briefSummary = useMemo(() => buildResearchBriefSummary(brief), [brief]);

    const updateBrief = (key, value) => {
        setBrief((currentBrief) => ({...currentBrief, [key]: value.slice(0, 600)}));
        setMessage('');
    };

    const saveBrief = (event) => {
        event.preventDefault();
        const normalized = normalizeResearchBrief(brief);

        try {
            window.localStorage.setItem(getStorageKey(symbol), JSON.stringify(normalized));
            setBrief(normalized);
            setMessage(`${symbol} research brief saved to this browser.`);
        } catch (error) {
            setMessage('This browser could not save the research brief.');
        }
    };

    const clearBrief = () => {
        try {
            window.localStorage.removeItem(getStorageKey(symbol));
            setBrief(emptyBrief());
            setMessage(`${symbol} research brief cleared from this browser.`);
        } catch (error) {
            setMessage('This browser could not clear the research brief.');
        }
    };

    return (
        <section className="stock-research-brief">
            <div className="stock-research-brief__header">
                <div>
                    <h2>Research Brief</h2>
                    <span>Capture the thesis, catalyst, and invalidation for {symbol}</span>
                </div>
                <strong className={briefSummary.isComplete ? 'is-complete' : ''}>
                    {briefSummary.completedCount} of {briefSummary.totalCount} documented
                </strong>
            </div>

            <div className="stock-research-brief__progress" aria-label="Research brief progress">
                <span style={{width: `${(briefSummary.completedCount / briefSummary.totalCount) * 100}%`}} />
            </div>
            <p className="stock-research-brief__next-step">{briefSummary.nextStep}</p>

            <form onSubmit={saveBrief}>
                <div className="stock-research-brief__fields">
                    {fields.map((field) => (
                        <label key={field.key}>
                            <span>{field.label}</span>
                            <textarea
                                aria-label={field.label}
                                maxLength="600"
                                onChange={(event) => updateBrief(field.key, event.target.value)}
                                placeholder={field.placeholder}
                                rows="3"
                                value={brief[field.key]}
                            />
                            <small>{brief[field.key].length}/600</small>
                        </label>
                    ))}
                </div>

                <div className="stock-research-brief__actions">
                    <button className="stock-research-brief__clear" onClick={clearBrief} type="button">Clear brief</button>
                    <button type="submit">Save brief</button>
                </div>
            </form>

            <p aria-live="polite" className="stock-research-brief__message">{message}</p>
            <small className="stock-research-brief__note">Briefs are stored only in this browser and remain separate for each ticker.</small>
        </section>
    );
};

export default StockResearchBrief;
