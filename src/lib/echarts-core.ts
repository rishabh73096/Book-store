// Registers only the ECharts pieces the dashboard's line/area charts actually
// use (line series + grid + tooltip + SVG renderer) instead of pulling in the
// full echarts bundle (all chart types and components) via the default
// echarts-for-react import.
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { SVGRenderer } from "echarts/renderers";

echarts.use([LineChart, GridComponent, TooltipComponent, SVGRenderer]);

export { echarts };
