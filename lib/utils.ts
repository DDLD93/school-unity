import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Status, RiskCategory } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatusColor(status: Status): string {
  switch (status) {
    case Status.Green:
      return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
    case Status.Amber:
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
    case Status.Red:
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
  }
}

export function getStatusBadgeVariant(status: Status): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case Status.Green:
      return "default"
    case Status.Amber:
      return "secondary"
    case Status.Red:
      return "destructive"
  }
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num)
}

export function getRiskCategoryColor(category: RiskCategory): string {
  switch (category) {
    case RiskCategory.Infrastructure:
      return "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20"
    case RiskCategory.Water:
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
    case RiskCategory.Power:
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
    case RiskCategory.Overcrowding:
      return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20"
  }
}

export function getStatusLabel(status: Status): string {
  switch (status) {
    case Status.Green:
      return "Good"
    case Status.Amber:
      return "Attention"
    case Status.Red:
      return "Urgent"
  }
}
