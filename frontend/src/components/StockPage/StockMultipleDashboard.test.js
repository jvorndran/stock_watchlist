import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import StockMultipleDashboard, {buildMultipleProfile} from './StockMultipleDashboard';

const stockData = {
    summary: {
        Symbol: 'MULT',
        PERatio: '20',
        ForwardPE: '16',
        PEGRatio: '1.5',
        PriceToSalesRatioTTM: '4.2',
        PriceToBookRatio: '3.1',
        EVToRevenue: '4.5',
        EVToEBITDA: '12.4',
    },
};

describe('StockMultipleDashboard', () => {
    it('derives forward compression and earnings yields from reported multiples', () => {
        const profile = buildMultipleProfile(stockData.summary);

        expect(profile.label).toBe('Forward compression');
        expect(profile.earningsYield).toBeCloseTo(0.05);
        expect(profile.forwardEarningsYield).toBeCloseTo(0.0625);
        expect(profile.forwardPeChange).toBeCloseTo(-0.2);
    });

    it('renders both earnings and business value lenses', () => {
        render(<StockMultipleDashboard stockData={stockData} />);

        expect(screen.getByRole('heading', {name: 'Valuation Multiple Dashboard'})).toBeInTheDocument();
        expect(screen.getByText('Forward compression')).toBeInTheDocument();
        expect(screen.getByText('Earnings Lens')).toBeInTheDocument();
        expect(screen.getByText('Business Value Lens')).toBeInTheDocument();
        expect(screen.getByText('+5.0%')).toBeInTheDocument();
        expect(screen.getByText('12.4x')).toBeInTheDocument();
    });

    it('shows an empty state without valuation data', () => {
        render(<StockMultipleDashboard stockData={{summary: {Symbol: 'EMPTY'}}} />);

        expect(screen.getByText(/valuation multiples are not available/i)).toBeInTheDocument();
    });
});
