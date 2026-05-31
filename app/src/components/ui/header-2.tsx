import { useNavigate, useLocation } from "react-router-dom"
import { Apple, Home, Utensils, LayoutDashboard, User, LogOut, Info, Dumbbell } from "lucide-react"
import { cn } from "@/lib/utils"

export function Header() {
    const navigate = useNavigate()
    const location = useLocation()
    const isLoggedIn = !!localStorage.getItem("token")

    const links = [
        { label: "Home", href: "/", icon: Home, requiresAuth: false },
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, requiresAuth: true },
        { label: "Meals", href: "/meals", icon: Utensils, requiresAuth: true },
        { label: "Diet Plan", href: "/diet", icon: Apple, requiresAuth: true },
        { label: "Workouts", href: "/workouts", icon: Dumbbell, requiresAuth: true },
        { label: "Profile", href: "/profile", icon: User, requiresAuth: true },
        { label: "About Us", href: "/about", icon: Info, requiresAuth: false },
    ]

    const visibleLinks = links.filter(link => !link.requiresAuth || isLoggedIn)

    return (
        <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-max max-w-[95vw]">
            <nav className="flex items-center gap-1 p-1.5 bg-background/80 backdrop-blur-xl border border-border shadow-2xl rounded-full">
                <div
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:opacity-80 transition-opacity ml-2"
                >
                    <span className="font-extrabold italic tracking-tighter text-2xl">
                        <span className="text-primary">Nutri</span>
                        <span className="text-foreground">Life</span>
                    </span>
                </div>

                <div className="w-px h-8 bg-border mx-2 hidden md:block"></div>

                <div className="flex items-center justify-center gap-1">
                    {visibleLinks.map((link) => {
                        const isActive = location.pathname === link.href || (link.href === '/diet' && location.pathname.includes('/diet'))
                        const Icon = link.icon
                        return (
                            <button
                                key={link.label}
                                onClick={() => navigate(link.href)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-bold transition-all",
                                    isActive
                                        ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                <span className={cn("hidden md:block")}>{link.label}</span>
                            </button>
                        )
                    })}
                </div>

                {!isLoggedIn && (
                    <>
                        <div className="w-px h-8 bg-border mx-2"></div>
                        <div className="flex gap-1 pr-1">
                            <button
                                onClick={() => navigate("/login")}
                                className="px-4 py-2.5 text-[13px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => navigate("/login?mode=signup")}
                                className="px-5 py-2.5 text-[13px] font-bold bg-foreground text-background rounded-full shadow-md hover:scale-105 transition-all"
                            >
                                Get Started
                            </button>
                        </div>
                    </>
                )}

                {isLoggedIn && (
                    <>
                        <div className="w-px h-8 bg-border mx-2"></div>
                        <button
                            onClick={() => {
                                localStorage.removeItem("token")
                                navigate("/login")
                            }}
                            className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors flex items-center gap-2 px-4 mr-1"
                            title="Sign Out"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-[13px] font-bold hidden md:block">Exit</span>
                        </button>
                    </>
                )}
            </nav>
        </header>
    )
}
