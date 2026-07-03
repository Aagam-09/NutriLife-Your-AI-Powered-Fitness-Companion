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
                {/* Heading */}
                <div className="flex flex-col items-center gap-4 mb-12">
                    <h2 className="text-3xl font-bold text-foreground">
                        Simple, transparent pricing
                    </h2>

                    {/* Period toggle */}
                    <div className="inline-flex items-center p-1.5 bg-card rounded-full border border-border shadow-sm">
                        {["Monthly", "Yearly"].map((period) => (
                            <button
                                key={period}
                                onClick={() => setIsYearly(period === "Yearly")}
                                className={cn(
                                    "px-8 py-2.5 text-sm font-medium rounded-full transition-all duration-300",
                                    (period === "Yearly") === isYearly
                                        ? "bg-foreground text-background shadow-lg"
                                        : "text-muted-foreground hover:text-foreground",
                                )}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {tiers.map((tier) => (
                        <div
                            key={tier.name}
                            className={cn(
                                "relative group backdrop-blur-sm",
                                "rounded-3xl transition-all duration-300",
                                "flex flex-col",
                                tier.highlight
                                    ? "bg-card border-primary/40 shadow-xl glow-green"
                                    : "bg-card border-border shadow-md",
                                "border",
                                "hover:scale-[1.02] hover:shadow-xl",
                            )}
                        >
                            {tier.badge && tier.highlight && (
                                <div className="absolute -top-4 left-6">
                                    <Badge className="px-4 py-1.5 text-sm font-medium bg-foreground text-background border-none shadow-lg">
                                        {tier.badge}
                                    </Badge>
                                </div>
                            )}

                            <div className="p-8 flex-1">
                                {/* Icon + Name row */}
                                <div className="flex items-center justify-between mb-4">
                                    <div
                                        className={cn(
                                            "p-3 rounded-xl",
                                            tier.highlight
                                                ? "bg-primary/10 text-primary"
                                                : "bg-muted text-muted-foreground",
                                        )}
                                    >
                                        {tier.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-foreground">
                                        {tier.name}
                                    </h3>
                                </div>

                                {/* Price */}
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold text-foreground">
                                            ₹{isYearly ? tier.price.yearly : tier.price.monthly}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            /{isYearly ? "year" : "month"}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {tier.description}
                                    </p>
                                </div>

                                {/* Features list */}
                                <div className="space-y-4">
                                    {tier.features.map((feature) => (
                                        <div key={feature.name} className="flex items-start gap-4">
                                            <div
                                                className={cn(
                                                    "mt-0.5 w-5 h-5 rounded-full transition-colors duration-200 shrink-0 flex items-center justify-center",
                                                    feature.included
                                                        ? "text-primary border border-primary/30 bg-primary/10"
                                                        : "text-muted-foreground/30 border border-border",
                                                )}
                                            >
                                                <CheckIcon className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-foreground">
                                                    {feature.name}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {feature.description}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="p-8 pt-0 mt-auto">
                                <Button
                                    className={cn(
                                        "w-full h-12 relative transition-all duration-300 font-semibold",
                                        tier.highlight
                                            ? "btn-gradient text-white shadow-[0_1px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_1px_20px_rgba(0,0,0,0.15)] text-base"
                                            : "bg-background border border-border hover:border-primary/40 hover:bg-muted text-foreground text-sm",
                                    )}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {tier.highlight ? (
                                            <>Buy now <ArrowRightIcon className="w-4 h-4" /></>
                                        ) : (
                                            <>Get started <ArrowRightIcon className="w-4 h-4" /></>
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
