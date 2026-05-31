from typing import Dict, Any, Tuple, Optional
from api.models import FoodSwap, ExerciseBalance, Meal, Profile
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum


def score_meal(meal_data: Dict[str, float]) -> Tuple[float, str]:
    """
    Calculate a purely deterministic health score out of 10 based on macros.
    meal_data = {
        "calories": 400,
        "protein": 20,
        "carbs": 40,
        "fat": 15
    }
    Returns: (score, reason)
    """
    food_name = meal_data.get("food_name", "").lower()
    cals = meal_data.get("calories", 0)
    is_food = meal_data.get("is_food", True)

    # Don't score non-food items or errors
    if not is_food or not food_name or "unknown" in food_name or "quota exceeded" in food_name or (cals == 0 and "water" not in food_name):
        return None, "Not a food item"

    score = 10.0
    reasons = []

    cals = meal_data.get("calories", 0)
    pro = meal_data.get("protein", 0)
    fat = meal_data.get("fat", 0)
    carbs = meal_data.get("carbs", 0)
    sugar = meal_data.get("sugar", 0)
    fiber = meal_data.get("fiber", 0)
    sodium = meal_data.get("sodium", 0)
    cholesterol = meal_data.get("cholesterol", 0)
    is_processed = meal_data.get("is_processed", False)
    is_fried = meal_data.get("is_fried", False)
    contains_refined_flour = meal_data.get("contains_refined_flour", False)

    # Simple logic
    if cals > 800:
        score -= 2.0
        reasons.append("High calories")
    
    if pro < 15 and cals > 300: # Only penalize low protein if it's an actual meal, not a small snack
        score -= 1.5
        reasons.append("Low protein")
    
    if fat > 35:
        score -= 2.0
        reasons.append("High fat content")

    if carbs > 100:
        score -= 1.5
        reasons.append("Very high carbohydrates")

    if sugar > 15:
        score -= 2.0
        reasons.append("High sugar content")

    if is_processed:
        score -= 1.5
        reasons.append("Processed food penalty")

    if is_fried:
        score -= 2.5
        reasons.append("Deep-fried / Oily")

    if contains_refined_flour:
        score -= 2.0
        reasons.append("Refined flour (Maida)")

    if sodium > 600:
        score -= 1.5
        reasons.append("High sodium")

    if cholesterol > 100:
        score -= 1.0
        reasons.append("High cholesterol")

    if fiber >= 5:
        if score < 10:
            score += 0.5
        reasons.append("High fiber bonus")

    if pro >= 30:
        if score < 10:
            score += 0.5 # Bonus
        reasons.append("Great protein hit")

    score = max(1.0, min(score, 10.0))
    
    reason_str = " | ".join(reasons) if reasons else "Balanced macro profile."
    
    return round(score, 1), reason_str


def get_food_swap_suggestion(food_name: str) -> Optional[Dict[str, str]]:
    """Checks the local database if there is a healthier static swap for the detected food."""
    food_lower = food_name.lower().strip()
    
    # Try finding any swap where the original food is a substring (e.g. 'burger' matches 'hamburger')
    swap = FoodSwap.objects.filter(original_food__icontains=food_lower).first()
    
    if not swap:
        # Check reverse to be safe
        swap = FoodSwap.objects.filter(original_food__iexact=food_lower).first()

    if swap:
        return {
            "alternative": swap.healthy_alternative,
            "reason": swap.reason
        }
    return None


def get_exercise_to_burn_calories(excess_calories: float) -> Optional[Dict[str, Any]]:
    """Finds an exercise from the DB that can help burn off excess calories."""
    if excess_calories <= 50:
        return None
        
    # Find an exercise that roughly matches the excess calorie burn within a 30-60 min window
    # We'll just grab exercises that burn more than half the excess
    exercises = ExerciseBalance.objects.filter(calories_burned_per_30_min__gte=(excess_calories / 2)).order_by('calories_burned_per_30_min')
    
    if exercises.exists():
        ex = exercises.first()
        # Calculate roughly how many minutes it takes to burn off the exact excess
        mins = int((excess_calories / ex.calories_burned_per_30_min) * 30)
        return {
            "activity": ex.activity,
            "minutes_required": mins,
            "burn_rate_30m": ex.calories_burned_per_30_min
        }
    
    return None


def calculate_weight_projection(user) -> Dict[str, Any]:
    """
    Looks at the past 7 days of intake vs goal.
    Formula: 7700 kcal = 1kg body weight.
    """
    try:
        profile = user.profile
        if not profile.daily_calories or not profile.weight:
            return {"error": "Missing profile details"}
            
        daily_goal = profile.daily_calories
        
        # Last 7 days
        seven_days_ago = timezone.now() - timedelta(days=7)
        recent_meals = Meal.objects.filter(user=user, created_at__gte=seven_days_ago)
        
        if not recent_meals.exists():
            return {"status": "Not enough data"}
            
        # Group by days with data
        total_cals_consumed = recent_meals.aggregate(Sum('calories'))['calories__sum'] or 0
        
        # Approximate averages
        avg_consumed = total_cals_consumed / 7.0 
        daily_deficit = daily_goal - avg_consumed
        
        # 30 day projection
        total_deficit_30_days = daily_deficit * 30
        weight_change_kg = total_deficit_30_days / 7700.0
        
        projected_weight = float(profile.weight) - weight_change_kg
        
        return {
            "current_weight_kg": profile.weight,
            "avg_daily_consumed": round(avg_consumed),
            "daily_goal": round(daily_goal),
            "projected_change_30d_kg": round(-weight_change_kg, 2),
            "projected_weight_30d_kg": round(projected_weight, 1)
        }
    except Exception as e:
        return {"error": str(e)}