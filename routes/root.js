const express = require('express');
const router = express.Router();
const path = require('path');
const request = require("request");
const alpha_api_key = 'ZUVY81MBX0E12LVI';

const url = `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${alpha_api_key}`;


// route regex for '/' or '/index' or '/index.html'
router.get('^/$|/index(.html)?/', (req, res) => {

    let data = {
        metadata: 'Top gainers, losers, and most actively traded US tickers',
        last_updated: '2023-07-07 16:16:00 US/Eastern',
        top_gainers: [
            {
                ticker: 'TDW+A',
                price: '2.67',
                change_amount: '1.98',
                change_percentage: '286.9565%',
                volume: '222417'
            },
            {
                ticker: 'PWM',
                price: '19.09',
                change_amount: '13.69',
                change_percentage: '253.5185%',
                volume: '28726108'
            },
            {
                ticker: 'TDW+B',
                price: '0.5',
                change_amount: '0.3501',
                change_percentage: '233.5557%',
                volume: '103279'
            },
            {
                ticker: 'MCAAW',
                price: '0.184',
                change_amount: '0.1239',
                change_percentage: '206.1564%',
                volume: '197696'
            },
            {
                ticker: 'PRLHW',
                price: '0.1476',
                change_amount: '0.0953',
                change_percentage: '182.218%',
                volume: '41810'
            },
            {
                ticker: 'EVE+',
                price: '0.1577',
                change_amount: '0.0893',
                change_percentage: '130.5556%',
                volume: '32535'
            },
            {
                ticker: 'GRRR',
                price: '4.7',
                change_amount: '2.61',
                change_percentage: '124.8804%',
                volume: '159511059'
            },
            {
                ticker: 'GLTA+',
                price: '0.16',
                change_amount: '0.0846',
                change_percentage: '112.2016%',
                volume: '232025'
            },
            {
                ticker: 'MBAC+',
                price: '0.0562',
                change_amount: '0.0256',
                change_percentage: '83.6601%',
                volume: '1100'
            },
            {
                ticker: 'WGSWW',
                price: '0.0186',
                change_amount: '0.0083',
                change_percentage: '80.5825%',
                volume: '3888'
            },
            {
                ticker: 'NVVEW',
                price: '0.095',
                change_amount: '0.0419',
                change_percentage: '78.9077%',
                volume: '64096'
            },
            {
                ticker: 'THCPW',
                price: '0.2951',
                change_amount: '0.1251',
                change_percentage: '73.5882%',
                volume: '6865'
            },
            {
                ticker: 'GDSTW',
                price: '0.0533',
                change_amount: '0.0223',
                change_percentage: '71.9355%',
                volume: '458'
            },
            {
                ticker: 'ACAQ+',
                price: '0.119',
                change_amount: '0.049',
                change_percentage: '70.0%',
                volume: '31947'
            },
            {
                ticker: 'TOIIW',
                price: '0.0365',
                change_amount: '0.0144',
                change_percentage: '65.1584%',
                volume: '84450'
            },
            {
                ticker: 'GRNAW',
                price: '0.0193',
                change_amount: '0.0073',
                change_percentage: '60.8333%',
                volume: '28951'
            },
            {
                ticker: 'INTEW',
                price: '0.1452',
                change_amount: '0.0538',
                change_percentage: '58.8621%',
                volume: '5424'
            },
            {
                ticker: 'WE+',
                price: '0.0189',
                change_amount: '0.0069',
                change_percentage: '57.5%',
                volume: '4000'
            },
            {
                ticker: 'BBIG',
                price: '1.88',
                change_amount: '0.68',
                change_percentage: '56.6667%',
                volume: '13594454'
            },
            {
                ticker: 'VERBW',
                price: '0.0233',
                change_amount: '0.0082',
                change_percentage: '54.3046%',
                volume: '1130'
            }
        ],
        top_losers: [
            {
                ticker: 'NCACW',
                price: '0.0051',
                change_amount: '-0.0133',
                change_percentage: '-72.2826%',
                volume: '14010'
            },
            {
                ticker: 'ASPAW',
                price: '0.0113',
                change_amount: '-0.0161',
                change_percentage: '-58.7591%',
                volume: '14400'
            },
            {
                ticker: 'EDTXW',
                price: '0.0415',
                change_amount: '-0.0361',
                change_percentage: '-46.5206%',
                volume: '89944'
            },
            {
                ticker: 'IVCAW',
                price: '0.0384',
                change_amount: '-0.0306',
                change_percentage: '-44.3478%',
                volume: '1966'
            },
            {
                ticker: 'CFFEW',
                price: '0.0323',
                change_amount: '-0.0245',
                change_percentage: '-43.1338%',
                volume: '2122'
            },
            {
                ticker: 'GSDWW',
                price: '0.0255',
                change_amount: '-0.0182',
                change_percentage: '-41.6476%',
                volume: '6505'
            },
            {
                ticker: 'GLLIW',
                price: '0.0174',
                change_amount: '-0.012',
                change_percentage: '-40.8163%',
                volume: '124056'
            },
            {
                ticker: 'JUN+',
                price: '0.0311',
                change_amount: '-0.021',
                change_percentage: '-40.3071%',
                volume: '5900'
            },
            {
                ticker: 'MOBVW',
                price: '0.0292',
                change_amount: '-0.0188',
                change_percentage: '-39.1667%',
                volume: '689'
            },
            {
                ticker: 'ARTLW',
                price: '0.05',
                change_amount: '-0.0307',
                change_percentage: '-38.0421%',
                volume: '1002'
            },
            {
                ticker: 'BROGW',
                price: '0.0183',
                change_amount: '-0.0112',
                change_percentage: '-37.9661%',
                volume: '5230'
            },
            {
                ticker: 'WAVSW',
                price: '0.0384',
                change_amount: '-0.0228',
                change_percentage: '-37.2549%',
                volume: '4625'
            },
            {
                ticker: 'FOXO',
                price: '0.1966',
                change_amount: '-0.1164',
                change_percentage: '-37.1885%',
                volume: '4566705'
            },
            {
                ticker: 'APACW',
                price: '0.02',
                change_amount: '-0.0117',
                change_percentage: '-36.9085%',
                volume: '32200'
            },
            {
                ticker: 'AGILW',
                price: '0.0446',
                change_amount: '-0.0249',
                change_percentage: '-35.8273%',
                volume: '400'
            },
            {
                ticker: 'LCAHW',
                price: '0.1053',
                change_amount: '-0.0587',
                change_percentage: '-35.7927%',
                volume: '5994'
            },
            {
                ticker: 'LIFWW',
                price: '0.0026',
                change_amount: '-0.0014',
                change_percentage: '-35.0%',
                volume: '29771'
            },
            {
                ticker: 'CMRAW',
                price: '0.0289',
                change_amount: '-0.0153',
                change_percentage: '-34.6154%',
                volume: '43933'
            },
            {
                ticker: 'OPAD+',
                price: '0.0131',
                change_amount: '-0.0069',
                change_percentage: '-34.5%',
                volume: '63800'
            },
            {
                ticker: 'BCDAW',
                price: '0.65',
                change_amount: '-0.34',
                change_percentage: '-34.3434%',
                volume: '4'
            }
        ],
        most_actively_traded: [
            {
                ticker: 'MULN',
                price: '0.1919',
                change_amount: '-0.0286',
                change_percentage: '-12.9705%',
                volume: '725533344'
            },
            {
                ticker: 'TTOO',
                price: '0.115',
                change_amount: '0.032',
                change_percentage: '38.5542%',
                volume: '278690536'
            },
            {
                ticker: 'RIVN',
                price: '24.7',
                change_amount: '3.08',
                change_percentage: '14.2461%',
                volume: '229884547'
            },
            {
                ticker: 'GRRR',
                price: '4.7',
                change_amount: '2.61',
                change_percentage: '124.8804%',
                volume: '159511059'
            },
            {
                ticker: 'TSLA',
                price: '274.43',
                change_amount: '-2.11',
                change_percentage: '-0.763%',
                volume: '113196445'
            },
            {
                ticker: 'SQQQ',
                price: '19.45',
                change_amount: '0.21',
                change_percentage: '1.0915%',
                volume: '96234848'
            },
            {
                ticker: 'SPY',
                price: '438.53',
                change_amount: '-1.13',
                change_percentage: '-0.257%',
                volume: '84512150'
            },
            {
                ticker: 'TQQQ',
                price: '39.87',
                change_amount: '-0.41',
                change_percentage: '-1.0179%',
                volume: '83529799'
            },
            {
                ticker: 'LCID',
                price: '7.45',
                change_amount: '0.37',
                change_percentage: '5.226%',
                volume: '75520003'
            },
            {
                ticker: 'MARA',
                price: '15.67',
                change_amount: '0.35',
                change_percentage: '2.2846%',
                volume: '60073842'
            },
            {
                ticker: 'F',
                price: '14.99',
                change_amount: '0.01',
                change_percentage: '0.0668%',
                volume: '53276829'
            },
            {
                ticker: 'CGC',
                price: '0.476',
                change_amount: '0.0512',
                change_percentage: '12.0527%',
                volume: '51325390'
            },
            {
                ticker: 'NIO',
                price: '9.99',
                change_amount: '0.43',
                change_percentage: '4.4979%',
                volume: '50552582'
            },
            {
                ticker: 'BJDX',
                price: '0.2849',
                change_amount: '0.0679',
                change_percentage: '31.2903%',
                volume: '49563935'
            },
            {
                ticker: 'NKLA',
                price: '1.41',
                change_amount: '0.11',
                change_percentage: '8.4615%',
                volume: '49085090'
            },
            {
                ticker: 'PLTR',
                price: '15.35',
                change_amount: '0.22',
                change_percentage: '1.4541%',
                volume: '48011676'
            },
            {
                ticker: 'QQQ',
                price: '366.24',
                change_amount: '-1.22',
                change_percentage: '-0.332%',
                volume: '46628385'
            },
            {
                ticker: 'AAPL',
                price: '190.68',
                change_amount: '-1.13',
                change_percentage: '-0.5891%',
                volume: '46563101'
            },
            {
                ticker: 'BABA',
                price: '90.61',
                change_amount: '6.77',
                change_percentage: '8.0749%',
                volume: '45903856'
            },
            {
                ticker: 'SOXS',
                price: '10.655',
                change_amount: '0.015',
                change_percentage: '0.141%',
                volume: '45020392'
            }
        ]
    }



    // request.get({
    //     url: url,
    //     json: true,
    //     headers: {'User-Agent': 'request'}
    // }, (err, res, data) => {
    //     if (err) {
    //         console.log('Error:', err);
    //     } else if (res.statusCode !== 200) {
    //         console.log('Status:', res.statusCode);
    //     } else {
                // USE .send(data) when done since alr JSON
    //         // data is successfully parsed as a JSON object:
    //         console.log(data);
    //
    //     }
    // });
    res.send(data);
    //res.json(data);

});

module.exports = router;

