import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import StockIncomePanel, {calculateDividendReinvestment} from './StockIncomePanel';

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
    it('compounds dividend payments into additional shares over the selected horizon', () => {
        const projection = calculateDividendReinvestment({
            dividendGrowth: 0,
            dividendPerShare: 2,
            initialShares: 100,
            priceGrowth: 0,
            projectionYears: 2,
            referencePrice: 100,
        });

        expect(projection).not.toBeNull();
        expect(projection.annualIncomeAtHorizon).toBeCloseTo(208.08);
        expect(projection.cumulativeDividends).toBeCloseTo(404);
        expect(projection.endingPrice).toBeCloseTo(100);
        expect(projection.endingValue).toBeCloseTo(10404);
        expect(projection.sharesAdded).toBeCloseTo(4.04);
        expect(projection.totalShares).toBeCloseTo(104.04);
    });

    it('rejects reinvestment scenarios without a usable share price', () => {
        expect(calculateDividendReinvestment({
            dividendGrowth: 5,
            dividendPerShare: 2,
            initialShares: 100,
            priceGrowth: 4,
            projectionYears: 5,
            referencePrice: 0,
        })).toBeNull();
    });

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
