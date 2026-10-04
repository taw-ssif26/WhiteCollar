import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `৳${amount.toLocaleString("en-BD")}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getGrade(percentage: number): { label: string; color: string } {
  if (percentage >= 90) return { label: "A+", color: "text-emerald-600" };
  if (percentage >= 80) return { label: "A", color: "text-green-600" };
  if (percentage >= 70) return { label: "B", color: "text-blue-600" };
  if (percentage >= 60) return { label: "C", color: "text-yellow-600" };
  if (percentage >= 50) return { label: "D", color: "text-orange-600" };
  return { label: "F", color: "text-red-600" };
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}
