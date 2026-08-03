import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import StockProfitabilityPanel, {buildProfitabilityProfile} from './StockProfitabilityPanel';

const stockData = {
    summary: {
        Symbol: 'TEST',
        RevenueTTM: '1000000000',
        GrossProfitTTM: '400000000',
        EBITDA: '200000000',
        OperatingMarginTTM: '0.18',
        ProfitMargin: '0.15',
        ReturnOnAssetsTTM: '0.08',
        ReturnOnEquityTTM: '0.20',
    },
};

describe('StockProfitabilityPanel', () => {
    it('derives margins, retention, and capital return gaps', () => {
        const profile = buildProfitabilityProfile(stockData.summary);

        expect(profile).toMatchObject({
            ebitdaMargin: 0.2,
            grossMargin: 0.4,
            label: 'High-return profile',
        });
        expect(profile.marginRetention).toBeCloseTo(0.375);
        expect(profile.returnGap).toBeCloseTo(0.12);
    });

    it('renders the profitability ladder and capital returns', () => {
        render(<StockProfitabilityPanel stockData={stockData} />);

        expect(screen.getByRole('heading', {name: 'Profitability Quality'})).toBeInTheDocument();
        expect(screen.getByText('High-return profile')).toBeInTheDocument();
        expect(screen.getByRole('img', {name: 'Gross margin +40.0%'})).toBeInTheDocument();
        expect(screen.getByText('+37.5%')).toBeInTheDocument();
        expect(screen.getByText('$1.0B')).toBeInTheDocument();
    });

    it('flags negative operating economics as margin pressure', () => {
        expect(buildProfitabilityProfile({
            OperatingMarginTTM: '-0.05',
            ProfitMargin: '-0.1',
            ReturnOnAssetsTTM: '-0.03',
        }).label).toBe('Margin pressure');
    });

    it('shows an empty state when profitability data is unavailable', () => {
        render(<StockProfitabilityPanel stockData={{summary: {Symbol: 'EMPTY'}}} />);

        expect(screen.getByText(/capital-return data are not available/i)).toBeInTheDocument();
    });
});
