"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatINR, formatPercent } from "@/lib/utils/format";

interface Props {
  principal: number;
  interest: number;
  payable: number;
}

export function EmiDonutChart({ principal, interest, payable }: Props) {
  const pieData = [
    { name: "Principal", value: principal },
    { name: "Interest", value: interest },
  ];

  return (
    <>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              <Cell fill="var(--tm-green-500)" />
              <Cell fill="var(--tm-warning)" />
            </Pie>
            <Tooltip
              formatter={(v: unknown) => formatINR(v as number)}
              contentStyle={{
                borderRadius: "var(--tm-r-sm)",
                border: "1px solid var(--tm-ink-100)",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[var(--tm-green-500)] flex-shrink-0" />
          <span className="text-xs text-[var(--tm-ink-500)]">
            Principal ({formatPercent((principal / payable) * 100, 0)})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[var(--tm-warning)] flex-shrink-0" />
          <span className="text-xs text-[var(--tm-ink-500)]">
            Interest ({formatPercent((interest / payable) * 100, 0)})
          </span>
        </div>
      </div>
    </>
  );
}
