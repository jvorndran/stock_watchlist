import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import StockValuationPlanner, {buildValuationSensitivity} from './StockValuationPlanner';

describe('StockValuationPlanner', () => {
    it('builds a growth and multiple sensitivity matrix from the active assumptions', () => {
        const matrix = buildValuationSensitivity({
            annualGrowth: 10,
            baseEps: 5,
            currentPrice: 100,
            targetMultiple: 20,
            years: 2,
        });

        expect(matrix).toHaveLength(3);
        expect(matrix[1].annualGrowth).toBe(10);
        expect(matrix[1].scenarios[1]).toMatchObject({targetMultiple: 20});
        expect(matrix[1].scenarios[1].scenario.targetValue).toBeCloseTo(121);
        expect(matrix[1].scenarios[1].scenario.annualizedReturn).toBeCloseTo(0.1);
    });

    it('returns no matrix without a valid growth or multiple assumption', () => {
        expect(buildValuationSensitivity({annualGrowth: -100, targetMultiple: 20})).toEqual([]);
        expect(buildValuationSensitivity({annualGrowth: 10, targetMultiple: 0})).toEqual([]);
    });

    it('renders the sensitivity table from company data', () => {
        render(<StockValuationPlanner stockData={{summary: {
            Symbol: 'VALUE', EPS: '5', ForwardPE: '20', PERatio: '20', QuarterlyEarningsGrowthYOY: '0.1',
        }}} />);

        expect(screen.getByRole('heading', {name: 'Valuation Sensitivity'})).toBeInTheDocument();
        expect(screen.getByRole('columnheader', {name: 'Annual EPS growth'})).toBeInTheDocument();
    });
});
