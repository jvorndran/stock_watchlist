import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import StockEarningsCashBridge, {buildEarningsCashBridge} from './StockEarningsCashBridge';

describe('StockEarningsCashBridge', () => {
    it('derives per-share cash coverage for positive earnings', () => {
        const bridge = buildEarningsCashBridge({
            EPS: '2',
            OperatingCashflow: '3000',
            FreeCashflow: '2400',
            SharesOutstanding: '1000',
        });

        expect(bridge).toMatchObject({
            freeCashFlowCoverage: 1.2,
            freeCashFlowPerShare: 2.4,
            label: 'Cash-backed earnings',
            operatingCashFlowCoverage: 1.5,
        });
        expect(bridge.cashEarningsGap).toBeCloseTo(0.4);
    });

    it('recognizes a cash-positive company despite a reported loss', () => {
        const bridge = buildEarningsCashBridge({
            EPS: '-1',
            FreeCashflow: '300',
            SharesOutstanding: '100',
        });

        expect(bridge.label).toBe('Cash-positive turnaround');
        expect(bridge.freeCashFlowPerShare).toBe(3);
    });

    it('renders the bridge and the unavailable-data state', () => {
        const {rerender} = render(<StockEarningsCashBridge stockData={{summary: {
            Symbol: 'CASH', EPS: '2', OperatingCashflow: '3000', FreeCashflow: '2400', SharesOutstanding: '1000',
        }}} />);

        expect(screen.getByRole('heading', {name: 'Earnings-to-Cash Bridge'})).toBeInTheDocument();
        expect(screen.getByText('Free cash flow / EPS')).toBeInTheDocument();

        rerender(<StockEarningsCashBridge stockData={{summary: {Symbol: 'EMPTY'}}} />);

        expect(screen.getByText(/EPS, cash flow, and shares-outstanding data are not available/i)).toBeInTheDocument();
    });
});
