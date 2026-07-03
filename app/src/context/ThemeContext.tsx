import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Theme = "light" | "dark"

interface ThemeContextValue {
    theme: Theme
    toggleTheme: () => void
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function getInitialTheme(): Theme {
    // 1. Check localStorage
    const stored = localStorage.getItem("nutrilife-theme") as Theme | null
    if (stored === "light" || stored === "dark") return stored
    // 2. Fall back to system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark"
    return "light"
}

function applyTheme(theme: Theme) {
    const root = document.documentElement
    if (theme === "dark") {
        root.classList.add("dark")
    } else {
        root.classList.remove("dark")
    }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        // Inline so SSR-safe; on client we derive from DOM/storage
        return "light"
    })

    useEffect(() => {
        const initial = getInitialTheme()
        setThemeState(initial)
        applyTheme(initial)
    }, [])

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme)
        applyTheme(newTheme)
        localStorage.setItem("nutrilife-theme", newTheme)
    }

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
    return ctx
}
