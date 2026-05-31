from datetime import datetime, timedelta, time

from django.contrib.auth.models import User
from django.utils import timezone

from api.models import Profile, DietPlan, Meal, WeightLog


def _bmi(weight_kg: float, height_cm: float):
    if not weight_kg or not height_cm:
        return None
    h_m = height_cm / 100.0
    return round(weight_kg / (h_m * h_m), 1)


def _bmr(weight_kg: float, height_cm: float, age: int, gender: str):
    if not (weight_kg and height_cm and age and gender):
        return None
    if gender == "male":
        return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    if gender == "female":
        return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
    return 10 * weight_kg + 6.25 * height_cm - 5 * age


def _activity_mult(level: str):
    return {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very_active": 1.9,
    }.get(level, 1.55)


def _goal_mult(goal: str):
    return {"fat_loss": 0.85, "maintain": 1.0, "muscle_gain": 1.15}.get(goal, 1.0)


def _aware(dt: datetime) -> datetime:
    tz = timezone.get_current_timezone()
    if timezone.is_aware(dt):
        return dt
    return timezone.make_aware(dt, tz)


def _create_meal_with_datetime(*, user, when_dt: datetime, meal_type: str, food_name: str, calories: float, protein: float, carbs: float, fat: float):
    meal = Meal.objects.create(
        user=user,
        meal_type=meal_type,
        food_name=food_name,
        calories=calories,
        protein=protein,
        carbs=carbs,
        fat=fat,
    )
    # created_at is auto_now_add; force-set afterwards
    Meal.objects.filter(pk=meal.pk).update(created_at=when_dt)
    return meal


def seed_user(*, email: str, name: str, password: str, profile: dict, diet_plan: dict, meals_by_day: list[dict], weight_series: list[tuple]):
    """
    meals_by_day: list of {date: <date>, meals: [ {time: <time>, meal_type, food_name, calories, protein, carbs, fat}, ... ]}
    weight_series: list of (date, weight)
    """
    user, _ = User.objects.get_or_create(username=email, defaults={"email": email, "first_name": name})
    user.email = email
    user.first_name = name
    user.set_password(password)
    user.save()

    # Profile (overwrite)
    p, _ = Profile.objects.get_or_create(user=user)
    p.age = profile["age"]
    p.height = profile["height"]
    p.weight = profile["weight"]
    p.gender = profile["gender"]
    p.activity_level = profile["activity_level"]
    p.goal = profile["goal"]
    p.diet_preference = profile["diet_preference"]
    bmr = _bmr(p.weight, p.height, p.age, p.gender)
    p.bmi = _bmi(p.weight, p.height)
    p.bmr = round(bmr, 0) if bmr is not None else None
    if bmr is not None:
        daily = bmr * _activity_mult(p.activity_level) * _goal_mult(p.goal)
        p.daily_calories = round(daily, 0)
    else:
        p.daily_calories = None
    p.save()

    # Diet plan (overwrite)
    DietPlan.objects.update_or_create(
        user=user,
        defaults={
            "breakfast": diet_plan["breakfast"],
            "lunch": diet_plan["lunch"],
            "dinner": diet_plan["dinner"],
            "snacks": diet_plan["snacks"],
            "daily_calories": float(p.daily_calories or diet_plan.get("daily_calories") or 2000),
            "diet_preference": p.diet_preference,
        },
    )

    # Meals: clear recent then insert
    today = timezone.now().date()
    start_date = today - timedelta(days=14)
    Meal.objects.filter(user=user, created_at__date__gte=start_date).delete()

    for day in meals_by_day:
        d = day["date"]
        for m in day["meals"]:
            when_dt = _aware(datetime.combine(d, m["time"]))
            _create_meal_with_datetime(
                user=user,
                when_dt=when_dt,
                meal_type=m["meal_type"],
                food_name=m["food_name"],
                calories=m["calories"],
                protein=m["protein"],
                carbs=m["carbs"],
                fat=m["fat"],
            )

    # Weight logs: upsert
    for d, w in weight_series:
        WeightLog.objects.update_or_create(user=user, date=d, defaults={"weight": w})

    return user


def _make_meal_week(*, base_date, preference: str):
    # 7 days ending today
    days = []
    for i in range(6, -1, -1):
        d = base_date - timedelta(days=i)
        if preference == "vegetarian":
            meals = [
                {"time": time(8, 45), "meal_type": "breakfast", "food_name": "Oats + milk + banana", "calories": 420, "protein": 16, "carbs": 68, "fat": 10},
                {"time": time(13, 30), "meal_type": "lunch", "food_name": "Rice + dal + salad", "calories": 650, "protein": 24, "carbs": 105, "fat": 12},
                {"time": time(17, 30), "meal_type": "snack", "food_name": "Fruit + nuts", "calories": 260, "protein": 6, "carbs": 30, "fat": 14},
                {"time": time(20, 30), "meal_type": "dinner", "food_name": "Paneer + roti + veggies", "calories": 720, "protein": 35, "carbs": 70, "fat": 30},
            ]
        elif preference == "vegan":
            meals = [
                {"time": time(8, 30), "meal_type": "breakfast", "food_name": "Oats + almond milk + berries", "calories": 380, "protein": 12, "carbs": 62, "fat": 10},
                {"time": time(13, 15), "meal_type": "lunch", "food_name": "Chickpea bowl + rice + salad", "calories": 680, "protein": 22, "carbs": 110, "fat": 14},
                {"time": time(17, 15), "meal_type": "snack", "food_name": "Banana + peanut butter", "calories": 240, "protein": 6, "carbs": 28, "fat": 12},
                {"time": time(20, 15), "meal_type": "dinner", "food_name": "Tofu stir-fry + roti", "calories": 690, "protein": 28, "carbs": 80, "fat": 26},
            ]
        else:
            meals = [
                {"time": time(8, 15), "meal_type": "breakfast", "food_name": "Eggs + toast + milk", "calories": 520, "protein": 28, "carbs": 40, "fat": 26},
                {"time": time(13, 10), "meal_type": "lunch", "food_name": "Chicken + rice + salad", "calories": 720, "protein": 42, "carbs": 85, "fat": 18},
                {"time": time(17, 0), "meal_type": "snack", "food_name": "Yogurt + fruit", "calories": 210, "protein": 10, "carbs": 30, "fat": 4},
                {"time": time(20, 20), "meal_type": "dinner", "food_name": "Fish + roti + veggies", "calories": 650, "protein": 35, "carbs": 65, "fat": 22},
            ]

        # Slight variation per day
        bump = (i % 3) * 40
        meals[1]["calories"] += bump
        meals[3]["calories"] += (i % 2) * 30

        days.append({"date": d, "meals": meals})
    return days


def _make_weight_series(*, base_date, start_weight: float, delta_per_day: float):
    out = []
    for i in range(14, -1, -1):
        d = base_date - timedelta(days=i)
        w = round(start_weight + (14 - i) * delta_per_day, 1)
        out.append((d, w))
    return out


BASE = timezone.now().date()

users = []

# Existing user to fill: usermitesh@email.com
users.append(
    seed_user(
        email="usermitesh@email.com",
        name="Mitesh",
        password="12345678",
        profile={
            "age": 24,
            "height": 173,
            "weight": 74,
            "gender": "male",
            "activity_level": "moderate",
            "goal": "fat_loss",
            "diet_preference": "vegetarian",
        },
        diet_plan={
            "breakfast": ["oats", "milk", "banana"],
            "lunch": ["rice", "dal", "salad"],
            "dinner": ["paneer", "roti", "vegetables"],
            "snacks": ["fruit", "nuts"],
            "daily_calories": 2100,
        },
        meals_by_day=_make_meal_week(base_date=BASE, preference="vegetarian"),
        weight_series=_make_weight_series(base_date=BASE, start_weight=75.0, delta_per_day=-0.1),
    )
)

# Two more demo users
users.append(
    seed_user(
        email="userpriya@email.com",
        name="Priya",
        password="12345678",
        profile={
            "age": 22,
            "height": 162,
            "weight": 58,
            "gender": "female",
            "activity_level": "light",
            "goal": "maintain",
            "diet_preference": "vegan",
        },
        diet_plan={
            "breakfast": ["oats", "almond milk", "berries"],
            "lunch": ["chickpeas", "rice", "salad"],
            "dinner": ["tofu", "roti", "vegetables"],
            "snacks": ["fruit", "nuts"],
            "daily_calories": 1850,
        },
        meals_by_day=_make_meal_week(base_date=BASE, preference="vegan"),
        weight_series=_make_weight_series(base_date=BASE, start_weight=58.5, delta_per_day=0.0),
    )
)

users.append(
    seed_user(
        email="userarjun@email.com",
        name="Arjun",
        password="12345678",
        profile={
            "age": 27,
            "height": 178,
            "weight": 80,
            "gender": "male",
            "activity_level": "active",
            "goal": "muscle_gain",
            "diet_preference": "non_vegetarian",
        },
        diet_plan={
            "breakfast": ["eggs", "toast", "milk"],
            "lunch": ["rice", "chicken", "salad"],
            "dinner": ["fish", "roti", "vegetables"],
            "snacks": ["fruit", "yogurt"],
            "daily_calories": 2600,
        },
        meals_by_day=_make_meal_week(base_date=BASE, preference="non_vegetarian"),
        weight_series=_make_weight_series(base_date=BASE, start_weight=79.0, delta_per_day=0.1),
    )
)

print("Seeded users:")
for u in users:
    p = Profile.objects.get(user=u)
    dp = DietPlan.objects.get(user=u)
    meals_7 = Meal.objects.filter(user=u, created_at__date__gte=BASE - timedelta(days=6)).count()
    weights = WeightLog.objects.filter(user=u).count()
    print(f"- {u.email} | name={u.first_name} | daily_calories={p.daily_calories} | diet={dp.diet_preference} | meals(last7d)={meals_7} | weight_logs={weights}")

