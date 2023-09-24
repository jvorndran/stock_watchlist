import React from 'react';
import '../../index.css';
import '../style/stock-statistics-style.css'

export const formatNumber = (number) => {

    let parsedInt;

    try{
        parsedInt = parseFloat(number)
    }
    catch (error){
        return "-";
    }

    return parsedInt.toLocaleString()
}

const StockStatistics = ({ stockData }) => {

    const { summary } = stockData;



    return (
        <div className="gap-4 rounded-2xl my-4 mx-10 p-2 text-white statistics-container">

            <div className="mx-1">
                <p className="mt-2 flex"><strong>Price to Earnings:</strong><span className="ml-auto">{summary.PERatio}</span> </p>
                <p className="mt-2 flex"><strong>Forward Price to Earnings:</strong><span className="ml-auto">{summary.ForwardPE}</span></p>
                <p className="mt-2 flex"><strong>Price to Sales:</strong><span className="ml-auto">{summary.PriceToSalesRatioTTM}</span></p>
                <p className="mt-2 flex"><strong>PEG Ratio:</strong><span className="ml-auto">{summary.PEGRatio}</span></p>
                <p className="mt-2 flex"><strong>Price to Book:</strong><span className="ml-auto">{summary.PriceToBookRatio}</span></p>
                <p className="mt-2 flex"><strong>EV/Revenue:</strong><span className="ml-auto">{summary.EVToRevenue}</span></p>
                <p className="mt-2 flex"><strong>EV/EBITA:</strong><span className="ml-auto">{summary.EVToEBITDA}</span></p>
            </div>

            <div className="mx-1">
                <p className="mt-2 flex"><strong>Analyst Price Target:</strong><span className="ml-auto">{summary.AnalystTargetPrice}</span> </p>
                <p className="mt-2 flex"><strong>Beta:</strong><span className="ml-auto">{summary.Beta}</span></p>
                <p className="mt-2 flex"><strong>Book Value:</strong><span className="ml-auto">{summary.BookValue}</span></p>
                <p className="mt-2 flex"><strong>Earnings Per Share:</strong><span className="ml-auto">{summary.EPS}</span></p>
                <p className="mt-2 flex"><strong>Gross Profit (TTM):</strong><span className="ml-auto">{formatNumber(summary.GrossProfitTTM * (10**-6))} M</span></p>
                <p className="mt-2 flex"><strong>Operating Margin:</strong><span className="ml-auto">{summary.OperatingMarginTTM}</span></p>
                <p className="mt-2 flex"><strong>Profit Margin:</strong><span className="ml-auto">{summary.ProfitMargin}</span></p>
            </div>

            <div className="mx-1">
                <p className="mt-2 flex"><strong>Earnings Growth YOY:</strong><span className="ml-auto">{summary.QuarterlyEarningsGrowthYOY}</span> </p>
                <p className="mt-2 flex"><strong>Revenue Growth YOY:</strong><span className="ml-auto">{summary.QuarterlyRevenueGrowthYOY}</span></p>
                <p className="mt-2 flex"><strong>Return on Assets:</strong><span className="ml-auto">{summary.ReturnOnAssetsTTM}</span></p>
                <p className="mt-2 flex"><strong>EBITDA:</strong><span className="ml-auto">{formatNumber(summary.EBITDA * (10**-6) )} M</span></p>
                <p className="mt-2 flex"><strong>Revenue Per Share:</strong><span className="ml-auto">{summary.RevenuePerShareTTM}</span></p>
                <p className="mt-2 flex"><strong>52 Week High:</strong><span className="ml-auto">{summary['52WeekHigh']}</span></p>
                <p className="mt-2 flex"><strong>52 Week Low:</strong><span className="ml-auto">{summary['52WeekLow']}</span></p>
            </div>

        </div>


    )
};



export default StockStatistics;
