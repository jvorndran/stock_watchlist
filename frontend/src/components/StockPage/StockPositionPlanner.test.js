import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import StockPositionPlanner, {calculatePositionPlan} from './StockPositionPlanner';

const stockData = {
    summary: {
        Symbol: 'TEST',
        '50DayMovingAverage': '100',
        '52WeekLow': '80',
        '52WeekHigh': '120',
    },
};

describe('StockPositionPlanner', () => {
    it('sizes shares from the risk budget and stop distance', () => {
        expect(calculatePositionPlan({
            accountSize: 10000,
            riskPercent: 1,
            entry: 100,
            stop: 95,
            target: 110,
        })).toMatchObject({
            capitalRequired: 2000,
            plannedReward: 200,
            plannedRisk: 100,
            rewardMultiple: 2,
            riskBudget: 100,
            shares: 20,
        });
    });

    it('updates the share plan when risk changes', () => {
        render(<StockPositionPlanner stockData={stockData} />);

        expect(screen.getByText('31 shares long')).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('Risk Per Trade'), {target: {value: '2'}});

        expect(screen.getByText('62 shares long')).toBeInTheDocument();
        expect(screen.getByText('$496.00')).toBeInTheDocument();
    });

    it('rejects a stop above the entry', () => {
        expect(calculatePositionPlan({
            accountSize: 10000,
            riskPercent: 1,
            entry: 100,
            stop: 101,
            target: 110,
        })).toBeNull();
    });

    it('sizes a short position with the stop above entry', () => {
        expect(calculatePositionPlan({
            accountSize: 10000,
            riskPercent: 1,
            entry: 100,
            stop: 105,
            target: 90,
            direction: 'short',
        })).toMatchObject({
            capitalRequired: 2000,
            direction: 'short',
            plannedReward: 200,
            plannedRisk: 100,
            rewardMultiple: 2,
            shares: 20,
        });
    });

    it('switches the planner to direction-aware short defaults', () => {
        render(<StockPositionPlanner stockData={stockData} />);

        fireEvent.click(screen.getByRole('button', {name: 'Short'}));

        expect(screen.getByText('Stop above entry; target below entry.')).toBeInTheDocument();
        expect(screen.getByLabelText('Stop Price')).toHaveValue(108);
        expect(screen.getByLabelText('Target Price')).toHaveValue(84);
        expect(screen.getByText('31 shares short')).toBeInTheDocument();
    });
});
