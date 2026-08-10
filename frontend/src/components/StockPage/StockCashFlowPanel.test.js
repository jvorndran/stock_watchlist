import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import StockCashFlowPanel, {buildCashFlowProfile} from './StockCashFlowPanel';

const stockData = {
    summary: {
        Symbol: 'CASH',
        RevenueTTM: '10000000000',
        OperatingCashflow: '2200000000',
        FreeCashflow: '1500000000',
        MarketCapitalization: '15000000000',
        SharesOutstanding: '1000000000',
    },
};

describe('StockCashFlowPanel', () => {
    it('derives cash conversion, yield, and strong-generation context', () => {
        const profile = buildCashFlowProfile(stockData.summary);

        expect(profile).toMatchObject({
            cashInvestment: 700000000,
            freeCashFlowMargin: 0.15,
            freeCashFlowYield: 0.1,
            label: 'Strong cash generation',
        });
    });

    it('flags negative free cash flow after positive operating cash flow', () => {
        const profile = buildCashFlowProfile({
            OperatingCashflow: '500',
            FreeCashflow: '-120',
        });

        expect(profile.label).toBe('Free cash flow pressure');
    });

    it('renders cash-flow metrics and an unavailable-data state', () => {
        const {rerender} = render(<StockCashFlowPanel stockData={stockData} />);

        expect(screen.getByRole('heading', {name: 'Cash Flow Quality'})).toBeInTheDocument();
        expect(screen.getByText('Free cash conversion')).toBeInTheDocument();

        rerender(<StockCashFlowPanel stockData={{summary: {Symbol: 'EMPTY'}}} />);

        expect(screen.getByText(/operating cash flow, free cash flow, and revenue data are not available/i)).toBeInTheDocument();
    });
});
