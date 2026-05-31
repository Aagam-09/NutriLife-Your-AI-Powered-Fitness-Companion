import { Header } from "@/components/ui/header-2"
import { Footerdemo } from "@/components/blocks/footer-section"
import {
    CheckCircle2, Apple, Plus, GlassWater, Calendar, ChevronRight,
    X,
    Loader2
} from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export function DashboardPage() {
    const navigate = useNavigate()
    const [stats, setStats] = useState({ consumed: 0, goal: 2000, remaining: 2000, protein: 0, carbs: 0, fat: 0, totalWater: 0, waterGoal: 3000 })
    const [weekly, setWeekly] = useState<any[]>([])
    const [insightTexts, setInsightTexts] = useState<string[]>([])
    const [meals, setMeals] = useState<any[]>([])
    const [reminders, setReminders] = useState<any[]>([])
    const [workoutRec, setWorkoutRec] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [showManualLog, setShowManualLog] = useState(false)
    const [manualType, setManualType] = useState<"food" | "water">("food")
    const [manualEntry, setManualEntry] = useState({
        food_name: "",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        quantity: 1,
        unit: "unit",
        is_beverage: false
    })
    const [isSavingManual, setIsSavingManual] = useState(false)
    const [newReminder, setNewReminder] = useState({ meal_type: "", reminder_time: "" })
    const getLocalDateString = () => {
        const date = new Date();
        const tzOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - tzOffset).toISOString().split('T')[0];
    }

    const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());
    const [isRefetching, setIsRefetching] = useState(false);
    const [checkingOffIds, setCheckingOffIds] = useState<number[]>([])

    const fetchData = (isSilent = false, dateToFetch = selectedDate) => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login")
            return
        }
        const headers = { Authorization: `Bearer ${token}` }
        if (!isSilent) {
            setLoading(true)
        } else {
            setIsRefetching(true)
        }
        const safeFetch = (url: string) => fetch(url, { headers }).then(r => r.ok ? r.json() : null).catch(() => null);

        Promise.all([
            safeFetch(`http://localhost:8000/api/v1/calories/today?date=${dateToFetch}`),
            safeFetch("http://localhost:8000/api/v1/calories/weekly"),
            safeFetch(`http://localhost:8000/api/v1/insights?date=${dateToFetch}`),
            safeFetch(`http://localhost:8000/api/v1/meals/today?date=${dateToFetch}`),
            safeFetch("http://localhost:8000/api/v1/meal-reminders"),
            safeFetch("http://localhost:8000/api/v1/workout/recommendation")
        ]).then(([todayRes, weeklyRes, insightsRes, mealsRes, remindersRes, workoutRes]) => {
            if (todayRes) setStats(todayRes.goal ? todayRes : { consumed: 0, goal: 2000, remaining: 2000, protein: 0, carbs: 0, fat: 0, totalWater: 0, waterGoal: 3000 })
            if (weeklyRes) setWeekly(Array.isArray(weeklyRes) ? weeklyRes : [])
            if (insightsRes) setInsightTexts(Array.isArray(insightsRes) ? insightsRes : [])
            if (mealsRes) setMeals(mealsRes.meals || [])
            if (remindersRes) setReminders(Array.isArray(remindersRes) ? remindersRes : [])
            if (workoutRes) setWorkoutRec(workoutRes || null)
            setLoading(false)
            setIsRefetching(false)
        }).catch(err => {
            console.error("Dashboard fetch error:", err)
            setLoading(false)
            setIsRefetching(false)
        })
    }

    useEffect(() => {
        if (loading) {
            fetchData(false, selectedDate)
        } else {
            // Wait slightly before refetch to allow the date state to settle and trigger animations
            setTimeout(() => fetchData(true, selectedDate), 50);
        }
    }, [selectedDate])

    const handleCheckOffReminder = async (id: number) => {
        if (checkingOffIds.includes(id)) return;
        const token = localStorage.getItem("token")
        if (!token) return

        setCheckingOffIds(prev => [...prev, id]);

        setTimeout(async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/v1/meal-reminders/${id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                if (res.ok) {
                    fetchData(true)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setCheckingOffIds(prev => prev.filter(cId => cId !== id));
            }
        }, 1000);
    }

    const handleAddReminder = async (e: React.FormEvent) => {
        e.preventDefault()
        const token = localStorage.getItem("token")
        if (!token) return

        try {
            const res = await fetch("http://localhost:8000/api/v1/meal-reminders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newReminder)
            })
            if (res.ok) {
                setShowAddForm(false)
                setNewReminder({ meal_type: "", reminder_time: "" })
                fetchData(true)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleSaveManual = async (e: React.FormEvent) => {
        e.preventDefault()
        const token = localStorage.getItem("token")
        if (!token) return

        setIsSavingManual(true)
        try {
            const res = await fetch("http://localhost:8000/api/v1/meals/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...manualEntry,
                    meal_type: manualType === "water" ? "beverage" : ""
                })
            })
            if (res.ok) {
                setShowManualLog(false)
                setManualEntry({
                    food_name: "",
                    calories: 0,
                    protein: 0,
                    carbs: 0,
                    fat: 0,
                    quantity: 1,
                    unit: "unit",
                    is_beverage: false
                })
                fetchData(true)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsSavingManual(false)
        }
    }

    const handleQuickAddWater = async () => {
        const token = localStorage.getItem("token")
        if (!token) return

        try {
            await fetch("http://localhost:8000/api/v1/meals/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    food_name: "Water",
                    calories: 0,
                    protein: 0,
                    carbs: 0,
                    fat: 0,
                    quantity: 250,
                    unit: "ml",
                    is_beverage: true,
                    meal_type: "beverage"
                })
            })
            fetchData(true)
        } catch (err) {
            console.error(err)
        }
    }

    const pct = Math.min(100, Math.round(((stats.consumed || 0) / (stats.goal || 2000)) * 100))
    const offset = 251.2 - (251.2 * pct) / 100

    if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            <Header />
            <main className="flex-1 flex flex-col pt-28 px-4 container mx-auto max-w-6xl pb-20 animate-in fade-in zoom-in-95 duration-500">

                <div className="text-center mb-12 max-w-2xl mx-auto flex flex-col items-center">
                    <h1
                        className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => setSelectedDate(getLocalDateString())}
                        title="Click to reset to today"
                    >
                        Daily Summary
                    </h1>
                    <div
                        className="relative group inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-secondary/30 px-5 py-2.5 rounded-full border border-border/50"
                        onClick={(e) => {
                            const input = e.currentTarget.querySelector('input') as HTMLInputElement;
                            if (input && 'showPicker' in input) {
                                try { input.showPicker(); } catch (e) { /* ignore */ }
                            }
                        }}
                    >
                        <Calendar className="w-4 h-4 pointer-events-none" />
                        <span className="text-sm md:text-base font-bold uppercase tracking-wider pointer-events-none">
                            {selectedDate === getLocalDateString()
                                ? `Today, ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}`
                                : new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
                            }
                        </span>
                        <input
                            type="date"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            value={selectedDate}
                            max={getLocalDateString()}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                </div>

                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    initial={false}
                    animate={{
                        opacity: isRefetching ? 0.4 : 1,
                        filter: isRefetching ? "blur(8px)" : "blur(0px)",
                        scale: isRefetching ? 0.98 : 1
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                >

                    {/* Column 1: Macros & Trends */}
                    <div className="space-y-8">
                        {/* Macro Card */}
                        <div className="bg-card rounded-2xl p-6 flex flex-col gap-8 items-center shadow-sm border border-border/50 hover:scale-[1.02] hover:shadow-md transition-all duration-300">
                            {/* Circular Progress */}
                            <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-card-foreground/5" />
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={offset} className="text-primary drop-shadow-sm" strokeLinecap="round" />
                                </svg>
                                <div className="absolute flex flex-col items-center justify-center text-center">
                                    <span className="text-3xl font-extrabold text-foreground">{stats.consumed}</span>
                                    <span className="text-xs font-medium text-muted-foreground">/ {stats.goal} kcal</span>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="w-full grid grid-cols-3 gap-2">
                                <div className="bg-background rounded-xl p-3 shadow-sm border border-border/50">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Protein</p>
                                    <p className="text-lg font-bold mb-2">{Math.round(stats.protein)}<span className="text-xs text-muted-foreground">g</span></p>
                                    <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-700 transition-all rounded-full" style={{ width: `${Math.min(100, (stats.protein / 120) * 100)}%` }} />
                                    </div>
                                </div>
                                <div className="bg-background rounded-xl p-3 shadow-sm border border-border/50">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Carbs</p>
                                    <p className="text-lg font-bold mb-2">{Math.round(stats.carbs)}<span className="text-xs text-muted-foreground">g</span></p>
                                    <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 transition-all rounded-full" style={{ width: `${Math.min(100, (stats.carbs / 250) * 100)}%` }} />
                                    </div>
                                </div>
                                <div className="bg-background rounded-xl p-3 shadow-sm border border-border/50">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Fats</p>
                                    <p className="text-lg font-bold mb-2">{Math.round(stats.fat)}<span className="text-xs text-muted-foreground">g</span></p>
                                    <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                                        <div className="h-full bg-lime-500 transition-all rounded-full" style={{ width: `${Math.min(100, (stats.fat / 70) * 100)}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Water Intake Card (Dashboard) */}
                        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 relative overflow-hidden group hover:scale-[1.02] hover:shadow-md transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hydration</h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleQuickAddWater();
                                        }}
                                        className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm active:scale-90"
                                        title="Quick Add 250ml"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                        <GlassWater className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-baseline gap-2 mb-3">
                                <span className="text-3xl font-extrabold text-foreground">{stats.totalWater || 0}</span>
                                <span className="text-sm font-bold text-muted-foreground">/ {stats.waterGoal || 3000} ml</span>
                            </div>

                            <div className="space-y-2">
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-700 ease-out rounded-full"
                                        style={{ width: `${Math.min(100, ((stats.totalWater || 0) / (stats.waterGoal || 3000)) * 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                                    <span>{Math.round(Math.min(100, ((stats.totalWater || 0) / (stats.waterGoal || 3000)) * 100))}% toward goal</span>
                                    <span>3L daily</span>
                                </div>
                            </div>
                        </div>
                        {/* Weekly Calorie Trends (Sleek Bar Chart Area) */}
                        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 relative overflow-hidden text-left flex-1 flex flex-col justify-end hover:scale-[1.02] hover:shadow-md transition-all duration-300">
                            <div className="mb-6 text-center">
                                <h2 className="text-xl font-extrabold uppercase tracking-tight">Weekly Trends</h2>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest mt-1">Calorie usage over time</p>
                            </div>

                            <div className="relative h-48 w-full group">
                                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 900 200">
                                    {/* Dotted Goal Line */}
                                    <line x1="0" y1="80" x2="900" y2="80" stroke="currentColor" strokeWidth="2" strokeDasharray="8 6" className="text-primary/30" />
                                    <text x="900" y="70" textAnchor="end" className="fill-primary/50 text-xs font-bold tracking-tighter">GOAL: {stats.goal} kcal</text>

                                    {/* Logic for Bar Chart */}
                                    {(() => {
                                        const goal = stats.goal || 2000
                                        const maxVal = Math.max(...weekly.map(d => d.calories || 0), goal)
                                        const chartHeight = 160
                                        const step = 900 / Math.max(7, weekly.length);

                                        return weekly.map((d, i) => {
                                            const val = d.calories || 0
                                            const barHeight = (val / maxVal) * chartHeight
                                            const x = (i * step) + (step / 2) - 35 // Center slightly wider bar
                                            const y = 180 - barHeight

                                            return (
                                                <g key={i}>
                                                    <motion.rect
                                                        initial={{ height: 0, y: 180 }}
                                                        animate={{ height: barHeight, y }}
                                                        transition={{ duration: 0.5, delay: i * 0.05 }}
                                                        x={x}
                                                        width="70"
                                                        rx="12"
                                                        fill="currentColor"
                                                        className={cn(
                                                            "transition-colors",
                                                            val > goal ? "text-emerald-900" : "text-primary/60 hover:text-primary"
                                                        )}
                                                    >
                                                        <title>{val} kcal</title>
                                                    </motion.rect>
                                                    <text x={x + 35} y="198" textAnchor="middle" className="fill-muted-foreground text-sm font-bold uppercase tracking-tighter">{d.day}</text>
                                                    {val > 0 && <text x={x + 35} y={y - 8} textAnchor="middle" className="fill-foreground text-xs font-black">{Math.round(val)}</text>}
                                                </g>
                                            )
                                        })
                                    })()}
                                </svg>
                            </div>
                        </div>

                    </div>

                    {/* Column 2: Timeline */}
                    <div className="space-y-8">
                        {/* Meal Log Timeline Area */}
                        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 h-full hover:scale-[1.02] hover:shadow-md transition-all duration-300">
                            <div className="flex justify-center items-center mb-8 text-center">
                                <h2 className="text-xl font-extrabold uppercase tracking-tight">Meal Log Timeline</h2>
                            </div>

                            <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
                                {meals.length > 0 ? meals.map((m, i) => (
                                    <div key={m.id || i} className="relative">
                                        <div className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-white shadow-sm" />
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-sm text-foreground">{m.food_name}</h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest">
                                                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {m.meal_type}
                                                    </p>
                                                    {m.score != null && (
                                                        <div className={cn(
                                                            "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                                                            m.score >= 8 ? "bg-emerald-500/10 text-emerald-600" :
                                                                m.score >= 5 ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"
                                                        )}>
                                                            Score: {m.score}/10
                                                        </div>
                                                    )}
                                                </div>
                                                {m.analysis_reason && (
                                                    <p className="text-[10px] mt-1 text-muted-foreground italic leading-tight">
                                                        "{m.analysis_reason}"
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right flex flex-col items-end">
                                                <p className="font-extrabold text-base text-foreground">{Math.round(m.calories)} <span className="text-[10px] font-bold text-muted-foreground ml-0.5">kcal</span></p>
                                                <div className="flex gap-1 mt-1 text-[9px] font-bold text-muted-foreground uppercase">
                                                    <span>P: {Math.round(m.protein)}</span>
                                                    <span>C: {Math.round(m.carbs)}</span>
                                                    <span>F: {Math.round(m.fat)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-10 text-center">
                                        <p className="text-sm text-muted-foreground italic">No meals logged today yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="space-y-8">
                        {/* Meal Reminders */}
                        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 hover:scale-[1.02] hover:shadow-md transition-all duration-300">
                            <div className="flex flex-col items-center justify-center mb-6 text-center gap-1">
                                <h2 className="text-xl font-extrabold uppercase tracking-tight">Meal Reminders</h2>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-border px-2 py-0.5 rounded-full">Active</span>
                            </div>
                            <div className="space-y-4">
                                <AnimatePresence mode="popLayout" initial={false}>
                                    {reminders.length > 0 ? reminders.map((rem, i) => {
                                        const isCheckingOff = checkingOffIds.includes(rem.id);
                                        return (
                                            <motion.div
                                                key={rem.id || i}
                                                layout
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, y: 10, filter: "blur(4px)" }}
                                                transition={{ duration: 0.3, ease: "easeIn" }}
                                                className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card transition-all group"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-sm text-primary">
                                                    {rem.meal_type.charAt(0).toUpperCase()}
                                                </div>
                                                <div className={cn("flex-1 text-left transition-all", isCheckingOff && "opacity-50 line-through")}>
                                                    <h4 className="font-bold text-sm text-foreground">{rem.meal_type}</h4>
                                                    <p className="text-[10px] font-medium text-muted-foreground/80">{rem.reminder_time.slice(0, 5)}</p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCheckOffReminder(rem.id);
                                                    }}
                                                    className={cn(
                                                        "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm",
                                                        isCheckingOff
                                                            ? "bg-primary text-white scale-110 shadow-primary/40"
                                                            : "bg-primary/5 text-primary hover:bg-primary/20"
                                                    )}
                                                    title={isCheckingOff ? "Checked!" : "Mark as eaten"}
                                                    disabled={isCheckingOff}
                                                >
                                                    <CheckCircle2 className="w-6 h-6" />
                                                </button>
                                            </motion.div>
                                        );
                                    }) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center py-4"
                                        >
                                            <p className="text-sm text-muted-foreground italic">No reminders set.</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {showAddForm ? (
                                <form onSubmit={handleAddReminder} className="mt-6 p-4 bg-secondary/30 rounded-xl border border-border animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Meal Type (e.g. Breakfast)"
                                            className="w-full h-10 px-3 rounded-lg bg-background border text-sm"
                                            value={newReminder.meal_type}
                                            onChange={e => setNewReminder({ ...newReminder, meal_type: e.target.value })}
                                            required
                                        />
                                        <input
                                            type="time"
                                            className="w-full h-10 px-3 rounded-lg bg-background border text-sm"
                                            value={newReminder.reminder_time}
                                            onChange={e => setNewReminder({ ...newReminder, reminder_time: e.target.value })}
                                            required
                                        />
                                        <div className="flex gap-2">
                                            <button type="submit" className="flex-1 h-10 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90">Save</button>
                                            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 h-10 bg-muted text-foreground text-xs font-bold rounded-lg hover:bg-muted/80">Cancel</button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="w-full mt-6 py-3 border-2 border-dashed border-border rounded-xl text-sm font-bold text-primary hover:bg-primary/5 transition-colors"
                                >
                                    + Add New Reminder
                                </button>
                            )}
                        </div>

                        {/* Smart Insights */}
                        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 hover:scale-[1.02] hover:shadow-md transition-all duration-300">
                            <div className="flex flex-col items-center justify-center mb-6 text-center gap-2">
                                <span className="text-primary bg-primary/10 p-2 rounded-full hidden md:flex"><Apple className="w-5 h-5" /></span>
                                <h2 className="text-xl font-extrabold uppercase tracking-tight">Smart Insights</h2>
                            </div>
                            <div className="space-y-4">
                                {insightTexts.length > 0 ? insightTexts.map((text, idx) => {
                                    const parts = text.split(" | ");
                                    const tip = parts[0];
                                    const exercise = parts[1];
                                    const workoutId = parts[2];

                                    return (
                                        <div key={idx} className="bg-secondary/40 border border-secondary rounded-xl p-4 flex flex-col gap-3">
                                            <div className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Quick Tip</p>
                                                    <p className="text-xs font-medium leading-snug">{tip}</p>
                                                </div>
                                            </div>
                                            {exercise && (
                                                <div className="flex items-start gap-3 border-t border-border pt-3">
                                                    <div className="w-5 h-5 flex items-center justify-center text-blue-500 shrink-0 mt-0.5">🏃‍♂️</div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <p className="text-xs font-bold uppercase tracking-wider text-blue-500/70">Action</p>
                                                            {workoutId && (
                                                                <button
                                                                    onClick={() => navigate(`/workouts?id=${workoutId}`)}
                                                                    className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                                                                >
                                                                    View Workout <ChevronRight className="w-2.5 h-2.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="text-xs font-medium leading-snug">{exercise}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                }) : (
                                    <p className="text-sm text-muted-foreground">No insights yet. Start logging meals!</p>
                                )}
                                {workoutRec && workoutRec.surplus > 0 && (
                                    <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mt-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 rounded-full bg-destructive text-white text-xs">!</div>
                                            <div>
                                                <p className="text-destructive font-bold text-xs uppercase mb-1">Calorie Surplus</p>
                                                <p className="text-xs font-medium leading-snug">{workoutRec.suggestion}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* Floating Action Button Group */}
            <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-40">
                <button
                    onClick={() => {
                        setManualType("food");
                        setManualEntry({
                            food_name: "",
                            calories: 0,
                            protein: 0,
                            carbs: 0,
                            fat: 0,
                            quantity: 1,
                            unit: "unit",
                            is_beverage: false
                        });
                        setShowManualLog(true);
                    }}
                    className="w-12 h-12 bg-white text-primary border-2 border-primary/20 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
                    title="Manual log"
                >
                    <Plus className="w-6 h-6" />
                </button>
                <button
                    onClick={() => navigate("/meals")}
                    className="w-14 h-14 bg-primary text-white rounded-full shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
                    title="AI Scanner"
                >
                    <Apple className="w-8 h-8 font-black" />
                </button>
            </div>

            {/* Manual Entry Modal */}
            <AnimatePresence>
                {showManualLog && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-card border border-border/50 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <form onSubmit={handleSaveManual} className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-black tracking-tight">Manual Log</h2>
                                    <button
                                        type="button"
                                        onClick={() => setShowManualLog(false)}
                                        className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5 ml-1">Food Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Example: Almonds, Salad, Coffee..."
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                            value={manualEntry.food_name}
                                            onChange={e => setManualEntry({ ...manualEntry, food_name: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5 ml-1">Calories (kcal)</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                            value={manualEntry.calories || ""}
                                            onChange={e => setManualEntry({ ...manualEntry, calories: Number(e.target.value) })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5 ml-1">Protein (g)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-background border border-border rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                                value={manualEntry.protein || ""}
                                                onChange={e => setManualEntry({ ...manualEntry, protein: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5 ml-1">Carbs (g)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-background border border-border rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                                value={manualEntry.carbs || ""}
                                                onChange={e => setManualEntry({ ...manualEntry, carbs: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5 ml-1">Fat (g)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-background border border-border rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                                value={manualEntry.fat || ""}
                                                onChange={e => setManualEntry({ ...manualEntry, fat: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowManualLog(false)}
                                            className="px-6 py-3.5 rounded-2xl bg-secondary text-foreground font-bold hover:bg-muted transition-all uppercase tracking-widest text-[10px]"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSavingManual}
                                            className="px-6 py-3.5 rounded-2xl bg-primary text-white font-black hover:opacity-90 transition-all uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                        >
                                            {isSavingManual ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Entry"}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Footerdemo />
        </div>
    )
}


