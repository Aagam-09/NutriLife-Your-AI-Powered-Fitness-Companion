# NutriLife: Project Documentation

NutriLife is a comprehensive, AI-powered nutrition and fitness platform designed specifically for the Indian market. It combines advanced vision AI, personalized diet planning, and intelligent coaching to help users achieve their health goals.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Radix UI (shadcn/ui base)
- **Animations**: Framer Motion & `tailwindcss-animate`
- **Networking**: Axios / Fetch API
- **Routing**: React Router 7

### Backend
- **Framework**: Django 5.0
- **API**: Django REST Framework (DRF)
- **Authentication**: SimpleJWT (JWT-based)
- **Database**: SQLite (Development)
- **Image Processing**: Pillow

### AI Integration
- **Engine**: Google Gemini AI (GenAI SDK)
- **Models**: `gemini-2.0-flash`, `gemini-2.0-flash-lite`, `gemini-2.5-flash`, `gemini-2.5-pro`
- **Strategy**: Multi-model failover queue for Vision (Meal Scanning) and Chatbot features.
- **Optimization**: Rule-based deterministic engine for daily insights to save on API credits.

---

## 🛠 Project Architecture

### Backend Structure (`/api`)
- `models.py`: Core data entities.
    - `Profile`: Body metrics (BMI, BMR), activity levels, and calorie goals.
    - `Meal`: Logged meal data with macro breakdowns and AI-generated health scores.
    - `DietPlan`: Stores generated nutritional plans.
    - `Insight`: AI-driven patterns and behavioral feedback.
    - `MealReminder`: User-scheduled meal notifications.
- `services/`:
    - `ai_service.py`: Interface for Gemini AI. Handles food image identification and conversational nutrition chat.
    - `deterministic_insights.py`: Rule-based engine for generating behavioral insights and exercise suggestions based on user age and today's metrics.
    - `coach_logic.py`: Deterministic health scoring (1-10), smart food swap matching, and weight projections (7700 kcal = 1kg rule).
- `views.py` & `serializers.py`: RESTful endpoints and data validation.

### Frontend Structure (`/app/src`)
- `pages/`: 
    - `Dashboard`: Real-time tracking hub with macro rings, weekly trends, and AI insights.
    - `MealLogger`: Multi-modal logger featuring an AI Food Scanner (Camera/Upload) and manual entry.
    - `DietPlan`: Interactive multi-plan management system for Indian vegetarian diets.
    - `Profile`: Centralized health profile and goal synchronization.
- `components/`: Modular design system following shadcn patterns.
- `data/`: Curated Indian diet database optimized for vegetarian preferences.

---

## ✨ Key Features

### 1. AI Food Scanner
- **Vision Recognition**: Snap a photo of any food or drink to instantly identify Calories, Protein, Carbs, and Fats.
- **Indian Optimized**: Fine-tuned prompts for recognizing traditional Indian meals (Poha, Paneer, Roti, etc.).
- **Smart Feedback**: Every meal is graded with a "Health Score" (1-10) and an analysis of why it's good or bad.
- **Smart Swaps**: If you log something processed or oily, the AI suggests a healthier alternative from a curated database.

### 2. Intelligent Diet Planning
- **Multi-Plan Management**: Create and save multiple diet plans (e.g., "Muscle Gain", "Fat Loss Journey").
- **100% Vegetarian**: Built-in adherence to vegetarian dietary preferences with paneer, soya, and legume-based protein sources.
- **Auto-Sync**: Activating a plan automatically updates your daily calorie goals across the entire platform via backend profile synchronization.

### 3. Smart Insights & Coaching
- **Behavioral Patterns**: The AI analyzes your tracking habits to identify trends (e.g., "You tend to eat high-fat dinners on weekends").
- **Exercise Burn**: Calculates exact exercise minutes required to offset caloric excess based on real-world metabolic rates.
- **Weight Projection**: Predicts your weight in 30 days based on your actual 7-day caloric deficit/surplus.

### 4. Hydration Tracking
- **Integrated Water Tracker**: Track daily water intake synced with your primary health metrics.
- **Visual Progress**: Real-time water intake rings on both the Dashboard and Profile pages.

### 5. Personalized Workout Hub
- **Database of 12+ Activities**: Specifically curated for the Indian lifestyle, including Cricket, Badminton, and Surya Namaskar.
- **Detailed Guidance**: Every workout features step-by-step "How-to" instructions and a recommended "Best Time" (e.g., Morning vs Post-work).
- **Direct Navigation**: Smart Insights on the Dashboard now link directly to specific workout IDs, allowing for frictionless fitness coaching.
- **Surplus Recovery**: Automatically detects caloric excess and prioritizes high-burn HIIT/Cardio sessions to help you recover your daily balance.

---

## 🎨 UI/UX Excellence
- **Liquid Glass Design**: Modern, translucent UI elements with smooth backdrop blurs.
- **Animated Navigation**: Every page transition uses a standardized "fade-and-zoom" entry for a premium feel.
- **Bookmark Tabs**: A custom tab system for intuitive plan management.
- **Responsive Layouts**: Fully optimized for Desktop and Mobile (using `environment` camera modes for scanning).

---

## 👨‍💻 Setup & Development

### Backend
1. `pip install -r requirements.txt`
2. `python manage.py migrate`
3. `python manage.py runserver`

### Frontend
1. `cd app`
2. `npm install`
3. `npm run dev`

---
*Created by NutriLife Development Team*
