"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRightIcon, CheckIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"

interface Feature {
    name: string
    description: string
    included: boolean
}

interface PricingTier {
    name: string
    price: {
        monthly: number
        yearly: number
    }
    description: string
    features: Feature[]
    highlight?: boolean
    badge?: string
    icon: React.ReactNode
}

interface PricingSectionProps {
    tiers: PricingTier[]
    className?: string
}

function PricingSection({ tiers, className }: PricingSectionProps) {
    const [isYearly, setIsYearly] = useState(false)

    const buttonStyles = {
        default: cn(
            "h-12 bg-white",
            "hover:bg-zinc-50",
            "text-zinc-900",
            "border border-zinc-200",
            "hover:border-zinc-300",
            "shadow-sm hover:shadow-md",
            "text-sm font-medium",
        ),
        highlight: cn(
            "h-12 bg-primary",
            "hover:bg-primary/90",
            "text-white",
            "shadow-[0_1px_15px_rgba(0,0,0,0.1)]",
            "hover:shadow-[0_1px_20px_rgba(0,0,0,0.15)]",
            "font-semibold text-base",
        ),
    }

    const badgeStyles = cn(
        "px-4 py-1.5 text-sm font-medium",
        "bg-zinc-900",
        "text-white",
        "border-none shadow-lg",
    )

    return (
        <section
            className={cn(
                "relative bg-background text-foreground",
                "py-12 px-4 md:py-24 lg:py-32",
                "overflow-hidden",
                className,
            )}
        >
            <div className="w-full max-w-5xl mx-auto">
                <div className="flex flex-col items-center gap-4 mb-12">
                    <h2 className="text-3xl font-bold text-zinc-900">
                        Simple, transparent pricing
                    </h2>
                    <div className="inline-flex items-center p-1.5 bg-white rounded-full border border-zinc-200 shadow-sm">
                        {["Monthly", "Yearly"].map((period) => (
                            <button
                                key={period}
                                onClick={() => setIsYearly(period === "Yearly")}
                                className={cn(
                                    "px-8 py-2.5 text-sm font-medium rounded-full transition-all duration-300",
                                    (period === "Yearly") === isYearly
                                        ? "bg-zinc-900 text-white shadow-lg"
                                        : "text-zinc-600 hover:text-zinc-900",
                                )}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {tiers.map((tier) => (
                        <div
                            key={tier.name}
                            className={cn(
                                "relative group backdrop-blur-sm",
                                "rounded-3xl transition-all duration-300",
                                "flex flex-col",
                                tier.highlight
                                    ? "bg-gradient-to-b from-zinc-100/80 to-transparent"
                                    : "bg-white",
                                "border",
                                tier.highlight
                                    ? "border-zinc-400/50 shadow-xl"
                                    : "border-zinc-200 shadow-md",
                                "hover:scale-[1.02] hover:shadow-xl",
                            )}
                        >
                            {tier.badge && tier.highlight && (
                                <div className="absolute -top-4 left-6">
                                    <Badge className={badgeStyles}>{tier.badge}</Badge>
                                </div>
                            )}

                            <div className="p-8 flex-1">
                                <div className="flex items-center justify-between mb-4">
                                    <div
                                        className={cn(
                                            "p-3 rounded-xl",
                                            tier.highlight
                                                ? "bg-zinc-100 text-zinc-900"
                                                : "bg-zinc-100 text-zinc-600",
                                        )}
                                    >
                                        {tier.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-zinc-900">
                                        {tier.name}
                                    </h3>
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold text-zinc-900">
                                            ₹{isYearly ? tier.price.yearly : tier.price.monthly}
                                        </span>
                                        <span className="text-sm text-zinc-500">
                                            /{isYearly ? "year" : "month"}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-zinc-600">
                                        {tier.description}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {tier.features.map((feature) => (
                                        <div key={feature.name} className="flex items-start gap-4">
                                            <div
                                                className={cn(
                                                    "mt-0.5 w-5 h-5 rounded-full transition-colors duration-200 shrink-0 flex items-center justify-center",
                                                    feature.included
                                                        ? "text-emerald-600 border border-emerald-200 bg-emerald-50"
                                                        : "text-zinc-300 border border-zinc-100",
                                                )}
                                            >
                                                <CheckIcon className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-zinc-900">
                                                    {feature.name}
                                                </div>
                                                <div className="text-sm text-zinc-500">
                                                    {feature.description}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 pt-0 mt-auto">
                                <Button
                                    className={cn(
                                        "w-full relative transition-all duration-300",
                                        tier.highlight
                                            ? buttonStyles.highlight
                                            : buttonStyles.default,
                                    )}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {tier.highlight ? (
                                            <>
                                                Buy now
                                                <ArrowRightIcon className="w-4 h-4" />
                                            </>
                                        ) : (
                                            <>
                                                Get started
                                                <ArrowRightIcon className="w-4 h-4" />
                                            </>
                                        )}
                                    </span>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export { PricingSection }
