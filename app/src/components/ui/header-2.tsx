import { useNavigate, useLocation } from "react-router-dom"
import { Apple, Home, Utensils, LayoutDashboard, User, LogOut, Info, Dumbbell, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"

export function Header() {
    const navigate = useNavigate()
    const location = useLocation()
    const { theme, toggleTheme } = useTheme()
    const isLoggedIn = !!localStorage.getItem("token")

    const links = [
        { label: "Home",      href: "/",         icon: Home,          requiresAuth: false },
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, requiresAuth: true },
        { label: "Meals",     href: "/meals",     icon: Utensils,      requiresAuth: true },
        { label: "Diet Plan", href: "/diet",      icon: Apple,         requiresAuth: true },
        { label: "Workouts",  href: "/workouts",  icon: Dumbbell,      requiresAuth: true },
        { label: "Profile",   href: "/profile",   icon: User,          requiresAuth: true },
        { label: "About Us",  href: "/about",     icon: Info,          requiresAuth: false },
    ]

    const visibleLinks = links.filter(link => !link.requiresAuth || isLoggedIn)

    return (
        <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-max max-w-[95vw]">
            <nav className="flex items-center gap-1 p-1.5 glass-nav border border-border shadow-2xl rounded-full">
                {/* Logo */}
                <div
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:opacity-80 transition-opacity ml-2"
                >
                    <span className="font-extrabold italic tracking-tighter text-2xl">
                        <span className="text-primary">Nutri</span>
                        <span className="text-foreground">Life</span>
                    </span>
                </div>

                <div className="w-px h-8 bg-border mx-2 hidden md:block" />

                {/* Nav links */}
                <div className="flex items-center justify-center gap-1">
                    {visibleLinks.map((link) => {
                        const isActive =
                            location.pathname === link.href ||
                            (link.href === "/diet" && location.pathname.includes("/diet"))
                        const Icon = link.icon
                        return (
                            <button
                                key={link.label}
                                onClick={() => navigate(link.href)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-bold transition-all duration-200",
                                    isActive
                                        ? "bg-gradient-to-r from-accent via-primary to-secondary text-white shadow-md glow-green scale-105"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "w-4 h-4 transition-colors",
                                        isActive ? "text-white" : "text-muted-foreground"
                                    )}
                                />
                                <span className="hidden md:block">{link.label}</span>
                            </button>
                        )
                    })}
                </div>

                <div className="w-px h-8 bg-border mx-2" />

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    className={cn(
                        "theme-toggle w-9 h-9 rounded-full flex items-center justify-center",
                        "text-muted-foreground hover:text-foreground",
                        "hover:bg-muted border border-transparent hover:border-border",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    )}
                >
                    {/* Sun — visible in dark mode (click to go light) */}
                    <Sun
                        className={cn(
                            "absolute w-4 h-4 text-accent transition-all duration-400",
                            theme === "dark"
                                ? "opacity-100 rotate-0 scale-100"
                                : "opacity-0 rotate-90 scale-50"
                        )}
                    />
                    {/* Moon — visible in light mode (click to go dark) */}
                    <Moon
                        className={cn(
                            "absolute w-4 h-4 transition-all duration-400",
                            theme === "light"
                                ? "opacity-100 rotate-0 scale-100"
                                : "opacity-0 -rotate-90 scale-50"
                        )}
                    />
                </button>

                {/* Auth buttons */}
                {!isLoggedIn && (
                    <>
                        <div className="flex gap-1 pr-1">
                            <button
                                onClick={() => navigate("/login")}
                                className="px-4 py-2.5 text-[13px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => navigate("/login?mode=signup")}
                                className="px-5 py-2.5 text-[13px] font-bold btn-gradient rounded-full shadow-md"
                            >
                                Get Started
                            </button>
                        </div>
                    </>
                )}

                {isLoggedIn && (
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
                )}
            </nav>
        </header>
    )
}
