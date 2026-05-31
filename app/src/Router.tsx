import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import App from "./App"
import { DashboardPage } from "./pages/Dashboard"
import { MealLoggerPage } from "./pages/MealLogger"
import { DietPlanPage } from "./pages/DietPlan"
import { ProfilePage } from "./pages/Profile"
import { AuthPage } from "./pages/Auth"
import { PricingPage } from "./pages/Pricing"
import { AboutPage } from "./pages/About"
import { WorkoutsPage } from "./pages/Workouts"
import { Chatbot } from "./components/ui/chatbot"

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/meals" element={<MealLoggerPage />} />
                <Route path="/diet" element={<DietPlanPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/signup" element={<AuthPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/workouts" element={<WorkoutsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Chatbot />
        </BrowserRouter>
    )
}
