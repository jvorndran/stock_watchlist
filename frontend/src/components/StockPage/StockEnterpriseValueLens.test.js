import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import StockEnterpriseValueLens, {buildEnterpriseValueProfile} from './StockEnterpriseValueLens';

const stockData = {
    summary: {
        Symbol: 'VALUE',
        RevenueTTM: '10000000000',
        EBITDA: '2000000000',
        MarketCapitalization: '25000000000',
        EVToRevenue: '3',
        EVToEBITDA: '15',
    },
};

describe('StockEnterpriseValueLens', () => {
    it('derives multiple-based enterprise value and the premium to equity value', () => {
        const profile = buildEnterpriseValueProfile(stockData.summary);

        expect(profile).toMatchObject({
            estimatedEnterpriseValue: 30000000000,
            label: 'Mid-range multiple',
            revenueBasedEstimate: 30000000000,
            ebitdaBasedEstimate: 30000000000,
        });
        expect(profile.financingPremium).toBeCloseTo(0.2);
    });

    it('flags high reported EV multiples as a premium multiple', () => {
        expect(buildEnterpriseValueProfile({EVToRevenue: '9'}).label).toBe('Premium multiple');
    });

    it('renders the valuation context and an unavailable-data state', () => {
        const {rerender} = render(<StockEnterpriseValueLens stockData={stockData} />);

        expect(screen.getByRole('heading', {name: 'Enterprise Value Lens'})).toBeInTheDocument();
        expect(screen.getByText('Estimated enterprise value')).toBeInTheDocument();
        expect(screen.getByText('$30.0B')).toBeInTheDocument();

        rerender(<StockEnterpriseValueLens stockData={{summary: {Symbol: 'EMPTY'}}} />);

        expect(screen.getByText(/enterprise value multiples are not available/i)).toBeInTheDocument();
    });
});
