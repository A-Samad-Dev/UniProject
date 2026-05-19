"use client";

import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  change?: string;
  changeType?:
    | "increase"
    | "decrease"
    | "neutral"
    | "warning"
    | "success"
    | string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  change,
  changeType,
}: StatsCardProps) {
  const getChangeColor = () => {
    if (changeType === "increase") return "text-green-600 bg-green-100";
    if (changeType === "decrease") return "text-red-600 bg-red-100";
    if (changeType === "warning") return "text-yellow-600 bg-yellow-100";
    if (changeType === "success") return "text-emerald-600 bg-emerald-100";
    return "text-gray-600 bg-gray-100";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value.toLocaleString()}
          </p>
        </div>
        <div
          className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center gap-1">
          <span
            className={`text-xs px-2 py-1 rounded-full ${getChangeColor()}`}
          >
            {change}
          </span>
          <span className="text-xs text-gray-500">vs last month</span>
        </div>
      )}
    </div>
  );
}
