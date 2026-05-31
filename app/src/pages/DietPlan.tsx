import { useState, useEffect } from "react";
import { Header } from "@/components/ui/header-2";
import { Footerdemo } from "@/components/blocks/footer-section";
import { getDietPlan, type DietPlan as DietPlanType, type MealOption } from "@/data/dietPlans";
import { Coffee, Sun, Moon, Loader2, CheckCircle2, Activity, User, Plus } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type SavedPlan = DietPlanType & {
    name: string;
    goal: string;
    dietType: string;
    activityLevel: string;
};

export function DietPlanPage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [hasTakenQuiz, setHasTakenQuiz] = useState(false);

    // Quiz State
    const [planName, setPlanName] = useState("");
    const [goal, setGoal] = useState("lose");
    const [dietType, setDietType] = useState("any");
    const [activityLevel, setActivityLevel] = useState("moderate");

    // All Saved Plans
    const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
    const [activePlanId, setActivePlanId] = useState<string | null>(null);

    // Switching Logic State
    const [isSwitchDialogOpen, setIsSwitchDialogOpen] = useState(false);
    const [planToSwitch, setPlanToSwitch] = useState<SavedPlan | null>(null);

    // Temp logging state
    const [activeTab, setActiveTab] = useState<"breakfast" | "lunch" | "dinner">("breakfast");
    const [loggingId, setLoggingId] = useState<string | null>(null);
    const [successIds, setSuccessIds] = useState<string[]>([]);

    // Persistence
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch user to get a unique identifier for scoping localStorage keys
        axios.get("http://localhost:8000/api/v1/auth/me", {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            const userIdent = res.data.email || res.data.id.toString();
            setUserId(userIdent);

            const storedPlans = localStorage.getItem(`savedDietPlans_${userIdent}`);
            const storedActiveId = localStorage.getItem(`activePlanId_${userIdent}`);

            if (storedPlans) {
                const parsedPlans = JSON.parse(storedPlans);
                setSavedPlans(parsedPlans);
                if (storedActiveId) {
                    setActivePlanId(storedActiveId);
                    setHasTakenQuiz(true);
                }
            }
        }).catch(err => {
            console.error("Failed to fetch user for dietary scoping:", err);
        });
    }, []);

    const activePlan = savedPlans.find(p => p.id === activePlanId) || null;

    const syncCalorieGoal = async (planGoal: string) => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            await axios.post(
                "http://localhost:8000/api/v1/user/profile",
                { goal: planGoal },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error("Failed to sync calorie goal:", error);
        }
    };

    const handleQuizSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const basePlan = getDietPlan(goal, dietType, activityLevel);
        const newPlan: SavedPlan = {
            ...basePlan,
            id: `plan_${Date.now()}`,
            name: planName || `Plan ${savedPlans.length + 1}`,
            goal,
            dietType,
            activityLevel,
        };

        const updatedPlans = [...savedPlans, newPlan];
        setSavedPlans(updatedPlans);
        setActivePlanId(newPlan.id);

        if (userId) {
            localStorage.setItem(`savedDietPlans_${userId}`, JSON.stringify(updatedPlans));
            localStorage.setItem(`activePlanId_${userId}`, newPlan.id);
        }

        syncCalorieGoal(goal);

        setHasTakenQuiz(true);
        setPlanName("");
    };



    const handleCreateNew = () => {
        setHasTakenQuiz(false);
    };

    const handleLogMeal = async (meal: MealOption) => {
        try {
            setLoggingId(meal.id);
            const token = localStorage.getItem("token");

            const payload = {
                food_name: meal.name,
                calories: meal.calories,
                protein: meal.protein,
                carbs: meal.carbs,
                fat: meal.fat,
                meal_type: activeTab,
                quantity: 1,
                unit: meal.unit
            };

            await axios.post(
                "http://127.0.0.1:8000/api/v1/meals/add",
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccessIds(prev => [...prev, meal.id]);
            setTimeout(() => {
                setSuccessIds(prev => prev.filter(id => id !== meal.id));
            }, 3000);

        } catch (error) {
            console.error("Failed to log meal:", error);
        } finally {
            setLoggingId(null);
        }
    };

    if (!hasTakenQuiz) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
                <Header />
                <main className="flex-1 flex flex-col pt-32 px-6 max-w-2xl mx-auto w-full mb-20 text-center md:text-left">
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="text-center">
                            <h1 className="text-4xl font-extrabold tracking-tight">Personalized Indian Diet</h1>
                            <p className="text-muted-foreground mt-2 text-lg">Answer these questions to get your tailored daily meal plan.</p>
                        </div>

                        <form onSubmit={handleQuizSubmit} className="space-y-8 bg-card p-6 md:p-8 rounded-3xl border border-border shadow-lg">
                            {/* Plan Name */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <User className="w-4 h-4" />
                                    <label className="text-sm font-bold uppercase tracking-widest">Plan Name</label>
                                </div>
                                <Input
                                    placeholder="e.g. My Fat Loss Journey"
                                    value={planName}
                                    onChange={e => setPlanName(e.target.value)}
                                    className="h-12 text-lg rounded-xl text-center md:text-left"
                                />
                            </div>

                            {/* Question 1: Goal */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <Activity className="w-4 h-4" />
                                    <label className="text-sm font-bold uppercase tracking-widest">Primary Goal</label>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {["lose", "maintain", "build"].map((g) => (
                                        <div
                                            key={g}
                                            onClick={() => setGoal(g)}
                                            className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${goal === g ? 'border-primary bg-primary/10 font-bold' : 'border-border hover:border-primary/50'}`}
                                        >
                                            {g === "lose" ? "Lose Fat" : g === "maintain" ? "Maintain" : "Build Muscle"}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Question 2: Diet Type */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <Loader2 className="w-4 h-4" />
                                    <label className="text-sm font-bold uppercase tracking-widest">Dietary Preference</label>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {["any", "vegetarian", "vegan"].map((d) => (
                                        <div
                                            key={d}
                                            onClick={() => setDietType(d)}
                                            className={`p-3 rounded-xl border text-center cursor-pointer transition-all text-sm ${dietType === d ? 'border-primary bg-primary/10 font-bold' : 'border-border hover:border-primary/50'}`}
                                        >
                                            {d === "any" ? "Standard" : d.charAt(0).toUpperCase() + d.slice(1)}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Question 3: Activity Level */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <Activity className="w-4 h-4" />
                                    <label className="text-sm font-bold uppercase tracking-widest">Activity Level</label>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {["sedentary", "moderate", "active"].map((a) => (
                                        <div
                                            key={a}
                                            onClick={() => setActivityLevel(a)}
                                            className={`p-3 rounded-xl border text-center cursor-pointer transition-all text-sm ${activityLevel === a ? 'border-primary bg-primary/10 font-bold' : 'border-border hover:border-primary/50'}`}
                                        >
                                            {a.charAt(0).toUpperCase() + a.slice(1)}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full py-4 rounded-xl bg-foreground text-background font-bold text-lg hover:scale-[1.02] transition-transform shadow-xl hover:shadow-primary/20 active:scale-95"
                                >
                                    Generate My Indian Plan
                                </button>
                            </div>
                        </form>

                        {savedPlans.length > 0 && (
                            <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setHasTakenQuiz(true)}>
                                Back to current plan
                            </Button>
                        )}
                    </div>
                </main>
            </div>
        );
    }

    if (!activePlan) return null;

    const currentMeals = activeTab === "breakfast" ? activePlan.breakfasts : activeTab === "lunch" ? activePlan.lunches : activePlan.dinners;

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            <Header />
            <main className="flex-1 flex flex-col pt-32 px-6 max-w-5xl mx-auto w-full pb-20 animate-in fade-in zoom-in-95 duration-500">

                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground pb-2">
                        {activePlan.title}
                    </h1>
                    <p className="text-muted-foreground mt-3 text-lg md:text-xl max-w-2xl mx-auto">
                        {activePlan.description}
                    </p>
                </div>

                <div className="mb-12">
                    <Tabs value={activePlanId || ""}>
                        <TabsList className="relative h-auto w-full gap-0.5 bg-transparent p-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border justify-center overflow-x-auto flex-nowrap scrollbar-hide">
                            {savedPlans.map((plan) => (
                                <TabsTrigger
                                    key={plan.id}
                                    value={plan.id}
                                    onClick={(e) => {
                                        if (plan.id === activePlanId) return;
                                        e.preventDefault();
                                        setPlanToSwitch(plan);
                                        setIsSwitchDialogOpen(true);
                                    }}
                                    className="overflow-hidden rounded-b-none border-x border-t border-border bg-muted/30 py-2.5 px-6 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:z-10 data-[state=active]:shadow-none data-[state=active]:border-b-background transition-all whitespace-nowrap font-bold text-xs uppercase tracking-widest"
                                >
                                    {plan.name}
                                </TabsTrigger>
                            ))}
                            <button
                                onClick={handleCreateNew}
                                className="flex items-center justify-center w-10 h-10 text-muted-foreground hover:text-primary transition-colors border-t border-r border-transparent hover:border-border hover:bg-secondary/20 rounded-t-lg"
                                title="New Plan"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="flex p-1 bg-muted/50 rounded-2xl mb-8 max-w-md mx-auto w-full border border-border sticky top-32 z-20 backdrop-blur-md">
                    {[
                        { id: "breakfast", icon: Coffee, label: "Breakfast" },
                        { id: "lunch", icon: Sun, label: "Lunch" },
                        { id: "dinner", icon: Moon, label: "Dinner" }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                                    isActive
                                        ? "bg-background shadow-md text-primary ring-1 ring-primary/10"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <Icon className={cn("w-4 h-4 hidden sm:block transition-colors", isActive ? "text-primary" : "text-muted-foreground")} />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentMeals.map((meal) => {
                        const isSuccess = successIds.includes(meal.id);
                        const isLogging = loggingId === meal.id;

                        return (
                            <div key={meal.id} className="bg-card border border-border rounded-3xl p-6 flex flex-col shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {meal.tags.map(tag => (
                                        <span key={tag} className="text-[10px] font-bold px-2 py-1 bg-primary/10 text-primary rounded-md uppercase tracking-wide">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <h3 className="text-xl font-bold leading-tight mb-1">{meal.name}</h3>
                                <div className="text-3xl font-black text-primary mb-6">{meal.calories} <span className="text-lg text-muted-foreground font-semibold">kcal</span></div>

                                <div className="bg-muted/30 rounded-2xl p-4 mb-6 grid grid-cols-3 gap-2 text-center mt-auto border border-border/50">
                                    <div>
                                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Protein</div>
                                        <div className="font-bold">{meal.protein}g</div>
                                    </div>
                                    <div className="border-x border-border/50">
                                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Carbs</div>
                                        <div className="font-bold">{meal.carbs}g</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Fat</div>
                                        <div className="font-bold">{meal.fat}g</div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleLogMeal(meal)}
                                    disabled={isLogging || isSuccess}
                                    className={cn(
                                        "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:scale-100",
                                        isSuccess
                                            ? "bg-primary/10 text-primary border border-primary/20"
                                            : "bg-foreground text-background hover:bg-primary transition-colors disabled:opacity-70"
                                    )}
                                >
                                    {isLogging ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : isSuccess ? (
                                        <div className="flex items-center gap-2 animate-in zoom-in-50 duration-300">
                                            <CheckCircle2 className="w-5 h-5 text-primary" />
                                            <span>Logged!</span>
                                        </div>
                                    ) : (
                                        <>Eat This</>
                                    )}
                                </button>

                            </div>
                        )
                    })}
                </div>

                <Dialog open={isSwitchDialogOpen} onOpenChange={setIsSwitchDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black">Switch Plan?</DialogTitle>
                            <DialogDescription className="text-base">
                                You are about to switch to <span className="font-bold text-primary capitalize">{planToSwitch?.name}</span>.
                                Your daily calorie goals will be updated accordingly.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="secondary"
                                onClick={() => setIsSwitchDialogOpen(false)}
                                className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-6"
                            >
                                Stay on current
                            </Button>
                            <Button
                                onClick={() => {
                                    if (planToSwitch) {
                                        setActivePlanId(planToSwitch.id);
                                        if (userId) {
                                            localStorage.setItem(`activePlanId_${userId}`, planToSwitch.id);
                                        }
                                        syncCalorieGoal(planToSwitch.goal);
                                        setIsSwitchDialogOpen(false);
                                    }
                                }}
                                className="rounded-xl font-black uppercase tracking-widest text-[10px] py-6 bg-primary hover:bg-primary/90"
                            >
                                Yes, Switch Plan
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </main>
            <Footerdemo />
        </div>
    );
}
