import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import StockGrowthMomentum, {buildGrowthMomentumProfile} from './StockGrowthMomentum';

const stockData = {
    summary: {
        Symbol: 'GROW',
        QuarterlyRevenueGrowthYOY: '0.18',
        QuarterlyEarningsGrowthYOY: '0.30',
        RevenueTTM: '10000000000',
        MarketCapitalization: '30000000000',
        SharesOutstanding: '1000000000',
    },
};

describe('StockGrowthMomentum', () => {
    it('derives the growth spread, sales multiple, and margin-expansion label', () => {
        const profile = buildGrowthMomentumProfile(stockData.summary);

        expect(profile).toMatchObject({
            growthSpread: 0.12,
            label: 'Expanding margins',
            revenuePerShare: 10,
            salesMultiple: 3,
        });
    });

    it('flags positive revenue growth with falling earnings as margin pressure', () => {
        expect(buildGrowthMomentumProfile({
            QuarterlyRevenueGrowthYOY: '0.12',
            QuarterlyEarningsGrowthYOY: '-0.08',
        }).label).toBe('Margin pressure');
    });

    it('renders metrics and a data-aware empty state', () => {
        const {rerender} = render(<StockGrowthMomentum stockData={stockData} />);

        expect(screen.getByRole('heading', {name: 'Growth Momentum'})).toBeInTheDocument();
        expect(screen.getByText('Sales multiple')).toBeInTheDocument();
        expect(screen.getByText('$10.00')).toBeInTheDocument();

        rerender(<StockGrowthMomentum stockData={{summary: {Symbol: 'EMPTY'}}} />);

        expect(screen.getByText(/revenue and quarterly growth data are not available/i)).toBeInTheDocument();
    });
});
