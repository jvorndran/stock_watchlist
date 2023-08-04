import React, {memo, useEffect, useState} from 'react';
import axios from "axios";

const DashIndices = () => {

    // const [priceData, setPriceData] = useState({});
    //
    // useEffect(() => {
    //
    //     axios.get('http://localhost:3500/api/indices')
    //         .then(response => {
    //             const priceDataObj = response.data
    //             setPriceData(priceDataObj)
    //             console.log(priceDataObj)
    //         })
    //         .catch(error => {
    //             console.error(error)
    //         })
    //
    //
    // }, [])


    const chartGrid = {
        marginBottom: '20px',
        marginTop: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1vw',
        paddingLeft: "3vw",
        paddingRight: "3vw",
        justifyContent: 'space-evenly',
        justifyItems: 'center',
        alignContent: 'space-evenly',
        alignItems: 'center'
    };

    return (

        <div style={chartGrid}>
            <iframe
                title="market-overview"
                style={{boxSizing: "border-box", display: "block", height: "350px", width: "95%", borderRadius: "10px", border: "1px solid black", marginLeft: "20px", marginRight: "20px"}}
                src={`https://s.tradingview.com/embed-widget/mini-symbol-overview/?symbol=QQQ&trendLineColor=rgba(255,255,255,1)&underLineColor=rgba(255,255,255,0.3)&underLineBottomColor=
                    rgba(255,255,255,0)&largeChartUrl=http://localhost:3000/dash/QQQ#%7B%22colorTheme%22%3A%22dark%22%2C%22dateRange%22%3A%223M%22%2C%22largeChartUrl%22%3A%22%22%2C%22isTransparent
                    %22%3Afalse%2C%22showSymbolLogo%22%3Atrue%2C%22symbol%22%3A%22AMEX%3ASPY%22%2C%22width%22%3A%22100%25%22%7D`}
            ></iframe>

            <iframe title="market-overview"
                    style={{boxSizing: "border-box", display: "block", height: "350px", width: "95%", borderRadius: "10px", border: "1px solid black",marginLeft: "20px", marginRight: "20px"}}
                    src="https://s.tradingview.com/embed-widget/mini-symbol-overview/?symbol=DIA&trendLineColor=rgba(255,255,255,1)&underLineColor=rgba(255,255,255,0.3)&
                    underLineBottomColor=rgba(255,255,255,0)#%7B%22colorTheme%22%3A%22dark%22%2C%22dateRange%22%3A%223M%22%2C%22largeChartUrl%22%3A%22%22%2C%22isTransparent
                    %22%3Afalse%2C%22showSymbolLogo%22%3Atrue%2C%22
                    symbol%22%3A%22AMEX%3ASPY%22%2C%22width%22%3A%22100%25%22%7D"
                    >

            </iframe>

            <iframe title="market-overview"
                    style={{boxSizing: "border-box", display: "block", height: "350px", width: "95%", borderRadius: "10px", border: "1px solid black", marginLeft: "20px", marginRight: "20px"}}
                    src="https://s.tradingview.com/embed-widget/mini-symbol-overview/?symbol=IWM&trendLineColor=rgba(255,255,255,1)&underLineColor=rgba(255,255,255,0.3)&underLineBottomColor=rgba(255,255,255,0)#%7B%22colorTheme%22%3A%22dark%22%2C%22dateRange%22%3A%223M%22%2C%22
                    largeChartUrl%22%3A%22%22%2C%22isTransparent%22%3Afalse%2C%22showSymbolLogo%22%3Atrue%2C%22
                    symbol%22%3A%22AMEX%3ASPY%22%2C%22width%22%3A%22100%25%22%7D"
                    >

            </iframe>
            <iframe title="market-overview"
                    style={{boxSizing: "border-box", display: "block", height: "350px", width: "95%", borderRadius: "10px", marginLeft: "20px", marginRight: "20px"}}
                    src="https://s.tradingview.com/embed-widget/mini-symbol-overview/?symbol=SPY&trendLineColor=rgba(255,255,255,1)&underLineColor=rgba(255,255,255,0.3)&underLineBottomColor=rgba(255,255,255,0)#%7B%22colorTheme%22%3A%22dark%22%2C%22dateRange%22%3A%223M%22%2C%22
                    largeChartUrl%22%3A%22%22%2C%22isTransparent%22%3Afalse%2C%22showSymbolLogo%22%3Atrue%2C%22
                    width%22%3A%22100%25%22%7D"
                    >

            </iframe>

        </div>

    );

};



export default memo(DashIndices);