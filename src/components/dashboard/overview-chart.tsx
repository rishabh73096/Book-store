"use client";

import ReactEChartsCore from "echarts-for-react/lib/core";
import { echarts } from "@/lib/echarts-core";
import { areaLineSeries, tooltipTheme } from "@/lib/echarts-theme";

export function OverviewChart({ data }: { data: { day: string; inquiries: number }[] }) {
  return (
    <ReactEChartsCore
      echarts={echarts}
      option={{
        grid: { top: 8, right: 12, bottom: 24, left: 36 },
        xAxis: {
          type: "category",
          data: data.map((d) => d.day),
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: "var(--muted-foreground)", fontSize: 12 },
        },
        yAxis: {
          type: "value",
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: "var(--muted-foreground)", fontSize: 12 },
          splitLine: { lineStyle: { color: "var(--border)" } },
        },
        tooltip: {
          trigger: "axis",
          ...tooltipTheme,
          textStyle: { color: "var(--popover-foreground)", fontSize: 12 },
        },
        series: [areaLineSeries(data.map((d) => d.inquiries), { name: "Inquiries" })],
      }}
      style={{ height: 260, width: "100%" }}
      opts={{ renderer: "svg" }}
      notMerge
      lazyUpdate
    />
  );
}
