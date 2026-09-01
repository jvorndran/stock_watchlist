import {buildPlanCapacitySnapshot, buildResearchPriority, getWorkflowState, matchesTradePlanDirection, normalizeResearchSnapshot, summarizePlanScenario, summarizeTradePlanByTag, summarizeTradePlanExposure} from './Watchlist';

describe('matchesTradePlanDirection', () => {
    const plans = {
        LONG: {entry: 100, stop: 90, target: 125},
        SHORT: {entry: 100, stop: 110, target: 75},
        INVALID: {entry: 100, stop: 100, target: 125},
    };

    it('isolates valid long and short setups while keeping invalid or absent levels in the planning queue', () => {
        expect(matchesTradePlanDirection('LONG', plans, 100, 'long')).toBe(true);
        expect(matchesTradePlanDirection('LONG', plans, 100, 'short')).toBe(false);
        expect(matchesTradePlanDirection('SHORT', plans, 100, 'short')).toBe(true);
        expect(matchesTradePlanDirection('INVALID', plans, 100, 'unplanned')).toBe(true);
        expect(matchesTradePlanDirection('MISSING', plans, 100, 'unplanned')).toBe(true);
        expect(matchesTradePlanDirection('MISSING', plans, 100, 'all')).toBe(true);
    });
});

describe('getWorkflowState', () => {
    it('flags saved plans that are invalid or below the 2R quality threshold', () => {
        expect(getWorkflowState('LOWR', {LOWR: 'Thesis'}, {
            LOWR: {entry: 100, stop: 95, target: 107},
        }, 100)).toMatchObject({hasPlan: true, hasValidPlan: true, hasQualityPlan: false, ready: true});

        expect(getWorkflowState('QUALITY', {QUALITY: 'Thesis'}, {
            QUALITY: {entry: 100, stop: 95, target: 112},
        }, 100)).toMatchObject({hasPlan: true, hasValidPlan: true, hasQualityPlan: true, ready: true});

        expect(getWorkflowState('BROKEN', {}, {
            BROKEN: {entry: 100, stop: 100, target: 112},
        }, 100)).toMatchObject({hasPlan: true, hasValidPlan: false, hasQualityPlan: false});
    });
});

describe('buildResearchPriority', () => {
    it('ranks a missing thesis and plan above prepared research', () => {
        const unprepared = buildResearchPriority('UNPREPARED', {}, {}, 100);
        const prepared = buildResearchPriority('PREPARED', {PREPARED: 'A documented thesis'}, {
            PREPARED: {entry: 100, stop: 95, target: 112},
        }, 100);

        expect(unprepared).toMatchObject({
            action: 'Write a thesis',
            issueCount: 2,
            score: 7,
            symbol: 'UNPREPARED',
        });
        expect(prepared).toMatchObject({
            action: 'Research complete',
            issueCount: 0,
            score: 0,
        });
    });

    it('surfaces malformed plans before lower reward/risk concerns', () => {
        const invalidPlan = buildResearchPriority('BROKEN', {BROKEN: 'Needs a valid setup'}, {
            BROKEN: {entry: 25, stop: 25, target: 35},
        }, 100);
        const lowReward = buildResearchPriority('LOWR', {LOWR: 'Has a plan'}, {
            LOWR: {entry: 100, stop: 95, target: 107},
        }, 100);

        expect(invalidPlan).toMatchObject({action: 'Repair the trade plan', score: 5});
        expect(lowReward).toMatchObject({action: 'Review reward/risk', score: 2});
    });
});

describe('summarizeTradePlanExposure', () => {
    it('combines long and short plans into portfolio exposure totals', () => {
        const exposure = summarizeTradePlanExposure(['LONG', 'SHORT'], {
            LONG: {entry: 100, stop: 95, target: 110},
            SHORT: {entry: 50, stop: 55, target: 40},
        }, 100);

        expect(exposure).toMatchObject({
            longCapital: 2000,
            longPlans: 1,
            netDirectionalCapital: 1000,
            shortCapital: 1000,
            shortPlans: 1,
            totalCapital: 3000,
            totalReward: 400,
            totalRisk: 200,
            validPlans: 2,
            weightedRewardMultiple: 2,
        });
        expect(exposure.largestPosition).toEqual({symbol: 'LONG', capital: 2000});
        expect(exposure.largestPositionShare).toBeCloseTo(2 / 3);
        expect(exposure.longCapitalShare).toBeCloseTo(2 / 3);
    });

    it('counts invalid saved plans without including them in totals', () => {
        const exposure = summarizeTradePlanExposure(['GOOD', 'INVALID', 'EMPTY'], {
            GOOD: {entry: 25, stop: 20, target: 35},
            INVALID: {entry: 25, stop: 25, target: 35},
        }, 50);

        expect(exposure.invalidPlans).toBe(1);
        expect(exposure.validPlans).toBe(1);
        expect(exposure.totalCapital).toBe(250);
        expect(exposure.totalRisk).toBe(50);
        expect(exposure.totalReward).toBe(100);
    });

    it('returns an empty exposure summary when no visible plans are saved', () => {
        expect(summarizeTradePlanExposure(['AAPL'], {}, 100)).toMatchObject({
            largestPosition: null,
            netDirectionalCapital: 0,
            totalCapital: 0,
            totalReward: 0,
            totalRisk: 0,
            validPlans: 0,
            weightedRewardMultiple: 0,
        });
    });
});

describe('summarizeTradePlanByTag', () => {
    it('groups valid tagged plans while keeping multi-tag symbols visible in each theme', () => {
        const summaries = summarizeTradePlanByTag(['CORE', 'EARNINGS', 'BROKEN'], {
            CORE: {entry: 100, stop: 90, target: 130},
            EARNINGS: {entry: 50, stop: 45, target: 65},
            BROKEN: {entry: 100, stop: 100, target: 130},
        }, {
            CORE: ['core', 'income'],
            EARNINGS: ['earnings'],
            BROKEN: ['earnings'],
        }, 100);

        expect(summaries).toEqual(expect.arrayContaining([
            expect.objectContaining({key: 'core', symbolCount: 1, validPlans: 1, capital: 1000, plannedRisk: 100, weightedRewardMultiple: 3}),
            expect.objectContaining({key: 'income', symbolCount: 1, validPlans: 1, capital: 1000}),
            expect.objectContaining({key: 'earnings', symbolCount: 2, validPlans: 1, invalidPlans: 1, plannedRisk: 100, weightedRewardMultiple: 3}),
        ]));
    });
});

describe('buildPlanCapacitySnapshot', () => {
    it('reports remaining capacity and modeled risk for plans within the portfolio value', () => {
        const snapshot = buildPlanCapacitySnapshot({totalCapital: 6000, totalRisk: 300}, 10000);

        expect(snapshot).toMatchObject({
            capitalOverage: 0,
            capitalRemaining: 4000,
            capitalUtilization: 0.6,
            hasPortfolioValue: true,
            riskPercent: 0.03,
            status: 'open',
        });
    });

    it('flags over-capacity plans and handles a missing portfolio value', () => {
        expect(buildPlanCapacitySnapshot({totalCapital: 12000, totalRisk: 600}, 10000)).toMatchObject({
            capitalOverage: 2000,
            capitalRemaining: 0,
            capitalUtilization: 1.2,
            riskPercent: 0.06,
            status: 'over',
        });
        expect(buildPlanCapacitySnapshot({totalCapital: 12000, totalRisk: 600}, 0)).toMatchObject({
            hasPortfolioValue: false,
            status: 'unavailable',
        });
    });
});

describe('summarizePlanScenario', () => {
    const plans = {
        LONG: {entry: 100, stop: 90, target: 130},
        SHORT: {entry: 100, stop: 110, target: 70},
        INVALID: {entry: 50, stop: 50, target: 70},
    };

    it('models the combined loss when every valid plan exits at its stop', () => {
        expect(summarizePlanScenario(['LONG', 'SHORT', 'INVALID'], plans, 100, 'stop')).toMatchObject({
            invalidPlans: 1,
            outcomeMultiple: -1,
            scenario: 'stop',
            totalOutcome: -200,
            totalRisk: 200,
            validPlans: 2,
        });
    });

    it('models partial and full target outcomes for both long and short plans', () => {
        expect(summarizePlanScenario(['LONG', 'SHORT'], plans, 100, 'midpoint')).toMatchObject({
            outcomeMultiple: 1.5,
            totalOutcome: 300,
            totalReward: 600,
        });
        expect(summarizePlanScenario(['LONG', 'SHORT'], plans, 100, 'target')).toMatchObject({
            outcomeMultiple: 3,
            totalOutcome: 600,
            totalReward: 600,
        });
    });
});

describe('normalizeResearchSnapshot', () => {
    it('keeps a complete research backup ready for account restoration', () => {
        expect(normalizeResearchSnapshot({
            watchlist: [' aapl ', 'MSFT'],
            notes: {aapl: 'Compounder thesis'},
            tags: {MSFT: ['core', 'income']},
            tradePlans: {AAPL: {entry: 200, stop: 190, target: 225}},
        })).toEqual({
            watchlist: ['AAPL', 'MSFT'],
            notes: {AAPL: 'Compounder thesis'},
            tags: {MSFT: ['core', 'income']},
            tradePlans: {AAPL: {entry: 200, stop: 190, target: 225}},
        });
    });

    it('rejects backups with unknown symbols, tags, or invalid trade-plan levels', () => {
        expect(normalizeResearchSnapshot({
            watchlist: ['AAPL'],
            notes: {MSFT: 'Not included'},
        })).toBeNull();
        expect(normalizeResearchSnapshot({
            watchlist: ['AAPL'],
            tags: {AAPL: ['unsupported']},
        })).toBeNull();
        expect(normalizeResearchSnapshot({
            watchlist: ['AAPL'],
            tradePlans: {AAPL: {entry: 100, stop: 100, target: 110}},
        })).toBeNull();
    });
});
