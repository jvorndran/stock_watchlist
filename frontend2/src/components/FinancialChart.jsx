import React from 'react';
import {ChartCanvas, Chart, AreaSeries} from 'react-financial-charts';
import { XAxis, YAxis } from 'react-financial-charts';
import { withDeviceRatio, withSize } from 'react-financial-charts';
import {scaleUtc} from "d3-scale";

const axisStyles = {
	strokeStyle: "#ffffff",
	strokeWidth: 2,
	tickLabelFill: "#ffffff",
	tickStrokeStyle: "rgba(253,253,253,0.3)",
	gridLinesStrokeStyle: "rgb(255,255,255)"
};



export function FinancialChart({data, width, height}) {

	return (
		<ChartCanvas
			ratio={1}
			width={width}
			height={height}
			initialDisplay={50}
			margin={{ left: 50, right: 50, top: 10, bottom: 30 }}
			data={data}
			seriesName="Price Chart"
			xAccessor={(d) => d.date}
			xScaleProvider={discontinuousTimeScaleProviderBuilder()}
			xScale={scaleUtc()}
		>
			<Chart id={1} yExtents={(d) => [d.high, d.low]}>
				<XAxis axisAt="bottom" orient="bottom" {...axisStyles} />
				<YAxis axisAt="left" orient="left" ticks={5} {...axisStyles} />

				<AreaSeries yAccessor={(d) => d.high} strokeStyle='rgba(230, 230, 255,0.9)' fillStyle='rgba(230, 230, 255,0.3)'/>
			</Chart>
		</ChartCanvas>
	)
}

const format = require("d3-format").format;
const { discontinuousTimeScaleProviderBuilder } = require("react-financial-charts");

const ResponsiveFinancialChart = withSize({ style: { minHeight: 100 } })(withDeviceRatio()(FinancialChart));

export default ResponsiveFinancialChart;