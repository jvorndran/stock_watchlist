import React from 'react';
import {ChartCanvas, Chart, EdgeIndicator} from 'react-financial-charts';
import { CandlestickSeries, BarSeries, LineSeries } from 'react-financial-charts';
import { XAxis, YAxis } from 'react-financial-charts';
import { withDeviceRatio, withSize } from 'react-financial-charts';
import {scaleUtc} from "d3-scale";

const axisStyles = {
	strokeStyle: "#383E55", // Color.GRAY
	strokeWidth: 2,
	tickLabelFill: "#9EAAC7", // Color.LIGHT_GRAY
	tickStrokeStyle: "#383E55",
	gridLinesStrokeStyle: "rgba(56, 62, 85, 0.5)" // Color.GRAY w Opacity
};

const coordinateStyles = {
	fill: "#383E55",
	textFill: "#FFFFFF"
};

const zoomButtonStyles = {
	fill: "#383E55",
	fillOpacity: 0.75,
	strokeWidth: 0,
	textFill: "#9EAAC7"
};

const crossHairStyles = {
	strokeStyle: "#9EAAC7"
};


export function FinancialChart({data, width, height}) {

	return (
		<ChartCanvas
			ratio={1}
			width={width}
			height={height}
			margin={{ left: 50, right: 50, top: 10, bottom: 30 }}
			data={data}
			seriesName="Price Chart"
			xAccessor={(d) => d.date}
			xScaleProvider={discontinuousTimeScaleProviderBuilder()}
			xScale={scaleUtc()}
			title="QQQ"

		>
			<Chart id={1} yExtents={(d) => [d.high, d.low]}>
				<XAxis axisAt="bottom" orient="bottom" {...axisStyles} />
				<YAxis axisAt="left" orient="left" ticks={5} {...axisStyles} />

				<CandlestickSeries />


			</Chart>
			{/*<Chart id={2} yExtents={(d) => d.volume} height={40} origin={(w, h) => [0, h - 40]}>*/}
			{/*	<BarSeries yAccessor={(d) => d.volume} />*/}
			{/*</Chart>*/}
		</ChartCanvas>
	)
}

const format = require("d3-format").format;
const { discontinuousTimeScaleProviderBuilder } = require("react-financial-charts");

const ResponsiveFinancialChart = withSize({ style: { minHeight: 100 } })(withDeviceRatio()(FinancialChart));

export default ResponsiveFinancialChart;