
export type MealOption = {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    tags: string[];
    unit: string;
};

export type DietPlan = {
    id: string;
    title: string;
    description: string;
    breakfasts: MealOption[];
    lunches: MealOption[];
    dinners: MealOption[];
};

export const dietDatabase: Record<string, DietPlan> = {
    weight_loss_indian: {
        id: "weight_loss_indian",
        title: "Precision Protein Lean",
        description: "Low-calorie, high-protein Indian meals designed for healthy weight loss without sacrificing taste.",
        breakfasts: [
            { id: "b1_wli", name: "Moong Dal Chilla", calories: 180, protein: 12, carbs: 20, fat: 4, tags: ["High Protein", "Vegan"], unit: "serving" },
            { id: "b2_wli", name: "Vegetable Oats Upma", calories: 200, protein: 6, carbs: 35, fat: 5, tags: ["High Fiber", "Quick"], unit: "bowl" },
            { id: "b3_wli", name: "Sprouts Salad", calories: 150, protein: 10, carbs: 22, fat: 2, tags: ["Raw", "Protein Rich"], unit: "bowl" }
        ],
        lunches: [
            { id: "l1_wli", name: "2 Multigrain Rotis & Palak Dal", calories: 350, protein: 15, carbs: 50, fat: 10, tags: ["Balanced", "Iron Rich"], unit: "plate" },
            { id: "l2_wli", name: "Brown Rice & Mixed Veg Sabzi", calories: 320, protein: 8, carbs: 55, fat: 8, tags: ["Low GI", "Fiber"], unit: "plate" },
            { id: "l3_wli", name: "Grilled Paneer & Lettuce Wrap", calories: 280, protein: 18, carbs: 12, fat: 18, tags: ["Low Carb", "Protein"], unit: "wrap" }
        ],
        dinners: [
            { id: "d1_wli", name: "Bottle Gourd (Lauki) Soup", calories: 120, protein: 4, carbs: 15, fat: 2, tags: ["Light", "Hydrating"], unit: "bowl" },
            { id: "d2_wli", name: "Soya Chunk & Spinach Stir Fry", calories: 240, protein: 22, carbs: 12, fat: 10, tags: ["High Protein", "Vegan"], unit: "bowl" },
            { id: "d3_wli", name: "Tofu Stir Fry with Bell Peppers", calories: 220, protein: 16, carbs: 10, fat: 14, tags: ["Vegan", "Quick"], unit: "bowl" }
        ]
    },
    muscle_gain_indian: {
        id: "muscle_gain_indian",
        title: "Athletic Performance & Strength",
        description: "High-protein, calorie-dense Indian meals for maximum muscle building and strength.",
        breakfasts: [
            { id: "b1_mgi", name: "Paneer Paratha (No Butter)", calories: 400, protein: 20, carbs: 45, fat: 15, tags: ["Protein Pockets", "Filling"], unit: "paratha" },
            { id: "b2_mgi", name: "Paneer & Soya Bhurji", calories: 350, protein: 28, carbs: 8, fat: 22, tags: ["High Protein", "Vegetarian"], unit: "plate" },
            { id: "b3_mgi", name: "Peanut Butter & Banana Roti Roll", calories: 450, protein: 15, carbs: 60, fat: 18, tags: ["Calorie Dense", "Pre-workout"], unit: "roll" }
        ],
        lunches: [
            { id: "l1_mgi", name: "Soya Chunk Pulao & Curd", calories: 550, protein: 32, carbs: 70, fat: 15, tags: ["Plant Protein", "Complete Meal"], unit: "plate" },
            { id: "l2_mgi", name: "Chole Bhature (Baked)", calories: 550, protein: 18, carbs: 80, fat: 18, tags: ["Energy", "Complex Carbs"], unit: "plate" },
            { id: "l3_mgi", name: "Paneer Tikka Masala & Rice", calories: 600, protein: 25, carbs: 65, fat: 28, tags: ["Calorie Dense", "Protein Rich"], unit: "plate" }
        ],
        dinners: [
            { id: "d1_mgi", name: "Paneer Tikka with Mint Chutney", calories: 450, protein: 25, carbs: 10, fat: 35, tags: ["Low Carb", "High Protein"], unit: "plate" },
            { id: "d2_mgi", name: "Soya Keema with Whole Wheat Roti", calories: 500, protein: 35, carbs: 55, fat: 18, tags: ["Plant Based", "High Protein"], unit: "plate" },
            { id: "d3_mgi", name: "Lentil Pasta in Homemade Sauce", calories: 550, protein: 28, carbs: 75, fat: 15, tags: ["Vegan", "High Carb"], unit: "bowl" }
        ]
    },
    balanced_indian: {
        id: "balanced_indian",
        title: "Nutritional Holistic Balance",
        description: "A perfect mix of carbs, protein, and micro-nutrients using balanced nutritional principles.",
        breakfasts: [
            { id: "b1_bi", name: "Poha with Peanuts & Veggies", calories: 280, protein: 8, carbs: 45, fat: 10, tags: ["Light", "Traditional"], unit: "bowl" },
            { id: "b2_bi", name: "Rava Idli with Sambar", calories: 320, protein: 10, carbs: 55, fat: 6, tags: ["Fermented", "Healthy"], unit: "plate" },
            { id: "b3_bi", name: "Besan Ka Puda", calories: 250, protein: 12, carbs: 35, fat: 8, tags: ["Protein", "Quick"], unit: "serving" }
        ],
        lunches: [
            { id: "l1_bi", name: "Rajma Chawal", calories: 450, protein: 18, carbs: 75, fat: 12, tags: ["Classic", "High Fiber"], unit: "plate" },
            { id: "l2_bi", name: "Thali (Roti, Dal, Sabzi, Dahi)", calories: 550, protein: 22, carbs: 80, fat: 15, tags: ["Complete Meal"], unit: "thali" },
            { id: "l3_bi", name: "Kitchen Khichdi with Ghee", calories: 400, protein: 12, carbs: 65, fat: 12, tags: ["Comfort", "Easy Digest"], unit: "bowl" }
        ],
        dinners: [
            { id: "d1_bi", name: "Mixed Vegetable Khichdi", calories: 350, protein: 10, carbs: 60, fat: 8, tags: ["Light", "Full Fiber"], unit: "bowl" },
            { id: "d2_bi", name: "Baingan Bharta & 2 Bajra Rotis", calories: 420, protein: 12, carbs: 55, fat: 15, tags: ["Nutritious", "Gluten Free"], unit: "plate" },
            { id: "d3_bi", name: "Kadhi Chawal", calories: 480, protein: 15, carbs: 75, fat: 15, tags: ["Classic", "Comfort"], unit: "plate" }
        ]
    }
};

export function getDietPlan(goal: string, _dietType: string, _activityLevel: string = "moderate"): DietPlan {
    if (goal === "lose") return dietDatabase["weight_loss_indian"];
    if (goal === "build") return dietDatabase["muscle_gain_indian"];
    return dietDatabase["balanced_indian"];
}
