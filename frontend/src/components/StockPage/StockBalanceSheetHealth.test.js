import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import StockBalanceSheetHealth, {buildBalanceSheetHealth} from './StockBalanceSheetHealth';

const stockData = {
    summary: {
        Symbol: 'TEST',
        TotalCash: '1500000000',
        TotalDebt: '500000000',
        CurrentRatio: '1.8',
        DebtToEquity: '45',
        CashPerShare: '12.5',
    },
};

describe('StockBalanceSheetHealth', () => {
    it('builds a net-cash funding profile from overview data', () => {
        expect(buildBalanceSheetHealth(stockData.summary)).toMatchObject({
            debtCoverage: 3,
            debtToEquity: 0.45,
            label: 'Net cash buffer',
            netCash: 1000000000,
        });
    });

    it('flags constrained liquidity and renders the main funding metrics', () => {
        const health = buildBalanceSheetHealth({
            TotalCash: '100',
            TotalDebt: '1000',
            CurrentRatio: '0.8',
            DebtToEquity: '240',
        });

        expect(health.label).toBe('Liquidity watch');

        render(<StockBalanceSheetHealth stockData={stockData} />);

        expect(screen.getByRole('heading', {name: 'Balance Sheet Health'})).toBeInTheDocument();
        expect(screen.getByText('Net cash')).toBeInTheDocument();
        expect(screen.getByText('Cash coverage')).toBeInTheDocument();
    });

    it('shows an unavailable state when overview balance-sheet fields are missing', () => {
        render(<StockBalanceSheetHealth stockData={{summary: {Symbol: 'EMPTY'}}} />);

        expect(screen.getByText(/cash, debt, and liquidity data are not available/i)).toBeInTheDocument();
    });
});
