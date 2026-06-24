import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const accent = "oklch(0.82 0.14 210)";
const muted = "oklch(0.4 0.01 285)";
const grid = "oklch(0.27 0.008 285)";
const palette = [
  accent,
  "oklch(0.7 0.15 200)",
  "oklch(0.65 0.18 280)",
  "oklch(0.72 0.18 150)",
  "oklch(0.68 0.20 30)",
  "oklch(0.6 0.18 330)",
  "oklch(0.7 0.12 80)",
];

function TooltipBox({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
  formatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-background/95 p-3 text-xs shadow-xl backdrop-blur">
      {label && (
        <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </div>
      )}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}</span>
          <span className="ml-2 font-mono">
            {formatter && typeof p.value === "number" ? formatter(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function IncomeExpenseBar({
  data,
  format,
}: {
  data: { month: string; income: number; expense: number }[];
  format?: (v: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" stroke={muted} fontSize={10} tickLine={false} axisLine={false} />
        <YAxis stroke={muted} fontSize={10} tickLine={false} axisLine={false} />
        <Tooltip
          content={<TooltipBox formatter={format} />}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
        />
        <Legend
          wrapperStyle={{ fontSize: 10, color: muted, paddingTop: 8 }}
          iconType="circle"
          iconSize={6}
        />
        <Bar dataKey="income" name="Income" fill={accent} radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="Expense" fill="oklch(0.35 0.01 285)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function NetTrendArea({
  data,
  format,
}: {
  data: { day: string; income: number; expense: number }[];
  format?: (v: number) => string;
}) {
  const enriched = useMemo(() => data.map((d) => ({ ...d, net: d.income - d.expense })), [data]);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={enriched} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity={0.35} />
            <stop offset="100%" stopColor={accent} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="day"
          stroke={muted}
          fontSize={10}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis stroke={muted} fontSize={10} tickLine={false} axisLine={false} />
        <Tooltip content={<TooltipBox formatter={format} />} />
        <Area
          type="monotone"
          dataKey="net"
          name="Net"
          stroke={accent}
          strokeWidth={2}
          fill="url(#netGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryPie({
  data,
  format,
}: {
  data: { name: string; value: number }[];
  format?: (v: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={palette[i % palette.length]} />
          ))}
        </Pie>
        <Tooltip content={<TooltipBox formatter={format} />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TrendLine({
  data,
  format,
}: {
  data: { month: string; income: number; expense: number; net: number }[];
  format?: (v: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" stroke={muted} fontSize={10} tickLine={false} axisLine={false} />
        <YAxis stroke={muted} fontSize={10} tickLine={false} axisLine={false} />
        <Tooltip content={<TooltipBox formatter={format} />} />
        <Legend
          wrapperStyle={{ fontSize: 10, color: muted, paddingTop: 8 }}
          iconType="circle"
          iconSize={6}
        />
        <Line type="monotone" dataKey="income" stroke={accent} strokeWidth={2} dot={false} />
        <Line
          type="monotone"
          dataKey="expense"
          stroke="oklch(0.7 0.15 30)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="net"
          stroke="oklch(0.7 0.18 150)"
          strokeWidth={2}
          dot={false}
          strokeDasharray="4 4"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CategoryBar({
  data,
  format,
}: {
  data: { name: string; value: number }[];
  format?: (v: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 8, left: 24, bottom: 0 }}>
        <CartesianGrid stroke={grid} strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" stroke={muted} fontSize={10} tickLine={false} axisLine={false} />
        <YAxis
          dataKey="name"
          type="category"
          stroke={muted}
          fontSize={10}
          tickLine={false}
          axisLine={false}
          width={90}
        />
        <Tooltip
          content={<TooltipBox formatter={format} />}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
        />
        <Bar dataKey="value" fill={accent} radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={palette[i % palette.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
