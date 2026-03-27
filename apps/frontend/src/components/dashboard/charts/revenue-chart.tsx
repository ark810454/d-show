"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RevenuePoint } from "@dshow/shared";
import { SummaryWidget } from "../summary-widget";

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <SummaryWidget title="Evolution du chiffre d'affaires" subtitle="Performance sur la periode selectionnee">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0E5F59" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0E5F59" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip />
            <Area type="monotone" dataKey="revenue" stroke="#0E5F59" fill="url(#revenueGradient)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </SummaryWidget>
  );
}

