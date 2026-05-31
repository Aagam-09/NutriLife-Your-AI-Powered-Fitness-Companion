import { Header } from "@/components/ui/header-2"
import { Footerdemo } from "@/components/blocks/footer-section"
import { Maximize, Loader2, Camera, Laptop, X, Minus, Plus, GlassWater, Utensils } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export function MealLoggerPage() {
    const navigate = useNavigate()
    const [stats, setStats] = useState({ consumed: 0, goal: 2000, remaining: 2000, protein: 0, carbs: 0, fat: 0, totalWater: 0, waterGoal: 3000 })
    const [meals, setMeals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [swapSuggestion, setSwapSuggestion] = useState<any>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const [uploading, setUploading] = useState(false)
    const [showOptions, setShowOptions] = useState(false)
    const [isCameraActive, setIsCameraActive] = useState(false)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [showQuantityModal, setShowQuantityModal] = useState(false)
    const [showManualLog, setShowManualLog] = useState(false)
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
    const [currentDetection, setCurrentDetection] = useState<any>(null)
    const [quantityInput, setQuantityInput] = useState<number>(1)
    const scannerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (scannerRef.current && !scannerRef.current.contains(event.target as Node)) {
                setShowOptions(false)
            }
        }

        if (showOptions) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [showOptions])

    const fetchTodayData = () => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login")
            return
        }
        const headers = { Authorization: `Bearer ${token}` }
        Promise.all([
            fetch("http://localhost:8000/api/v1/calories/today", { headers }).then(r => r.json()),
            fetch("http://localhost:8000/api/v1/meals/today", { headers }).then(r => r.json())
        ]).then(([todayRes, mealsRes]) => {
            setStats(todayRes.goal ? todayRes : { consumed: 0, goal: 2000, remaining: 2000, protein: 0, carbs: 0, fat: 0 })
            setMeals(mealsRes.meals || [])
            setLoading(false)
        }).catch(err => {
            console.error(err)
            setLoading(false)
        })
    }

    useEffect(() => {
        fetchTodayData()
    }, [])

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
        setShowOptions(false)
        processImage(file)
    }

    const startCamera = async () => {
        setShowOptions(false)
        setIsCameraActive(true)
        try {
            const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            setStream(s)
            if (videoRef.current) videoRef.current.srcObject = s
        } catch (err) {
            console.error("Camera error:", err)
            alert("Could not access camera.")
            setIsCameraActive(false)
        }
    }

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
            setStream(null)
        }
        setIsCameraActive(false)
    }

    const capturePhoto = () => {
        if (!videoRef.current) return
        const canvas = document.createElement("canvas")
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight
        const ctx = canvas.getContext("2d")
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0)
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], "captured-food.jpg", { type: "image/jpeg" })
                    stopCamera()
                    processImage(file)
                }
            }, "image/jpeg")
        }
    }

    const processImage = async (file: File) => {
        setUploading(true)
        setSwapSuggestion(null)
        const token = localStorage.getItem("token")

        try {
            const formData = new FormData()
            formData.append("image", file)

            // 1. Analyze Food
            const analyzeRes = await fetch("http://localhost:8000/api/v1/food/analyze", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            })

            if (!analyzeRes.ok) {
                if (analyzeRes.status === 503) {
                    throw new Error("AI is currently overloaded or reached its quota. Please try again in a few minutes.")
                }
                throw new Error("Failed to analyze food. Make sure the photo is clear.")
            }
            const nutritionData = await analyzeRes.json()

            // 1.5. Check for Quota Error BEFORE logging
            if (nutritionData.food_name?.includes("Quota Exceeded")) {
                alert("Daily limit for AI analysis reached. Please try again tomorrow or upgrade to Pro! 🚀")
                return
            }

            // 1.8. Detection Success - Show Quantity Modal OR auto-log
            setCurrentDetection(nutritionData)
            const isLiquid = nutritionData.is_beverage || nutritionData.unit === 'ml'

            if (isLiquid) {
                setQuantityInput(250) // Reset to 250ml for beverages
                setShowQuantityModal(true)
            } else {
                // Automatically log solid foods as 1 whole unit
                await logMealWithData(nutritionData, 1)
            }

        } catch (err) {
            console.error(err)
            alert("Error scanning food. Please try again.")
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    const logMealWithData = async (detectionData: any, q: number) => {
        setUploading(true)
        const token = localStorage.getItem("token")

        try {
            // Determine multiplier. If unit is 'ml', AI gave stats per 100ml. So multiplier is q / 100.
            const isLiquidMatch = detectionData.unit === 'ml' || detectionData.is_beverage;
            const multiplier = isLiquidMatch ? (q / 100) : q;

            // 2. Add Meal with multiplied values
            const addRes = await fetch("http://localhost:8000/api/v1/meals/add", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    food_name: detectionData.food_name || "Unknown Meal",
                    calories: (detectionData.calories || 0) * multiplier,
                    protein: (detectionData.protein || 0) * multiplier,
                    carbs: (detectionData.carbs || 0) * multiplier,
                    fat: (detectionData.fat || 0) * multiplier,
                    sugar: (detectionData.sugar || 0) * multiplier,
                    fiber: (detectionData.fiber || 0) * multiplier,
                    sodium: (detectionData.sodium || 0) * multiplier,
                    cholesterol: (detectionData.cholesterol || 0) * multiplier,
                    is_processed: detectionData.is_processed || false,
                    is_fried: detectionData.is_fried || false,
                    contains_refined_flour: detectionData.contains_refined_flour || false,
                    is_food: detectionData.is_food ?? true,
                    is_beverage: detectionData.is_beverage ?? false,
                    quantity: q,
                    unit: detectionData.unit || "unit",
                    meal_type: ""
                })
            })

            if (!addRes.ok) throw new Error("Failed to log meal")
            const addedMeal = await addRes.json()

            if (addedMeal.swap_suggestion) {
                setSwapSuggestion({
                    original: detectionData.food_name,
                    healthy: addedMeal.swap_suggestion.healthy_alternative,
                    reason: addedMeal.swap_suggestion.reason
                })
            } else {
                fetchTodayData()
            }
            setShowQuantityModal(false)
        } catch (err) {
            console.error(err)
            alert("Error logging meal.")
        } finally {
            setUploading(false)
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
                body: JSON.stringify(manualEntry)
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
                fetchTodayData()
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsSavingManual(false)
        }
    }

    const confirmLogging = async () => {
        if (!currentDetection) return
        await logMealWithData(currentDetection, quantityInput || 1)
    }
    const pct = Math.min(100, Math.round(((stats?.consumed || 0) / (stats?.goal || 2000)) * 100))

    if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            <Header />
            <main className="flex-1 flex flex-col pt-28 px-4 container mx-auto max-w-6xl pb-20 animate-in fade-in zoom-in-95 duration-500">

                <div className="text-center mb-12 max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                        Log your meal
                    </h1>
                    <p className="text-muted-foreground text-lg">Instant AI analysis for your nutrition. Scan, track, and optimize every bite.</p>
                </div>

                {/* Top Row: Consumed, Scanner, Burned in 3 columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-stretch">
                    {/* Consumed Card */}
                    <div className="bg-card rounded-2xl p-6 flex flex-col justify-center border border-border/50 shadow-sm relative overflow-hidden hover:scale-[1.02] hover:shadow-md transition-all duration-300">
                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Calories Consumed</h3>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-4xl font-extrabold text-foreground">{stats.consumed}</span>
                            <span className="text-lg font-medium text-muted-foreground">kcal</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs font-medium text-primary">{pct}% of goal</p>
                    </div>

                    {/* AI Scanner Card with Camera Logic */}
                    <div ref={scannerRef} className="bg-card rounded-2xl border border-border/50 shadow-sm relative overflow-hidden group transition-all duration-300 min-h-[220px] flex flex-col">
                        {!isCameraActive ? (
                            <div className="h-full p-6 flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Maximize className="w-6 h-6" />
                                </div>
                                <h3 className="text-sm font-bold mb-2">AI Food Scanner</h3>
                                <p className="text-[10px] text-muted-foreground mb-4 leading-tight">Identify nutrients from your meal photo</p>

                                <button
                                    onClick={() => setShowOptions(true)}
                                    disabled={uploading}
                                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2 rounded-xl text-xs shadow-md transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                                >
                                    {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                                    {uploading ? "Analyzing..." : "Log Photo"}
                                </button>
                                <button
                                    onClick={() => setShowManualLog(true)}
                                    disabled={uploading}
                                    className="w-full bg-secondary hover:bg-muted text-foreground font-bold py-2 rounded-xl text-[10px] transition-all uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
                                >
                                    <Plus className="w-3 h-3" />
                                    Manual Log
                                </button>
                            </div>
                        ) : (
                            <div className="relative h-full w-full">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover rounded-2xl"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                                <button
                                    onClick={capturePhoto}
                                    className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-white text-black shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-10"
                                >
                                    <div className="w-8 h-8 rounded-full border-2 border-black" />
                                </button>

                                <button
                                    onClick={stopCamera}
                                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all z-10"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <AnimatePresence>
                            {showOptions && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={() => setShowOptions(false)}
                                    className="absolute inset-0 bg-background/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 gap-4 cursor-pointer"
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            fileInputRef.current?.click();
                                        }}
                                        className="w-full bg-card hover:bg-muted border border-border rounded-2xl p-4 flex items-center gap-4 transition-all shadow-sm"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                                            <Laptop className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-xs">From Computer</p>
                                            <p className="text-[10px] text-muted-foreground">Select existing photo</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            startCamera();
                                        }}
                                        className="w-full bg-card hover:bg-muted border border-border rounded-2xl p-4 flex items-center gap-4 transition-all shadow-sm"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                                            <Camera className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-xs">Use Camera</p>
                                            <p className="text-[10px] text-muted-foreground">Take a live photo</p>
                                        </div>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Water Intake Card */}
                    <div className="bg-primary rounded-2xl p-6 flex flex-col justify-between text-white shadow-lg shadow-primary/20 hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
                        <GlassWater className="w-6 h-6 text-white/80 mb-4" />
                        <div>
                            <h3 className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Water Intake</h3>
                            <div className="flex items-baseline gap-1.5 mb-3">
                                <span className="text-3xl font-extrabold">{stats.totalWater || 0}</span>
                                <span className="text-sm font-medium opacity-80">/ {stats.waterGoal || 3000} ml</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white transition-all duration-500"
                                    style={{ width: `${Math.min(100, ((stats.totalWater || 0) / (stats.waterGoal || 3000)) * 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                />

                {/* Display Swap Suggestion Alert */}
                {swapSuggestion && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 mb-8 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-sm mt-1">🌿</div>
                        <div>
                            <h3 className="font-extrabold text-lg text-emerald-700 tracking-tight">Smart Swap Found!</h3>
                            <p className="text-sm font-medium text-foreground mt-1">
                                Instead of <span className="font-bold border-b border-dashed border-border">{swapSuggestion.original}</span>,
                                try <span className="font-bold text-emerald-600">{swapSuggestion.alternative}</span>.
                            </p>
                            <p className="text-xs text-muted-foreground mt-2 italic">"{swapSuggestion.reason}"</p>
                        </div>
                        <button onClick={() => setSwapSuggestion(null)} className="ml-auto text-muted-foreground hover:text-foreground">✕</button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left Column: Today's Meals List */}
                    <div className="mb-12">
                        <div className="flex justify-center items-center mb-6 text-center">
                            <h2 className="text-xl font-extrabold uppercase tracking-tight">Recent Meals</h2>
                        </div>

                        <div className="space-y-4">
                            {meals.slice(0, 4).map((meal, idx) => (
                                <div key={idx} className="bg-card rounded-2xl p-4 flex items-center justify-between border border-transparent hover:border-primary/20 transition-all cursor-pointer shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center text-2xl shadow-sm border border-border/50 shrink-0">🍽️</div>
                                        <div>
                                            <h4 className="font-bold text-foreground capitalize leading-tight">{meal.food_name}</h4>
                                            <p className="text-xs text-muted-foreground mt-0.5 font-medium">{meal.meal_type}</p>
                                            {meal.score != null && (
                                                <div className="mt-2">
                                                    <span className={cn(
                                                        "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                                                        meal.score >= 8 ? "bg-emerald-500/10 text-emerald-600" :
                                                            meal.score >= 5 ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"
                                                    )}>
                                                        Health Score: {meal.score}/10
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-lg">{meal.calories}</span> <span className="text-xs text-muted-foreground font-bold">kcal</span>
                                    </div>
                                </div>
                            ))}
                            {meals.length === 0 && (
                                <div className="bg-card/50 rounded-2xl p-6 flex items-center justify-center border border-dashed border-border transition-all">
                                    <div className="flex flex-col items-center gap-4 opacity-50 text-center">
                                        <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center text-2xl shadow-sm">🍪</div>
                                        <div>
                                            <h4 className="font-bold text-foreground italic">No meals logged yet</h4>
                                            <p className="text-xs text-muted-foreground mt-1 italic">Click + to add</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Nutrient Breakdown */}
                    <div>
                        <div className="flex justify-center items-center mb-6 text-center">
                            <h2 className="text-xl font-extrabold uppercase tracking-tight">Nutrient Breakdown</h2>
                        </div>
                        <div className="space-y-6">

                            <div className="bg-card rounded-3xl p-6 border border-border/50 shadow-sm relative overflow-hidden hover:scale-[1.05] hover:shadow-md transition-all duration-300">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="font-bold text-muted-foreground uppercase text-xs tracking-wider">Protein</span>
                                    <span className="text-xl font-bold text-foreground">{Math.round(stats.protein)}g <span className="text-xs text-muted-foreground font-medium">/ 120g</span></span>
                                </div>
                                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-700 transition-all rounded-full" style={{ width: `${Math.min(100, (stats.protein / 120) * 100)}%` }} />
                                </div>
                            </div>

                            <div className="bg-card rounded-3xl p-6 border border-border/50 shadow-sm relative overflow-hidden hover:scale-[1.05] hover:shadow-md transition-all duration-300">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="font-bold text-muted-foreground uppercase text-xs tracking-wider">Carbs</span>
                                    <span className="text-xl font-bold text-foreground">{Math.round(stats.carbs)}g <span className="text-xs text-muted-foreground font-medium">/ 250g</span></span>
                                </div>
                                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 transition-all rounded-full" style={{ width: `${Math.min(100, (stats.carbs / 250) * 100)}%` }} />
                                </div>
                            </div>

                            <div className="bg-card rounded-3xl p-6 border border-border/50 shadow-sm relative overflow-hidden hover:scale-[1.05] hover:shadow-md transition-all duration-300">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="font-bold text-muted-foreground uppercase text-xs tracking-wider">Fats</span>
                                    <span className="text-xl font-bold text-foreground">{Math.round(stats.fat)}g <span className="text-xs text-muted-foreground font-medium">/ 70g</span></span>
                                </div>
                                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-lime-500 transition-all rounded-full" style={{ width: `${Math.min(100, (stats.fat / 70) * 100)}%` }} />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                <AnimatePresence>
                    {showQuantityModal && currentDetection && (
                        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-card border border-border/50 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                            >
                                <div className="p-8 text-center">
                                    <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
                                        {currentDetection.is_beverage ? <GlassWater className="w-10 h-10" /> : <Utensils className="w-10 h-10" />}
                                    </div>

                                    <h2 className="text-2xl font-black mb-2 capitalize">{currentDetection.food_name}</h2>
                                    <p className="text-muted-foreground text-sm font-medium mb-8 uppercase tracking-widest">Detection Successful</p>

                                    <div className="bg-muted/30 rounded-2xl p-6 mb-8">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-4">
                                            How much did you {currentDetection.is_beverage ? 'drink' : 'eat'}?
                                        </label>

                                        <div className="flex items-center justify-center gap-6">
                                            <button
                                                onClick={() => setQuantityInput(prev => {
                                                    const step = (currentDetection?.is_beverage || currentDetection?.unit === 'ml') ? 50 : 0.5;
                                                    return Math.max(step, prev - step);
                                                })}
                                                className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors active:scale-95"
                                            >
                                                <Minus className="w-5 h-5" />
                                            </button>

                                            <div className="flex flex-col items-center">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-5xl font-black text-foreground">{quantityInput}</span>
                                                    <span className="text-lg font-bold text-muted-foreground lowercase">{currentDetection.unit || 'unit'}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setQuantityInput(prev => {
                                                    const step = (currentDetection?.is_beverage || currentDetection?.unit === 'ml') ? 50 : 0.5;
                                                    return prev + step;
                                                })}
                                                className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 active:scale-95"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => { setShowQuantityModal(false); setCurrentDetection(null); }}
                                            className="py-4 rounded-2xl bg-secondary text-foreground font-bold hover:bg-secondary/80 transition-all uppercase tracking-widest text-[10px]"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmLogging}
                                            disabled={uploading}
                                            className="py-4 rounded-2xl bg-primary text-white font-black hover:opacity-90 transition-all uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 disabled:opacity-50"
                                        >
                                            {uploading ? "Logging..." : "Log Entry"}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
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
            </main>

            <Footerdemo />
        </div>
    )
}
