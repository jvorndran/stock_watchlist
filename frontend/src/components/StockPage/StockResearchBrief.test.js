import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import StockResearchBrief, {buildResearchBriefSummary, normalizeResearchBrief} from './StockResearchBrief';

const stockData = {summary: {Symbol: 'TEST'}};
const storageKey = 'stock-watchlist-research-brief:TEST';

describe('StockResearchBrief', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it('shows the next missing research step from a partial brief', () => {
        expect(buildResearchBriefSummary({
            thesis: 'Durable cash generation',
            catalyst: '',
            invalidation: 'Margins weaken',
        })).toEqual({
            completedCount: 2,
            isComplete: false,
            nextStep: 'Add catalyst to watch.',
            totalCount: 3,
        });
    });

    it('normalizes stored brief fields before use', () => {
        expect(normalizeResearchBrief({
            thesis: '  A clear idea  ',
            catalyst: 4,
            invalidation: '  Missed guidance  ',
        })).toEqual({
            thesis: 'A clear idea',
            catalyst: '',
            invalidation: 'Missed guidance',
        });
    });

    it('persists a complete brief for the current ticker', () => {
        render(<StockResearchBrief stockData={stockData} />);

        fireEvent.change(screen.getByLabelText('Investment thesis'), {target: {value: 'Earnings compounder'}});
        fireEvent.change(screen.getByLabelText('Catalyst to watch'), {target: {value: 'Margin expansion'}});
        fireEvent.change(screen.getByLabelText('Risk / invalidation'), {target: {value: 'Revenue stalls'}});
        fireEvent.click(screen.getByRole('button', {name: 'Save brief'}));

        expect(screen.getByText('3 of 3 documented')).toBeInTheDocument();
        expect(screen.getByText('TEST research brief saved to this browser.')).toBeInTheDocument();
        expect(JSON.parse(window.localStorage.getItem(storageKey))).toEqual({
            thesis: 'Earnings compounder',
            catalyst: 'Margin expansion',
            invalidation: 'Revenue stalls',
        });
    });

    it('clears a saved brief without affecting another ticker key', () => {
        window.localStorage.setItem(storageKey, JSON.stringify({thesis: 'Existing', catalyst: '', invalidation: ''}));
        window.localStorage.setItem('stock-watchlist-research-brief:OTHER', JSON.stringify({thesis: 'Keep'}));
        render(<StockResearchBrief stockData={stockData} />);

        fireEvent.click(screen.getByRole('button', {name: 'Clear brief'}));

        expect(screen.getByLabelText('Investment thesis')).toHaveValue('');
        expect(window.localStorage.getItem(storageKey)).toBeNull();
        expect(window.localStorage.getItem('stock-watchlist-research-brief:OTHER')).not.toBeNull();
    });
});
