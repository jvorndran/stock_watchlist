import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import StockIncomePanel from './StockIncomePanel';

const stockData = {
    summary: {
        Symbol: 'TEST',
        DividendPerShare: '2',
        DividendYield: '0.02',
        DividendDate: '2026-09-15',
        EPS: '5',
        ExDividendDate: '2026-08-15',
    },
};

describe('StockIncomePanel', () => {
    it('projects dividend income from the selected share count', () => {
        render(<StockIncomePanel stockData={stockData} />);

        expect(screen.getByText('$200.00')).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('Shares Owned'), {target: {value: '50'}});

        expect(screen.getByText('$100.00')).toBeInTheDocument();
        expect(screen.getByText('$8.33 monthly average')).toBeInTheDocument();
    });

    it('shows a planner empty state when no dividend is reported', () => {
        render(
            <StockIncomePanel
                stockData={{summary: {...stockData.summary, DividendPerShare: '0'}}}
            />
        );

        expect(screen.getByText(/positive reported dividend/i)).toBeInTheDocument();
    });
});
