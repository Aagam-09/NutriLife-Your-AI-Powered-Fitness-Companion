import { Badge } from "@/components/ui/badge";

export interface FaqItem {
    question: string;
    answer: string;
}

export interface Faq5Props {
    badge?: string;
    heading?: string;
    description?: string;
    faqs?: FaqItem[];
}

const defaultFaqs: FaqItem[] = [
    {
        question: "How does NutriLife track my calories?",
        answer:
            "NutriLife uses advanced AI meal scanning. Just snap a photo of your food, and our engine automatically calculates the calorie count and macronutrient breakdown (Protein, Carbs, Fats) for you.",
    },
    {
        question: "Can I set custom nutritional goals?",
        answer:
            "Yes! In your Profile settings, you can define your age, weight, and activity level. NutriLife will then calculate a personalized daily calorie goal based on whether you want to lose fat, maintain, or gain muscle.",
    },
    {
        question: "What are Meal Reminders?",
        answer:
            "Meal Reminders are personalized alerts you can set for different times of the day (Breakfast, Lunch, etc.) to ensure you stay on track with your nutritional plan and never miss a meal.",
    },
    {
        question: "Is there a premium version?",
        answer:
            "NutriLife offers a Pro plan which includes unlimited AI meal scanning, real-time diet adjustments from our AI coach, and priority support from certified nutritionists.",
    },
];

export const Faq5 = ({
    badge = "FAQ",
    heading = "Common Questions & Answers",
    description = "Find out all the essential details about NutriLife and how it helps you master your nutrition.",
    faqs = defaultFaqs,
}: Faq5Props) => {
    return (
        <section className="py-20 lg:py-32 bg-background">
            <div className="container px-4 mx-auto max-w-5xl">
                <div className="text-center">
                    <Badge className="text-xs font-medium px-4 py-1.5 rounded-full">{badge}</Badge>
                    <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-foreground">{heading}</h1>
                    <p className="mt-4 font-medium text-muted-foreground text-sm max-w-2xl mx-auto">
                        {description}
                    </p>
                </div>
                <div className="mx-auto mt-14 max-w-screen-sm">
                    {faqs.map((faq, index) => (
                        <div key={index} className="mb-8 flex gap-4">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-secondary/50 font-mono text-xs text-primary font-bold">
                                {index + 1}
                            </span>
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="font-bold text-foreground">{faq.question}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
