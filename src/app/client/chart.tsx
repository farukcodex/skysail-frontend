"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis } from "recharts";

const BUDGET_BARS = [
  { month: "JAN", amount: 30000 },
  { month: "FEB", amount: 35000 },
  { month: "MAR", amount: 40000 },
  { month: "APR", amount: 90000, active: true },
  { month: "MAY", amount: 20000 },
  { month: "JUN", amount: 15000 },
];

const budgetChartConfig = {
  amount: { label: "Spent", color: "#C49A3C" },
} satisfies ChartConfig;

function GradientBar(props: Record<string, unknown>) {
  const { x, y, width, height, active } = props as {
    x: number;
    y: number;
    width: number;
    height: number;
    active?: boolean;
    payload?: { active?: boolean };
  };
  const isActive = active || (props.payload as { active?: boolean })?.active;
  const r = 4;

  return (
    <g>
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C49A3C" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
      </defs>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={r}
        ry={r}
        fill={isActive ? "url(#goldGrad)" : "#dfdfdf"}
      />
    </g>
  );
}

export default function BudgetChart({ data }: { data?: any[] }) {
  const chartData = data && data.length > 0 ? data : [
    { month: "JAN", amount: 0 },
    { month: "FEB", amount: 0 },
    { month: "MAR", amount: 0 },
    { month: "APR", amount: 0 },
    { month: "MAY", amount: 0 },
    { month: "JUN", amount: 0, active: true },
  ];

  return (
    <ChartContainer config={budgetChartConfig} className="h-28 w-full mt-2">
      <BarChart data={chartData} barSize={52} barCategoryGap="15%">
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(v) => `$${Number(v).toLocaleString()}`}
            />
          }
        />
        <Bar dataKey="amount" shape={<GradientBar />} />
      </BarChart>
    </ChartContainer>
  );
}
