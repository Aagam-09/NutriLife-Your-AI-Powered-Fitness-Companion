import { AnimatedMarqueeHero } from "@/components/blocks/hero-3"
import { Header } from "@/components/ui/header-2"
import { Footerdemo } from "@/components/blocks/footer-section"

function App() {
  const images = [
    "https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555243896-c709bfa0b564?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?q=80&w=600&auto=format&fit=crop",
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans bg-radial-green" style={{ marginTop: "-75px" }}>
      <Header />
      <main className="flex-1 flex flex-col mb-20">
        <AnimatedMarqueeHero
          tagline="Your Personal AI Nutritionist"
          title={
            <>
              Transform Your Health
              <br />
              {/* Uses the CSS gradient-text-green utility from index.css */}
              <span className="gradient-text-green">
                One Meal at a Time
              </span>
            </>
          }
          description="NutriLife is your all-in-one companion for intelligent nutrition. Scan meals, generate custom plans, and reach your goals with ease."
          ctaText="Start Your Journey"
          images={images}
        />
      </main>
      <Footerdemo />
    </div>
  )
}

export default App
