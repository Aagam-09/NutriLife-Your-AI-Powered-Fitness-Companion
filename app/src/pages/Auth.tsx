import { Header } from "@/components/ui/header-2"
import { Footerdemo } from "@/components/blocks/footer-section"
import { Apple, Eye, EyeOff, Loader2 } from "lucide-react"
import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AuthPage() {
    const [searchParams] = useSearchParams()
    const isRegisterInitial = searchParams.get("mode") === "signup"
    const [isLogin, setIsLogin] = useState(!isRegisterInitial)
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        age: "",
        height: "",
        weight: "",
        gender: "male",
        activity_level: "moderate",
        goal: "maintain"
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isLogin && step < 3) {
            setStep(prev => prev + 1)
            return
        }

        setIsLoading(true)
        setError("")

        const endpoint = isLogin ? "/api/v1/auth/login" : "/api/v1/auth/register"

        if (!isLogin) {
            const password = formData.password;
            if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
                setError("Password must meet complexity requirements.");
                setIsLoading(false);
                setStep(1);
                return;
            }
        }

        const payload = isLogin
            ? { email: formData.email, password: formData.password }
            : {
                username: formData.email.split('@')[0] + "_" + Math.floor(Math.random() * 1000),
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                password: formData.password,
                age: parseInt(formData.age) || 0,
                height: parseFloat(formData.height) || 0,
                weight: parseFloat(formData.weight) || 0,
                gender: formData.gender,
                activity_level: formData.activity_level,
                goal: formData.goal
            }

        try {
            const res = await fetch(`http://localhost:8000${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.detail || data.error || (isLogin ? "Login failed" : "Registration failed"))
            }
            if (data.token) {
                // Clear any legacy non-scoped keys to prevent data leakage
                localStorage.removeItem("savedDietPlans")
                localStorage.removeItem("activePlanId")

                localStorage.setItem("token", data.token)
                navigate("/dashboard")
            }
        } catch (err: any) {
            setError(err.message)
            if (!isLogin) setStep(1)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            <Header />
            <main className="flex-1 flex flex-col pt-32 px-4 container mx-auto max-w-6xl pb-20 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex-1 flex bg-card rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/5 border border-border/50 min-h-[500px]">
                    {/* Left side Image Hero */}
                    <div className="hidden lg:flex flex-1 relative bg-zinc-900 overflow-hidden">
                        <img
                            src={isLogin
                                ? "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2670&auto=format&fit=crop"
                                : "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2653&auto=format&fit=crop"
                            }
                            alt="Background"
                            className="absolute inset-0 w-full h-full object-cover opacity-50"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                        <div className="relative z-10 flex flex-col justify-end p-12 text-white w-full h-full">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                                    <Apple className="w-7 h-7 text-white" />
                                </div>
                                <span className="text-4xl font-black italic tracking-tighter">NutriLife</span>
                            </div>
                            <h2 className="text-4xl font-bold leading-[1.1] mb-6">
                                {isLogin
                                    ? "The journey to a healthier you starts with every single bite."
                                    : "Start your transformation today. Your body will thank you tomorrow."
                                }
                            </h2>
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-700/50 backdrop-blur-sm" />
                                    ))}
                                </div>
                                <p className="text-zinc-300 font-medium text-sm">Join 50,000+ users tracking today.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-20 py-8 w-full">
                        <div className="mb-6">
                            <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2 text-left">
                                {isLogin ? "Welcome back" : step === 1 ? "Create an account" : step === 2 ? "Body Metrics" : "Lifestyle & Goals"}
                            </h1>
                            <p className="text-muted-foreground text-sm italic text-left">
                                {isLogin ? "Sign in to continue your journey." : step === 1 ? "Start your personalized nutrition journey." : step === 2 ? "These help us calculate your calorie needs." : "Almost there! Tell us about your lifestyle."}
                            </p>
                            {!isLogin && (
                                <div className="flex gap-1.5 mt-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-all duration-300", i <= step ? "bg-primary" : "bg-primary/10")} />
                                    ))}
                                </div>
                            )}
                            {error && (
                                <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                                    {error}
                                </div>
                            )}
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {isLogin ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1 text-left block">Email Address</label>
                                        <input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="name@example.com"
                                            className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-left block">Password</label>
                                            <button type="button" className="text-xs font-bold text-primary hover:underline">Forgot password?</button>
                                        </div>
                                        <div className="relative">
                                            <input
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {step === 1 && (
                                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1 text-left block">First Name</label>
                                                    <input
                                                        name="firstName"
                                                        type="text"
                                                        value={formData.firstName}
                                                        onChange={handleChange}
                                                        placeholder="John"
                                                        className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1 text-left block">Last Name</label>
                                                    <input
                                                        name="lastName"
                                                        type="text"
                                                        value={formData.lastName}
                                                        onChange={handleChange}
                                                        placeholder="Doe"
                                                        className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1 text-left block">Email Address</label>
                                                <input
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="name@example.com"
                                                    className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1 text-left block">Password</label>
                                                <div className="relative">
                                                    <input
                                                        name="password"
                                                        type={showPassword ? "text" : "password"}
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        placeholder="••••••••"
                                                        className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1 text-left block">Gender</label>
                                                <select
                                                    name="gender"
                                                    value={formData.gender}
                                                    onChange={handleChange}
                                                    className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                                >
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1 text-left block">Age</label>
                                                    <input
                                                        name="age"
                                                        type="number"
                                                        value={formData.age}
                                                        onChange={handleChange}
                                                        placeholder="25"
                                                        className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1 text-left block">Height (cm)</label>
                                                    <input
                                                        name="height"
                                                        type="number"
                                                        value={formData.height}
                                                        onChange={handleChange}
                                                        placeholder="175"
                                                        className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1 text-left block">Weight (kg)</label>
                                                <input
                                                    name="weight"
                                                    type="number"
                                                    value={formData.weight}
                                                    onChange={handleChange}
                                                    placeholder="70"
                                                    className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1 text-left block">Activity Level</label>
                                                <select
                                                    name="activity_level"
                                                    value={formData.activity_level}
                                                    onChange={handleChange}
                                                    className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                                >
                                                    <option value="sedentary">Sedentary (Office job)</option>
                                                    <option value="light">Lightly Active (1-2 days/week)</option>
                                                    <option value="moderate">Moderately Active (3-5 days/week)</option>
                                                    <option value="active">Active (6-7 days/week)</option>
                                                    <option value="very_active">Very Active (Physical work)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1 text-left block">Your Primary Goal</label>
                                                <select
                                                    name="goal"
                                                    value={formData.goal}
                                                    onChange={handleChange}
                                                    className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                                >
                                                    <option value="fat_loss">Fat Loss</option>
                                                    <option value="maintain">Maintain Weight</option>
                                                    <option value="muscle_gain">Muscle Gain</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="flex gap-3 pt-2">
                                {!isLogin && step > 1 && (
                                    <Button
                                        type="button"
                                        onClick={() => setStep(prev => prev - 1)}
                                        className="h-14 px-6 text-lg font-bold rounded-2xl bg-secondary text-foreground hover:bg-secondary/80 transition-all active:scale-[0.98]"
                                    >
                                        Back
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 h-14 text-lg font-bold rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                                >
                                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isLogin ? "Sign In" : step < 3 ? "Continue" : "Complete Profile")}
                                </Button>
                            </div>

                            <div className="text-center mt-6">
                                <p className="text-muted-foreground font-medium">
                                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsLogin(!isLogin)
                                            setStep(1)
                                        }}
                                        className="font-bold text-primary hover:underline"
                                    >
                                        {isLogin ? "Register now for free" : "Sign in here"}
                                    </button>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            <Footerdemo />
        </div>
    )
}
