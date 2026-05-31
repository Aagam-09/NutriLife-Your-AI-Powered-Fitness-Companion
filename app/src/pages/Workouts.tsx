import { Header } from "@/components/ui/header-2"
import { Footerdemo } from "@/components/blocks/footer-section"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { workouts } from "@/data/workouts"
import type { Workout } from "@/data/workouts"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
    Dumbbell,
    Footprints,
    Flame,
    Flower2,
    Bike,
    Accessibility,
    Trophy,
    Home as HomeIcon,
    Clock,
    Zap,
    Target,
    TrendingUp,
    Waves,
    Music,
    Play
} from "lucide-react"

const ICON_MAP: Record<string, any> = {
    Footprints,
    Flame,
    Flower2,
    Dumbbell,
    Bike,
    Accessibility,
    Trophy,
    Home: HomeIcon,
    Waves,
    Music
};

interface Profile {
    age: number | null;
    goal: string | null;
}

interface Stats {
    consumed: number;
    goal: number;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop";

export function WorkoutsPage() {
    const [searchParams] = useSearchParams();
    const spotlightId = searchParams.get("id");

    const [profile, setProfile] = useState<Profile | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [recommendedWorkouts, setRecommendedWorkouts] = useState<Workout[]>([]);
    const [surplusWorkouts, setSurplusWorkouts] = useState<Workout[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const [profileRes, statsRes] = await Promise.all([
                    fetch("http://localhost:8000/api/v1/user/profile", {
                        headers: { "Authorization": `Bearer ${token}` }
                    }),
                    fetch("http://localhost:8000/api/v1/calories/today", {
                        headers: { "Authorization": `Bearer ${token}` }
                    })
                ]);

                const profileData = await profileRes.json();
                const statsData = await statsRes.json();

                setProfile(profileData);
                setStats(statsData);

                // Personalization Logic
                const age = profileData.age || 30;
                const goal = profileData.goal || "maintain";
                const surplus = statsData.consumed - statsData.goal;

                // 1. Filter for surplus (High burn)
                if (surplus > 50) {
                    const highBurn = workouts
                        .filter(w => w.caloriesBurned >= 250)
                        .sort((a, b) => b.caloriesBurned - a.caloriesBurned)
                        .slice(0, 2);
                    setSurplusWorkouts(highBurn);
                }

                // 2. Filter for Goal & Age
                const filtered = workouts.filter(w => {
                    if (w.minAge && age < w.minAge) return false;
                    if (w.maxAge && age > w.maxAge) return false;
                    if (w.targetGoal === "all") return true;
                    if (goal === "fat_loss" && (w.category === "HIIT" || w.category === "Cardio")) return true;
                    if (goal === "muscle_gain" && w.category === "Strength") return true;
                    if (goal === "maintain" && w.category === "Yoga") return true;
                    return w.targetGoal === goal;
                });

                setRecommendedWorkouts(filtered.length > 0 ? filtered : workouts.slice(0, 3));
            } catch (error) {
                console.error("Failed to fetch workout data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!isLoading && spotlightId) {
            const timer = setTimeout(() => {
                const el = document.getElementById(`workout-${spotlightId}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isLoading, spotlightId]);

    const WorkoutCard = ({ workout, highlight = false }: { workout: Workout, highlight?: boolean }) => {
        const Icon = ICON_MAP[workout.icon] || Dumbbell;
        const isSpotlighted = spotlightId === workout.id;

        return (
            <motion.div
                initial={false}
                animate={isSpotlighted ? {
                    scale: [1, 1.1, 1],
                    borderColor: [
                        "rgba(128, 128, 128, 0.2)",
                        "hsl(var(--primary))",
                        "rgba(128, 128, 128, 0.2)"
                    ],
                    borderWidth: ["1px", "2px", "1px"],
                } : {}}
                whileHover={{ scale: 1.02 }}
                transition={isSpotlighted ? {
                    duration: 2,
                    times: [0, 0.5, 1],
                    ease: "easeInOut"
                } : { duration: 0.3 }}
                className={cn(
                    "group relative bg-card rounded-[1.5rem] overflow-hidden border border-border/50 shadow-lg",
                    highlight && "ring-1 ring-primary/20 bg-primary/[0.02]"
                )}
            >
                <div className="aspect-[16/10] overflow-hidden relative">
                    <img
                        src={workout.image || FALLBACK_IMAGE}
                        alt={workout.name}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== FALLBACK_IMAGE) target.src = FALLBACK_IMAGE;
                        }}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />

                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <div className="w-fit px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {workout.category}
                        </div>
                        {isSpotlighted && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="w-fit px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-tighter shadow-lg"
                            >
                                Targeted for you
                            </motion.div>
                        )}
                    </div>
                </div>

                <div className="p-5 flex flex-col flex-1 min-h-[300px]">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Burn</p>
                            <p className="text-base font-black text-primary">~{workout.caloriesBurned} kcal</p>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold tracking-tight mb-1 truncate">{workout.name}</h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 h-[32px] mb-4 italic leading-relaxed">
                        "{workout.description}"
                    </p>

                    <div className="bg-primary/5 rounded-xl p-4 mb-6 space-y-2 border border-primary/10 h-[80px] overflow-hidden">
                        <div className="flex items-start gap-2">
                            <Clock className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                            <p className="text-[11px] font-medium leading-tight line-clamp-1">
                                <span className="font-bold">Best Time:</span> {workout.bestTime}
                            </p>
                        </div>
                        <div className="flex items-start gap-2">
                            <Target className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                            <p className="text-[11px] font-medium leading-tight line-clamp-2">
                                <span className="font-bold">How-to:</span> {workout.instructions}
                            </p>
                        </div>
                    </div>

                    {workout.videoUrl && (
                        <a
                            href={workout.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mb-6 w-full py-3 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 group/btn"
                        >
                            <Play className="w-3.5 h-3.5 fill-current transition-transform group-hover/btn:scale-110" />
                            Watch Tutorial
                        </a>
                    )}

                    <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-auto">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                            <Clock className="w-3 h-3 text-primary/70" />
                            {workout.duration} Mins
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                            <Zap className="w-3 h-3 text-primary/70" />
                            {workout.difficulty}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            <Header />
            <main className="flex-1 pt-32 px-4 container mx-auto max-w-6xl pb-20 animate-in fade-in zoom-in-95 duration-500">

                <div className="mb-16 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6 transition-all hover:bg-primary/10">
                        <Dumbbell className="w-3.5 h-3.5" />
                        Your Fitness Hub
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-black tracking-tighter mb-4 leading-none">
                        Move Your Body, <br />
                        <span className="text-primary italic">Fuel Your Soul.</span>
                    </h1>
                    <p className="text-muted-foreground text-lg italic max-w-2xl mx-auto">
                        Guided sessions designed specifically for your body type, goals, and today's nutritional intake.
                    </p>
                </div>

                {!isLoading && surplusWorkouts.length > 0 && stats && (
                    <section className="mb-20 flex flex-col items-center text-center">
                        <div className="flex flex-col items-center gap-4 mb-10">
                            <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
                                <Flame className="w-7 h-7" />
                            </div>
                            <div className="max-w-md">
                                <h2 className="text-3xl font-bold tracking-tight mb-2">Burn Today's Surplus</h2>
                                <p className="text-sm font-medium text-muted-foreground italic">You're currently {stats.consumed - stats.goal} kcal over your goal. Let's balance it out!</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl text-left">
                            {surplusWorkouts.map(w => <WorkoutCard key={w.id} workout={w} highlight />)}
                        </div>
                    </section>
                )}

                <section className="mb-20 flex flex-col items-center text-center">
                    <div className="flex flex-col items-center gap-4 mb-10">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <Target className="w-7 h-7" />
                        </div>
                        <div className="max-w-md">
                            <h2 className="text-3xl font-bold tracking-tight mb-2">Recommended For You</h2>
                            <p className="text-sm font-medium text-muted-foreground italic">Based on your {profile?.goal?.replace('_', ' ')} goal and age settings.</p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-[450px] bg-card/50 rounded-[2rem] animate-pulse border border-border/50" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full text-left">
                            {recommendedWorkouts.map(w => (
                                <div key={w.id} id={`workout-${w.id}`}>
                                    <WorkoutCard workout={w} />
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="flex flex-col items-center text-center">
                    <div className="flex flex-col items-center gap-4 mb-10">
                        <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                            <TrendingUp className="w-7 h-7" />
                        </div>
                        <div className="max-w-md">
                            <h2 className="text-3xl font-bold tracking-tight mb-2">Full Library</h2>
                            <p className="text-sm font-medium text-muted-foreground italic">Explore diverse workouts across all categories.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full text-left">
                        {workouts.filter(w => !recommendedWorkouts.find(r => r.id === w.id)).map(w => (
                            <div key={w.id} id={`workout-${w.id}`}>
                                <WorkoutCard workout={w} />
                            </div>
                        ))}
                    </div>
                </section>

            </main>
            <Footerdemo />
        </div>
    );
}
