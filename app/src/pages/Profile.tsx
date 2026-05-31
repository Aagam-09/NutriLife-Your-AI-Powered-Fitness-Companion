import { Header } from "@/components/ui/header-2"
import { Footerdemo } from "@/components/blocks/footer-section"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ProfileCard } from "@/components/ui/profile-card"
import { ActivityCard } from "@/components/ui/activity-card"
import type { Metric } from "@/components/ui/activity-card"

export function ProfilePage() {
    const navigate = useNavigate()
    const [user, setUser] = useState<any>({})
    const [profile, setProfile] = useState<any>({})
    const [stats, setStats] = useState<any>({ consumed: 0, goal: 2000, protein: 0, carbs: 0, fat: 0, totalWater: 0, waterGoal: 3000 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login")
            return
        }

        const headers = { Authorization: `Bearer ${token}` }
        Promise.all([
            fetch("http://localhost:8000/api/v1/auth/me", { headers }).then(r => r.json()),
            fetch("http://localhost:8000/api/v1/user/profile", { headers }).then(r => r.json()),
            fetch("http://localhost:8000/api/v1/calories/today", { headers }).then(r => r.json())
        ]).then(([meRes, profRes, statsRes]) => {
            setUser(meRes)
            setProfile(profRes || {})
            setStats(statsRes.goal ? statsRes : { consumed: 0, goal: profRes?.daily_calories || 2000, protein: 0, carbs: 0, fat: 0, totalWater: statsRes?.totalWater || 0, waterGoal: statsRes?.waterGoal || 3000 })
            setLoading(false)
        }).catch(err => {
            console.error(err)
            setLoading(false)
        })
    }, [])

    if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>

    // Formatting data for Activity Card
    const metrics: Metric[] = [
        { label: "Calories", value: Math.round(stats.consumed).toString(), trend: Math.min(100, Math.round((stats.consumed / stats.goal) * 100)), unit: "cal" },
        { label: "Protein", value: Math.round(stats.protein).toString(), trend: Math.min(100, Math.round((stats.protein / 150) * 100)), unit: "g" },
        { label: "Carbs", value: Math.round(stats.carbs).toString(), trend: Math.min(100, Math.round((stats.carbs / 250) * 100)), unit: "g" },
        { label: "Fat", value: Math.round(stats.fat).toString(), trend: Math.min(100, Math.round((stats.fat / 70) * 100)), unit: "g" },
        { label: "Water", value: stats.totalWater.toString(), trend: Math.min(100, Math.round((stats.totalWater / stats.waterGoal) * 100)), unit: "cal" }, // using cal unit temporarily as ActivityCard only supports cal/g, I should probably update unit type mapping
    ];


    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            <Header />
            <main className="flex-1 flex flex-col pt-28 px-4 container mx-auto max-w-6xl pb-20 animate-in fade-in zoom-in-95 duration-500">

                <div className="text-center mb-12 max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                        Hi, <span className="capitalize text-primary">{user?.name || 'User'}</span>
                    </h1>
                    <p className="text-muted-foreground text-lg">Your personal health hub. Track, manage, and optimize your nutritional journey.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto w-full auto-rows-fr">
                    {/* Left: Insurance Style Profile Card */}
                    <div className="flex flex-col">
                        <ProfileCard
                            clientName={user?.name || 'User'}
                            email={user?.email || 'user@example.com'}
                            memberSince={user?.date_joined ? new Date(user.date_joined).getFullYear().toString() : '2024'}
                            age={profile?.age?.toString() || '-'}
                            height={profile?.height?.toString() || '-'}
                            weight={profile?.weight?.toString() || '-'}
                            activityLevel={profile?.activity_level || '-'}
                            goal={profile?.goal || 'Maintain'}
                            dailyCalories={profile?.daily_calories?.toString() || '2000'}
                            avatarSrc="https://i.pravatar.cc/200?img=15"
                            onUpdateProfile={() => alert("Edit profile clicked")}
                        />
                    </div>

                    {/* Right: Activity / Macros Card */}
                    <div className="flex flex-col">
                        <ActivityCard
                            title="Today's Macros"
                            category="Nutrition Progress"
                            metrics={metrics}
                            showGoals={false}
                        />
                    </div>
                </div>

            </main>

            <Footerdemo />
        </div>
    )
}
