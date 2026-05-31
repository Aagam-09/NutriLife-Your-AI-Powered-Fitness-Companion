"use client";

import { Activity, Target, Utensils } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface Metric {
    label: string;
    value: string;
    trend: number;
    unit?: "cal" | "g";
}

export interface Goal {
    id: string;
    title: string;
    isCompleted: boolean;
}

interface ActivityCardProps {
    category?: string;
    title?: string;
    metrics?: Metric[];
    dailyGoals?: Goal[];
    className?: string;
    showGoals?: boolean;
}

const METRIC_COLORS = {
    Protein: "#166534", // emerald-800
    Carbs: "#10b981", // emerald-500
    Fat: "#84cc16", // lime-500
    Calories: "#8BC34A", // primary apple green
    Water: "#14b8a6", // teal-500
} as const;

export function ActivityCard({
    category = "Nutrition",
    title = "Today's Macros",
    metrics = [],
    dailyGoals = [],
    className,
    showGoals = true
}: ActivityCardProps) {
    const [isHovering, setIsHovering] = useState<string | null>(null);

    return (
        <div
            className={cn(
                "relative h-full flex flex-col rounded-[2rem] p-6 shadow-sm",
                "bg-card border border-border/50",
                className
            )}
        >
            {/* Header */}
            {/* Header */}
            <div className="flex flex-col items-center justify-center mb-6 bg-gradient-to-b from-primary/10 to-transparent p-6 -mx-6 -mt-6 rounded-t-[2rem] text-center">
                <div className="p-3 rounded-full bg-background shadow-sm border border-white mb-2">
                    <Activity className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h3 className="text-xl font-extrabold text-foreground uppercase tracking-tight">
                        {title}
                    </h3>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        {category}
                    </p>
                </div>
            </div>

            {/* Metrics Rings */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 mt-6">
                {metrics.map((metric) => (
                    <div
                        key={metric.label}
                        className="relative flex flex-col items-center"
                        onMouseEnter={() => setIsHovering(metric.label)}
                        onMouseLeave={() => setIsHovering(null)}
                    >
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                            <div className="absolute inset-0 rounded-full border-[6px] border-secondary" />
                            <div
                                className={cn(
                                    "absolute inset-0 rounded-full border-[6px] transition-all duration-500",
                                    isHovering === metric.label && "scale-105"
                                )}
                                style={{
                                    borderColor: METRIC_COLORS[metric.label as keyof typeof METRIC_COLORS] || METRIC_COLORS.Calories,
                                    clipPath: `polygon(0 0, 100% 0, 100% ${metric.trend}%, 0 ${metric.trend}%)`,
                                }}
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl sm:text-2xl font-extrabold text-foreground">
                                    {metric.value}
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    {metric.unit}
                                </span>
                            </div>
                        </div>
                        <span className="mt-4 text-sm font-bold text-foreground">
                            {metric.label}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                            {metric.trend}% Goal
                        </span>
                    </div>
                ))}
            </div>

            {/* Goals Section */}
            {showGoals && dailyGoals.length > 0 && (
                <div className="mt-4 bg-secondary/30 rounded-xl p-5 border border-border/50">
                    <div className="flex flex-col items-center justify-center text-center gap-1 mb-4">
                        <Target className="w-5 h-5 text-primary mb-1" />
                        <h4 className="text-[15px] font-extrabold text-foreground uppercase tracking-tight">Next Meals</h4>
                    </div>
                    <div className="space-y-3">
                        {dailyGoals.map((goal) => (
                            <div
                                key={goal.id}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-default",
                                    goal.isCompleted
                                        ? "bg-card border-emerald-500/30 text-emerald-600"
                                        : "bg-card border-border shadow-sm text-foreground"
                                )}
                            >
                                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", goal.isCompleted ? "bg-emerald-100" : "bg-primary/10")}>
                                    <Utensils className={cn("w-4 h-4", goal.isCompleted ? "text-emerald-500" : "text-primary")} />
                                </div>
                                <span
                                    className={cn(
                                        "text-sm font-bold text-left flex-1",
                                        goal.isCompleted && "line-through opacity-70"
                                    )}
                                >
                                    {goal.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!showGoals && (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                    <p className="text-muted-foreground text-sm font-medium italic">
                        Great progress on your macros today!
                    </p>
                </div>
            )}
        </div>
    );
}
