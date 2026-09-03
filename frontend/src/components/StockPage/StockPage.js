import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import StockChart from './StockChart';
import StockNews from './StockNews';
import StockStatistics from './StockStatistics';
import StockSubHeader from './StockSubHeader';
import StockPageHeader from "./StockPageHeader";
import StockInsights from './StockInsights';
import StockTargetPanel from './StockTargetPanel';
import StockScorecard from './StockScorecard';
import StockIncomePanel from './StockIncomePanel';
import StockRiskChecklist from './StockRiskChecklist';
import StockTrendPanel from './StockTrendPanel';
import StockValuationPlanner from './StockValuationPlanner';
import StockPositionPlanner from './StockPositionPlanner';
import StockAnalystConsensus from './StockAnalystConsensus';
import StockProfitabilityPanel from './StockProfitabilityPanel';
import StockShortInterestPanel from './StockShortInterestPanel';
import StockCompanyProfile from './StockCompanyProfile';
import StockEarningsOutlook from './StockEarningsOutlook';
import StockBalanceSheetHealth from './StockBalanceSheetHealth';
import StockCashFlowPanel from './StockCashFlowPanel';
import StockEarningsCashBridge from './StockEarningsCashBridge';
import StockGrowthMomentum from './StockGrowthMomentum';
import StockEnterpriseValueLens from './StockEnterpriseValueLens';
import StockCapitalAllocation from './StockCapitalAllocation';
import StockMultipleDashboard from './StockMultipleDashboard';
import StockOwnershipProfile from './StockOwnershipProfile';
import StockResearchBrief from './StockResearchBrief';
import "../../index.css"

const StockPage = () => {
    const { stock_ticker } = useParams();
    const [stockData, setStockData] = useState(null);


    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch stock data from the server
                const response = await fetch(`https://findashboard-api.onrender.com/dash/${stock_ticker}`);
                const data = await response.json();
                setStockData(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();

    }, [stock_ticker]);

    return (
        <div>
            {stockData && (
                <>
                    <StockPageHeader stockData={stockData} />

                    {/*<div className="grid-cols-2 bg-gray-500">*/}

                    <StockSubHeader stockData={stockData} />

                    {/*</div>*/}

                    <StockCompanyProfile stockData={stockData} />

                    <StockOwnershipProfile stockData={stockData} />

                    <StockInsights stockData={stockData} />

                    <StockEarningsOutlook stockData={stockData} />

                    <StockBalanceSheetHealth stockData={stockData} />

                    <StockCashFlowPanel stockData={stockData} />

                    <StockEarningsCashBridge stockData={stockData} />

                    <StockCapitalAllocation stockData={stockData} />

                    <StockEnterpriseValueLens stockData={stockData} />

                    <StockMultipleDashboard stockData={stockData} />

                    <StockGrowthMomentum stockData={stockData} />

                    <StockTrendPanel stockData={stockData} />

                    <StockTargetPanel stockData={stockData} />

                    <StockAnalystConsensus stockData={stockData} />

                    <StockShortInterestPanel stockData={stockData} />

                    <StockScorecard stockData={stockData} />

                    <StockResearchBrief key={stockData.summary.Symbol} stockData={stockData} />

                    <StockProfitabilityPanel stockData={stockData} />

                    <StockPositionPlanner key={stockData.summary.Symbol} stockData={stockData} />

                    <StockValuationPlanner key={stockData.summary.Symbol} stockData={stockData} />

                    <StockRiskChecklist stockData={stockData} />

                    <StockIncomePanel key={stockData.summary.Symbol} stockData={stockData} />

                    <StockChart stockData={stockData} />


                    <StockStatistics stockData={stockData} />

                    <div className="rounded-3xl p-2" style={newsContainer}>

                        <StockNews stockData={stockData} />

                    </div>
                </>
            )}
        </div>
    );
};

const newsContainer = {
    background: "#22232d",
    marginLeft: "10vw",
    marginRight: "10vw"
}

export default StockPage;

