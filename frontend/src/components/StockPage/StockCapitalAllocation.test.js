import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import StockCapitalAllocation, {buildCapitalAllocationProfile} from './StockCapitalAllocation';

const stockData = {
    summary: {
        Symbol: 'CASH',
        FreeCashflow: '1200000000',
        DividendPerShare: '1.5',
        SharesOutstanding: '400000000',
        TotalCash: '3000000000',
        TotalDebt: '1000000000',
        MarketCapitalization: '20000000000',
    },
};

describe('StockCapitalAllocation', () => {
    it('connects free cash flow with estimated dividends and funding capacity', () => {
        const profile = buildCapitalAllocationProfile(stockData.summary);

        expect(profile).toMatchObject({
            dividendCommitment: 600000000,
            dividendCoverage: 2,
            label: 'Funded flexibility',
            netCash: 2000000000,
            retainedCashFlow: 600000000,
        });
    });

    it('flags dividends that exceed reported free cash flow', () => {
        expect(buildCapitalAllocationProfile({
            FreeCashflow: '100',
            DividendPerShare: '2',
            SharesOutstanding: '100',
        }).label).toBe('Dividend coverage watch');
    });

    it('renders the allocation view and its unavailable-data state', () => {
        const {rerender} = render(<StockCapitalAllocation stockData={stockData} />);

        expect(screen.getByRole('heading', {name: 'Capital Allocation'})).toBeInTheDocument();
        expect(screen.getByText('Estimated dividend commitment')).toBeInTheDocument();
        expect(screen.getAllByText('$600.0M')).toHaveLength(2);

        rerender(<StockCapitalAllocation stockData={{summary: {Symbol: 'EMPTY'}}} />);

        expect(screen.getByText(/cash flow, dividend, and balance-sheet fields are not available/i)).toBeInTheDocument();
    });
});
