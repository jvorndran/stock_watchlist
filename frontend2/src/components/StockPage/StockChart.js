import React from 'react';
import "../../index.css"

const StockChart = ({ stockData }) => {

    const { summary } = stockData;

    const widgetConfig = {
        symbol: "FX:EURUSD",
        width: 350,
        height: 220,
        locale: "en",
        dateRange: "12M",
        colorTheme: "dark",
        isTransparent: false,
        autosize: false,
        largeChartUrl: ""
    };

    return (
        <div className="flex justify-center">
            {summary && (
                <>
                    <iframe
                        title="market-overview"
                        style={{boxSizing: "border-box", display: "block", height: "600px", width: "95%", borderRadius: "10px", border: "1px solid black", marginLeft: "20px", marginRight: "20px"}}
                        src={`https://s.tradingview.com/embed-widget/mini-symbol-overview/?symbol=${"NYSE:"+summary.Symbol}&trendLineColor=rgba(255,255,255,1)&underLineColor=rgba(255,255,255,0.3)&underLineBottomColor=rgba(255,255,255,0)#%7B%22colorTheme%22%3A%22dark%22%2C%22dateRange%22%3A%223M%22%2C%22largeChartUrl%22%3A%22%22%2C%22isTransparent%22%3Afalse%2C%22showSymbolLogo%22%3Atrue%2C%22symbol%22%3A%22AMEX%3ASPY%22%2C%22width%22%3A%22100%25%22%7D`}
                    ></iframe>
                </>
            )}
        </div>
    );
};

export default StockChart;