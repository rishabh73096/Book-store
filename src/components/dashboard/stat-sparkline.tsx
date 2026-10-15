"use client";

import ReactEChartsCore from "echarts-for-react/lib/core";
import { echarts } from "@/lib/echarts-core";
import { areaLineSeries, tooltipTheme } from "@/lib/echarts-theme";

export function StatSparkline({ data, id }: { data: number[]; id: string }) {
  return (
    <ReactEChartsCore
      echarts={echarts}
      option={{
        grid: { top: 6, right: 2, bottom: 0, left: 2 },
        xAxis: { type: "category", show: false, boundaryGap: false, data: data.map((_, i) => i) },
        yAxis: { type: "value", show: false, min: (v: { min: number }) => Math.min(0, v.min) },
        tooltip: {
          trigger: "axis",
          ...tooltipTheme,
          textStyle: { color: "var(--popover-foreground)", fontSize: 11 },
          padding: [4, 8],
          axisPointer: { type: "none" },
          formatter: (params: Array<{ value: number }>) => String(params[0]?.value ?? ""),
        },
        series: [areaLineSeries(data, { areaOpacity: 0.5, disableEmphasis: true })],
      }}
      style={{ height: 44, width: "100%" }}
      opts={{ renderer: "svg" }}
      notMerge
      lazyUpdate
      aria-label={`${id} trend`}
    />
  );
}
