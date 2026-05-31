import { Header } from "@/components/ui/header-2"
import { Footerdemo } from "@/components/blocks/footer-section"
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1"
import { Faq5 } from "@/components/ui/faq-5"
import { motion } from "motion/react"
import { Heart, ShieldCheck, Sparkles, Zap } from "lucide-react"

const testimonials = [
    {
        text: "NutriLife changed my life. I've lost 10kg in 3 months just by being consistent with the AI meal scanning.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop",
        name: "Sarah Jenkins",
        role: "Health Enthusiast",
    },
    {
        text: "The AI scanner is incredibly accurate. I just take a photo and it knows exactly what's on my plate.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop",
        name: "David Chen",
        role: "Marathon Runner",
    },
    {
        text: "Finally, a nutrition app that isn't tedious to use. Elegant UI and very fast performance.",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop",
        name: "Elena Rodriguez",
        role: "Software Engineer",
    },
    {
        text: "The personalized diet plans are a game changer. I don't have to think about what to cook anymore.",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop",
        name: "Marcus Thorne",
        role: "Personal Trainer",
    },
    {
        text: "Premium feel without the premium price tag. The best health app I've used this year.",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop",
        name: "Julia Smith",
        role: "Yoga Instructor",
    },
    {
        text: "I love the clean, green aesthetic. It makes me feel motivated to stay healthy every morning!",
        image: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=100&auto=format&fit=crop",
        name: "Hassan Al-Fayed",
        role: "Chef",
    },
    {
        text: "The weekly progress charts are so clear. I can see my wins and where I need to improve easily.",
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop",
        name: "Maya Patel",
        role: "Nutritionist",
    },
    {
        text: "Integrating it into my morning routine was seamless. The app is just so snappy.",
        image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop",
        name: "Sam Wilson",
        role: "Graphic Designer",
    },
    {
        text: "Excellent support and frequent updates. You can tell the team really cares about user feedback.",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop",
        name: "Sophie Laurent",
        role: "Business Owner",
    },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            <Header />
            <main className="flex-1 animate-in fade-in zoom-in-95 duration-500">
                {/* Hero Section */}
                <section className="pt-32 pb-20 px-4 container mx-auto text-center max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                            Our Mission is to <span className="text-primary">Simplify</span> Nutrition
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
                            NutriLife was born out of a simple idea: health shouldn't be a chore.
                            We use advanced AI to make meal logging as easy as taking a photo,
                            giving you back time to focus on what matters most—living your life.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                        <div className="p-6 bg-card rounded-3xl border border-border/50 shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-300">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 mx-auto md:mx-0">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">AI-Powered</h3>
                            <p className="text-sm text-muted-foreground">Cutting-edge vision AI that recognizes thousands of foods instantly.</p>
                        </div>
                        <div className="p-6 bg-card rounded-3xl border border-border/50 shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-300">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 mx-auto md:mx-0">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Science-Based</h3>
                            <p className="text-sm text-muted-foreground">Nutrition data backed by extensive dietary databases and expertise.</p>
                        </div>
                        <div className="p-6 bg-card rounded-3xl border border-border/50 shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-300">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 mx-auto md:mx-0">
                                <Heart className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">User-Centric</h3>
                            <p className="text-sm text-muted-foreground">Designed for real people with real lives. Snap, log, and get on with your day.</p>
                        </div>
                    </div>
                </section>

                {/* Testimonials section */}
                <section className="bg-background py-20 relative overflow-hidden">
                    <div className="container z-10 mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center justify-center max-w-[540px] mx-auto mb-12"
                        >
                            <div className="flex justify-center mb-6">
                                <div className="border bg-card/50 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-primary">Testimonials</div>
                            </div>

                            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-center leading-tight">
                                What our users say
                            </h2>
                            <p className="text-center mt-5 text-muted-foreground">
                                Join thousands of happy users who have transformed their relationship with food.
                            </p>
                        </motion.div>

                        <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
                            <TestimonialsColumn testimonials={firstColumn} duration={25} />
                            <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={29} />
                            <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={27} />
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <Faq5 />

                {/* CTA section */}
                <section className="py-24 bg-primary text-white text-center">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl md:text-5xl font-bold mb-8">Ready to join NutriLife?</h2>
                        <button className="bg-white text-primary hover:bg-zinc-100 font-extrabold py-4 px-12 rounded-2xl shadow-xl transition-transform hover:scale-105 flex items-center gap-3 mx-auto">
                            <Zap className="w-5 h-5 fill-current" /> Start Your Journey Today
                        </button>
                    </div>
                </section>
            </main>
            <Footerdemo />
        </div>
    )
}
