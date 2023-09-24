import React from 'react';
import "../../index.css"

const StockChart = ({ stockData }) => {

    const { summary } = stockData;

    return (
        <div className="flex justify-center mx-10">
            {summary && (
                <>
                    <iframe
                        title="market-overview"
                        style={{boxSizing: "border-box", display: "block", height: "450px", width: "100%", borderRadius: "10px"}}
                        src={`https://s.tradingview.com/embed-widget/mini-symbol-overview/?symbol=${"NYSE:"+summary.Symbol}&trendLineColor=rgba(255,255,255,1)&underLineColor=rgba(255,255,255,0.3)&underLineBottomColor=rgba(255,255,255,0)#%7B%22colorTheme%22%3A%22dark%22%2C%22dateRange%22%3A%223M%22%2C%22largeChartUrl%22%3A%22%22%2C%22isTransparent%22%3Afalse%2C%22showSymbolLogo%22%3Atrue%2C%22symbol%22%3A%22AMEX%3ASPY%22%2C%22width%22%3A%22100%25%22%7D`}
                    ></iframe>
                </>
            )}
        </div>
    );
};

export default StockChart;