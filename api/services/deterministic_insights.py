def get_deterministic_insight(age: int, water_ml: int, consumed: int, goal: int, last_meal_cals: int) -> str:
    """
    Deterministically generates a nutrition insight and exercise suggestion
    based on user metrics to save on AI API credits.
    Format: [Insight Text] | [Exercise Suggestion]
    """
    # 1. Select the most relevant insight
    insight = "Your tracking is on point! Keep logging every meal for the best results."
    
    if water_ml < 1500:
        insight = "Your hydration is below 1.5L. Drinking water now will boost your energy and metabolism."
    elif consumed > goal:
        insight = f"You've exceeded your daily goal of {goal} kcal. Focus on low-calorie veggies for the rest of today."
    elif last_meal_cals > 800:
        insight = f"That last meal was quite calorie-dense ({last_meal_cals} kcal). Movement is highly recommended."
    elif consumed < (goal * 0.4) and water_ml > 2000:
        insight = "Great job on hydration! Make sure you still hit your minimum calorie needs for energy."
    else:
        # Fallback to Age-based tips
        if age:
            if age < 18:
                insight = "You're in a growth phase! Ensure you get plenty of calcium and iron from natural sources."
            elif age > 55:
                insight = "Maintaining bone density and muscle mass is vital. Focus on high-quality proteins."
            else:
                insight = "Consistency is king. Reaching your macro goals daily is the fastest way to progress."

    # 2. Select a corresponding exercise suggestion
    exercise = "Take a 10-minute walk." # Default
    workout_id = "morning-walk"
    
    if consumed > (goal + 200):
        if age and age < 35:
            exercise = "Engage in 30 mins of high-intensity cardio or a gym session."
            workout_id = "hiit-fat-burn"
        elif age and age > 60:
            exercise = "A steady 45-minute walk will help balance your intake."
            workout_id = "morning-walk"
        else:
            exercise = "Try a 30-minute brisk walk or light cycling session."
            workout_id = "cycling"
    elif last_meal_cals > 500:
        exercise = "Go for a 15-minute brisk walk to aid digestion."
        workout_id = "morning-walk"
    elif water_ml < 1200:
        exercise = "Hydrate with 2 glasses of water, then do 10 mins of light stretching."
        workout_id = "senior-mobility"
    else:
        # Generic age-based activity
        if age:
            if age < 25:
                exercise = "Do 20 mins of any active sport or Bodyweight exercises."
                workout_id = "bodyweight-basics"
            elif age > 50:
                exercise = "Try 15 mins of Yoga or joint-friendly stretching."
                workout_id = "senior-mobility"
            else:
                exercise = "A 20-minute power walk or quick home workout."
                workout_id = "morning-walk"

    return f"{insight} | {exercise} | {workout_id}"
