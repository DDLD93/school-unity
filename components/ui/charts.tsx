"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { Status } from "@/lib/types";

const COLORS = {
  green: "#16a34a", // green-600
  amber: "#f59e0b", // amber-500
  red: "#dc2626", // red-600
  primary: "#15803d", // green-700
  secondary: "#22c55e", // green-500
  muted: "#86efac", // green-300
};

interface StatusDistributionChartProps {
  data: { name: string; value: number; status: Status }[];
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const chartData = data.map((item) => ({
    name: item.name,
    value: item.value,
    fill:
      item.status === Status.Green
        ? COLORS.green
        : item.status === Status.Amber
        ? COLORS.amber
        : COLORS.red,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface FacilityUtilizationChartProps {
  data: { name: string; utilization: number; capacity: number }[];
}

export function FacilityUtilizationChart({ data }: FacilityUtilizationChartProps) {
  const chartData = data.map((item) => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + "..." : item.name,
    utilization: item.utilization,
    capacity: item.capacity,
    percentage: item.capacity > 0 ? (item.utilization / item.capacity) * 100 : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={100}
          tick={{ fontSize: 12 }}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value: number | undefined, name: string | undefined) => {
            if (name === "percentage") {
              return [`${(value || 0).toFixed(1)}%`, "Utilization"];
            }
            return [value || 0, name || ""];
          }}
        />
        <Legend />
        <Bar dataKey="utilization" fill={COLORS.primary} name="Current Usage" />
        <Bar dataKey="capacity" fill={COLORS.muted} name="Capacity" />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface EquipmentStatusChartProps {
  data: { category: string; functional: number; nonFunctional: number }[];
}

export function EquipmentStatusChart({ data }: EquipmentStatusChartProps) {
  const chartData = data.map((item) => ({
    name: item.category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    functional: item.functional,
    nonFunctional: item.nonFunctional,
    total: item.functional + item.nonFunctional,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={100}
          tick={{ fontSize: 12 }}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="functional" stackId="a" fill={COLORS.green} name="Functional" />
        <Bar dataKey="nonFunctional" stackId="a" fill={COLORS.red} name="Non-Functional" />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface TeacherDistributionChartProps {
  data: { subject: string; count: number }[];
}

export function TeacherDistributionChart({ data }: TeacherDistributionChartProps) {
  const chartData = data.map((item) => ({
    name: item.subject.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    count: item.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={100}
          tick={{ fontSize: 12 }}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="count" fill={COLORS.primary} name="Teachers" />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface TeacherQualificationChartProps {
  data: { qualification: string; count: number }[];
}

export function TeacherQualificationChart({ data }: TeacherQualificationChartProps) {
  const chartData = data.map((item) => ({
    name: item.qualification.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    value: item.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={[COLORS.primary, COLORS.secondary, COLORS.muted, "#94a3b8"][index % 4]}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface RegionalComparisonChartProps {
  data: { state: string; green: number; amber: number; red: number }[];
}

export function RegionalComparisonChart({ data }: RegionalComparisonChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="state"
          angle={-45}
          textAnchor="end"
          height={100}
          tick={{ fontSize: 12 }}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="green" stackId="a" fill={COLORS.green} name="Green" />
        <Bar dataKey="amber" stackId="a" fill={COLORS.amber} name="Amber" />
        <Bar dataKey="red" stackId="a" fill={COLORS.red} name="Red" />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface ComputerLabStatusChartProps {
  functional: number;
  nonFunctional: number;
}

export function ComputerLabStatusChart({ functional, nonFunctional }: ComputerLabStatusChartProps) {
  const data = [
    { name: "Functional", value: functional, fill: COLORS.green },
    { name: "Non-Functional", value: nonFunctional, fill: COLORS.red },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface ServicesSummaryChartProps {
  data: { category: string; count: number }[];
}

export function ServicesSummaryChart({ data }: ServicesSummaryChartProps) {
  const chartData = data.map((item) => ({
    name: item.category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    count: item.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={100}
          tick={{ fontSize: 12 }}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="count" fill={COLORS.primary} name="Count" />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface FacilitiesSummaryChartProps {
  data: { type: string; count: number }[];
}

export function FacilitiesSummaryChart({ data }: FacilitiesSummaryChartProps) {
  const chartData = data.map((item) => ({
    name: item.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    count: item.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={100}
          tick={{ fontSize: 12 }}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="count" fill={COLORS.secondary} name="Count" />
      </BarChart>
    </ResponsiveContainer>
  );
}
