"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ActivityRevenueItem } from "@dshow/shared";
import { SummaryWidget } from "../summary-widget";

export function ActivityRevenueChart({ data }: { data: ActivityRevenueItem[] }) {
  return (
    <SummaryWidget title="Revenus par activite" subtitle="Comparaison transversale des modules">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="activityName" stroke="#64748b" tick={{ fontSize: 12 }} />
            <YAxis stroke="#64748b" />
            <Tooltip />
            <Bar dataKey="revenue" radius={[10, 10, 0, 0]} fill="#C28A2D" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SummaryWidget>
  );
}

