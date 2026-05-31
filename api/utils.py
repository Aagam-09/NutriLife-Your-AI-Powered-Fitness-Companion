def calculate_bmi(weight_kg, height_cm):
    if not height_cm or height_cm <= 0:
        return None
    h_m = height_cm / 100
    return round(weight_kg / (h_m * h_m), 1)


def calculate_bmr(weight_kg, height_cm, age, gender):
    if None in (weight_kg, height_cm, age) or not gender:
        return None
    # Mifflin-St Jeor
    if gender == "male":
        return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    if gender == "female":
        return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
    return 10 * weight_kg + 6.25 * height_cm - 5 * age


def activity_multiplier(level):
    m = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very_active": 1.9,
    }
    return m.get(level, 1.55)


def goal_multiplier(goal):
    m = {"fat_loss": 0.85, "maintain": 1.0, "muscle_gain": 1.15}
    return m.get(goal, 1.0)


def calculate_daily_calories(weight, height, age, gender, activity_level, goal):
    bmr = calculate_bmr(weight, height, age, gender)
    if bmr is None:
        return 2000
    tdee = bmr * activity_multiplier(activity_level)
    budget = tdee * goal_multiplier(goal)
    return round(budget)
