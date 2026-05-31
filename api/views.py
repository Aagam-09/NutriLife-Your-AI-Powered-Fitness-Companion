import json
import pytz
from datetime import date, timedelta
from django.utils import timezone

from rest_framework import status, generics, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.db import models, IntegrityError

from .models import Profile, Meal, DietPlan, WeightLog, MealReminder
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    ProfileSerializer,
    MealSerializer,
    MealCreateSerializer,
    DietPlanGenerateSerializer,
    DietPlanSerializer,
    WeightLogSerializer,
    WeightLogCreateSerializer,
    MealReminderSerializer,
)
from .services.coach_logic import (
    score_meal, get_food_swap_suggestion, 
    get_exercise_to_burn_calories, calculate_weight_projection
)
from .services.ai_service import identify_food_from_image, chat_with_nutritionist
from .services.deterministic_insights import get_deterministic_insight


# -------- Helpers --------
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {"token": str(refresh.access_token), "refresh": str(refresh)}


from .utils import calculate_bmi, calculate_bmr, activity_multiplier, goal_multiplier


# -------- Auth --------
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """POST /api/v1/auth/register - Register new user."""
    ser = RegisterSerializer(data=request.data)
    if not ser.is_valid():
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = ser.save()
    except IntegrityError:
        return Response(
            {"error": "A user with this email or username already exists."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    tokens = get_tokens_for_user(user)
    return Response({"userId": str(user.id), "token": tokens["token"]})


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        from rest_framework_simplejwt.exceptions import AuthenticationFailed
        from rest_framework_simplejwt.tokens import RefreshToken
        email = attrs.get("email")
        password = attrs.get("password")
        user = User.objects.filter(email=email).first()
        if not user or not user.check_password(password):
            raise AuthenticationFailed("Invalid email or password")
        refresh = RefreshToken.for_user(user)
        return {
            "token": str(refresh.access_token),
            "user": UserSerializer(user).data,
        }


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = LoginSerializer(data=request.data)
        try:
            ser.is_valid(raise_exception=True)
        except Exception as e:
            return Response({"detail": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(ser.validated_data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    """GET /api/v1/auth/me - Current user."""
    return Response(UserSerializer(request.user).data)


# -------- Profile --------
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """GET/POST /api/v1/user/profile - Get or create/update profile with calculated BMI/BMR/dailyCalories."""
    if request.method == "GET":
        profile = Profile.objects.filter(user=request.user).first()
        if not profile:
            return Response({}, status=status.HTTP_200_OK)
        return Response(ProfileSerializer(profile).data)

    # POST - create or update
    profile, _ = Profile.objects.get_or_create(user=request.user, defaults={})
    data = dict(request.data)
    if "activityLevel" in data:
        data["activity_level"] = data.pop("activityLevel", None)
    if "dietPreference" in data:
        data["diet_preference"] = data.pop("dietPreference", None)
    ser = ProfileSerializer(profile, data=data, partial=True)
    if not ser.is_valid():
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
    ser.save()

    # Recalculate
    p = profile
    bmi = calculate_bmi(p.weight, p.height) if (p.weight and p.height) else None
    bmr = calculate_bmr(p.weight, p.height, p.age, p.gender) if p.gender else None
    if bmr is not None and p.activity_level:
        daily = bmr * activity_multiplier(p.activity_level) * goal_multiplier(p.goal or "maintain")
    else:
        daily = None

    p.bmi = bmi
    p.bmr = round(bmr, 0) if bmr is not None else None
    p.daily_calories = round(daily, 0) if daily is not None else None
    p.save()

    return Response(ProfileSerializer(p).data)


# -------- Diet Plan --------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def diet_generate(request):
    """POST /api/v1/diet/generate - Generate diet plan from dailyCalories and dietPreference."""
    data = dict(request.data)
    if "dailyCalories" in data:
        data["daily_calories"] = data.pop("dailyCalories")
    if "dietPreference" in data:
        data["diet_preference"] = data.pop("dietPreference")
    ser = DietPlanGenerateSerializer(data=data)
    if not ser.is_valid():
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
    data = ser.validated_data
    cal = data["daily_calories"]
    pref = data.get("diet_preference") or "vegetarian"

    # Simple rule-based plan (hackathon shortcut)
    if pref == "vegetarian":
        breakfast = ["oats", "milk", "banana"]
        lunch = ["rice", "dal", "salad"]
        dinner = ["paneer", "roti"]
        snacks = ["fruit"]
    elif pref == "vegan":
        breakfast = ["oats", "almond milk", "banana"]
        lunch = ["rice", "dal", "salad"]
        dinner = ["tofu", "roti"]
        snacks = ["fruit", "nuts"]
    else:
        breakfast = ["eggs", "toast", "milk"]
        lunch = ["rice", "chicken", "salad"]
        dinner = ["fish", "roti", "vegetables"]
        snacks = ["fruit", "yogurt"]

    plan, _ = DietPlan.objects.update_or_create(
        user=request.user,
        defaults={
            "breakfast": breakfast,
            "lunch": lunch,
            "dinner": dinner,
            "snacks": snacks,
            "daily_calories": cal,
            "diet_preference": pref,
        },
    )
    return Response(DietPlanSerializer(plan).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def diet_current(request):
    """GET /api/v1/diet/current - Get current diet plan."""
    plan = DietPlan.objects.filter(user=request.user).first()
    if not plan:
        return Response({}, status=status.HTTP_200_OK)
    return Response(DietPlanSerializer(plan).data)


# -------- Food Analyze (AI Vision) --------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def food_analyze(request):
    """POST /api/v1/food/analyze - Form-data: image file. Returns food name + nutrition via Gemini."""
    image = request.FILES.get("image")
    if not image:
        return Response({"error": "image required"}, status=status.HTTP_400_BAD_REQUEST)

    # Read bytes and identify using Gemini
    img_bytes = image.read()
    mime = image.content_type or "image/jpeg"
    
    result = identify_food_from_image(img_bytes, mime)
    if result.get("food_name") == "Unknown Food":
        return Response(result, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
    return Response({
        "food_name": result.get("food_name"),
        "calories": result.get("calories", 0),
        "protein": result.get("protein", 0),
        "carbs": result.get("carbs", 0),
        "fat": result.get("fat", 0),
        "sugar": result.get("sugar", 0),
        "fiber": result.get("fiber", 0),
        "sodium": result.get("sodium", 0),
        "cholesterol": result.get("cholesterol", 0),
        "is_processed": result.get("is_processed", False),
        "is_fried": result.get("is_fried", False),
        "contains_refined_flour": result.get("contains_refined_flour", False),
        "is_food": result.get("is_food", True),
        "is_beverage": True if result.get("is_beverage", False) or "water" in str(result.get("food_name", "")).lower() else False,
        "unit": "ml" if result.get("is_beverage", False) or "water" in str(result.get("food_name", "")).lower() else result.get("unit", "unit")
    })


# -------- Meals --------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def meals_add(request):
    """POST /api/v1/meals/add - Log a meal."""
    data = dict(request.data)
    if "foodName" in data:
        data["food_name"] = data.pop("foodName")
    if "mealType" in data:
        data["meal_type"] = data.pop("mealType")
    
    # Determine meal type by hour using local time (respecting Asia/Kolkata)
    # Forced Asia/Kolkata time regardless of server settings
    tz_ist = pytz.timezone('Asia/Kolkata')
    now_ist = timezone.now().astimezone(tz_ist)
    current_hour = now_ist.hour
    
    # 5-11 am: breakfast, 11am-4pm: lunch, 4pm-7pm: snack, 7pm-5am: dinner
    inferred_type = "snack"
    if 5 <= current_hour < 11:
        inferred_type = "breakfast"
    elif 11 <= current_hour < 16:
        inferred_type = "lunch"
    elif 16 <= current_hour < 19:
        inferred_type = "snack"
    else:
        inferred_type = "dinner"
        
    # FORCE overwrite if it's currently 'snack' or empty
    # The user specifically mentioned that many items are being logged as 'snack' incorrectly
    is_bev = data.get("is_beverage")
    if is_bev is True or str(is_bev).lower() == 'true':
        data["meal_type"] = "beverage"
    elif data.get("meal_type") in ["snack", "", None]:
        data["meal_type"] = inferred_type
        
    print(f"--- MEAL LOGGING DEBUG (FORCED IST) ---")
    print(f"IST Time: {now_ist}, Hour: {current_hour}")
    print(f"Inferred: {inferred_type}, Final Assigned: {data['meal_type']}")

    ser = MealCreateSerializer(data=data)
    if not ser.is_valid():
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        
    # Validated data now includes sugar, is_processed, and is_food
    is_food_item = ser.validated_data.get("is_food", True)
    
    score, reason = score_meal(ser.validated_data)
    swap = get_food_swap_suggestion(ser.validated_data.get("food_name", ""))
    
    if not is_food_item:
        # Return the data so front-end can show result, but don't save to DB
        rs_data = ser.data # Returns validated data as dict
        rs_data["score"] = None
        rs_data["analysis_reason"] = "Not logged (Non-food item)"
        rs_data["swap_suggestion"] = None
        return Response(rs_data, status=status.HTTP_200_OK)

    meal = ser.save(user=request.user, score=score, analysis_reason=reason)
    
    rs_data = MealSerializer(meal).data
    rs_data["swap_suggestion"] = swap
    return Response(rs_data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def meals_today(request):
    """GET /api/v1/meals/today - Today's meals and total calories."""
    date_str = request.query_params.get('date')
    if date_str:
        from datetime import datetime
        try:
            today = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            today = timezone.localtime(timezone.now()).date()
    else:
        today = timezone.localtime(timezone.now()).date()

    meals = Meal.objects.filter(user=request.user, created_at__date=today, is_food=True, is_beverage=False).exclude(meal_type="beverage").order_by('-created_at')
    # Filter beverages for water total calculation
    beverages = Meal.objects.filter(user=request.user, created_at__date=today, is_food=True).filter(
        models.Q(is_beverage=True) | models.Q(meal_type="beverage")
    )
    total_water = sum((m.quantity or 250) if m.unit == 'ml' else 250 for m in beverages)
    
    total = sum(m.calories for m in meals)
    return Response({
        "totalCalories": total,
        "totalWater": total_water,
        "meals": MealSerializer(meals, many=True).data,
    })


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def meal_delete(request, meal_id):
    """DELETE /api/v1/meals/:mealId - Delete a meal."""
    meal = Meal.objects.filter(id=meal_id, user=request.user).first()
    if not meal:
        return Response(status=status.HTTP_404_NOT_FOUND)
    meal.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# -------- Calorie Tracking --------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def calories_today(request):
    """GET /api/v1/calories/today - Daily summary: goal, consumed, remaining + macro totals."""
    profile = Profile.objects.filter(user=request.user).first()
    goal = (profile.daily_calories or 2000) if profile else 2000
    date_str = request.query_params.get('date')
    if date_str:
        from datetime import datetime
        try:
            today = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            today = timezone.localtime(timezone.now()).date()
    else:
        today = timezone.localtime(timezone.now()).date()

    meals = Meal.objects.filter(user=request.user, created_at__date=today, is_food=True, is_beverage=False).order_by('-created_at')
    consumed = sum(m.calories for m in meals)
    
    # Calculate water intake (sum quantity for ml/water items)
    all_logs = Meal.objects.filter(user=request.user, created_at__date=today, is_food=True)
    water_logs = all_logs.filter(is_beverage=True)
    # If unit is ml, use quantity. Otherwise ignore for water total? 
    # Let's be smart: if it's a beverage, it counts towards hydration.
    total_water = sum((m.quantity or 250) if m.unit == 'ml' else 250 for m in water_logs) # fallback 250ml for unit-based drinks
    
    protein = sum(m.protein for m in meals)
    carbs = sum(m.carbs for m in meals)
    fat = sum(m.fat for m in meals)
    
    return Response({
        "consumed": consumed,
        "goal": goal,
        "remaining": goal - consumed,
        "impact_percentage": min(100, round((consumed / goal) * 100)) if goal > 0 else 0,
        "protein": protein,
        "carbs": carbs,
        "fat": fat,
        "totalWater": total_water,
        "waterGoal": 3000 # default 3L
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def calories_weekly(request):
    """GET /api/v1/calories/weekly - Last 7 days calories."""
    today = timezone.localtime(timezone.now()).date()
    out = []
    for i in range(7):
        d = today - timedelta(days=i)
        total = sum(
            m.calories for m in Meal.objects.filter(user=request.user, created_at__date=d)
        )
        out.append({"day": d.strftime("%a"), "date": d.isoformat(), "calories": total})
    out.reverse()
    return Response(out)


# -------- Workout --------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def workout_recommendation(request):
    """GET /api/v1/workout/recommendation - Suggestion based on surplus."""
    profile = Profile.objects.filter(user=request.user).first()
    goal = (profile.daily_calories or 2000) if profile else 2000
    today = timezone.localtime(timezone.now()).date()
    meals = Meal.objects.filter(user=request.user, created_at__date=today, is_food=True).order_by('-created_at')
    consumed = sum(m.calories for m in meals)
    
    surplus = consumed - goal
    
    if surplus > 0:
        rec = get_exercise_to_burn_calories(surplus)
        if rec:
            return Response({
                "suggestion": f"{rec['minutes_required']} min of {rec['activity']} to balance your surplus",
                "caloriesBurn": surplus,
                "surplus": surplus
            })
    
    return Response({
        "suggestion": "No surplus to burn off today! Keep it up.",
        "caloriesBurn": 0,
        "surplus": max(0, surplus)
    })


# -------- Insights --------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def insights(request):
    """GET /api/v1/insights - AI generated feedback list."""
    date_str = request.query_params.get('date')
    if date_str:
        from datetime import datetime
        try:
            today = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            today = timezone.localtime(timezone.now()).date()
    else:
        today = timezone.localtime(timezone.now()).date()
    # Get today's stats
    profile = Profile.objects.filter(user=request.user).first()
    goal = (profile.daily_calories or 2000) if profile else 2000
    
    today_meals = Meal.objects.filter(user=request.user, created_at__date=today)
    foods = today_meals.filter(is_food=True, is_beverage=False).exclude(meal_type="beverage")
    consumed = sum(m.calories for m in foods)
    
    beverages = today_meals.filter(models.Q(is_beverage=True) | models.Q(meal_type="beverage"))
    total_water = sum((m.quantity or 250) if m.unit == 'ml' else 250 for m in beverages)
    
    # Create a unique state signature based on exactly calories and hydration
    from .models import Insight
    current_state_signature = f"pattern_{int(consumed)}_{int(total_water)}"
    
    latest_insight = Insight.objects.filter(user=request.user, type__startswith="pattern").order_by('-created_at').first()
    
    should_generate = not latest_insight or latest_insight.type != current_state_signature

    if should_generate:
        # Get exactly 1 latest meal and its calories
        latest_meal = foods.order_by('-created_at').first()
        last_meal_cals = latest_meal.calories if latest_meal else 0
        
        # Determine age
        age = profile.age if profile else 30
        
        # Generate the DETERMINISTIC Insight
        try:
            insight_text = get_deterministic_insight(age, total_water, consumed, goal, last_meal_cals)
            Insight.objects.create(user=request.user, message=insight_text, type=current_state_signature)
        except Exception as e:
            print(f"Deterministic Insight generation failed: {e}")
            if not latest_insight:
                return Response(["Stay hydrated and eat balanced meals!"])

    # Return exactly 1 insight
    insight_to_return = Insight.objects.filter(user=request.user, type__startswith="pattern").order_by('-created_at').first()
    return Response([insight_to_return.message if insight_to_return else "Log a meal to get smart insights!"])


# -------- Progress --------
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def progress_weight(request):
    """GET /api/v1/progress/weight - Weight history and future projection."""
    if request.method == "GET":
        logs = WeightLog.objects.filter(user=request.user).order_by("date")[:90]
        projection = calculate_weight_projection(request.user)
        return Response({
            "logs": [{"date": str(l.date), "weight": l.weight} for l in logs],
            "projection": projection
        })

    ser = WeightLogCreateSerializer(data=request.data)
    if not ser.is_valid():
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
    today = timezone.now().date()
    obj, _ = WeightLog.objects.update_or_create(
        user=request.user,
        date=today,
        defaults={"weight": ser.validated_data["weight"]},
    )
    
    # Update profile weight automatically
    profile = request.user.profile
    profile.weight = obj.weight
    profile.save()
    
    return Response(WeightLogSerializer(obj).data, status=status.HTTP_201_CREATED)


from rest_framework import viewsets

class MealReminderViewSet(viewsets.ModelViewSet):
    """ViewSet for managing meal reminders."""
    serializer_class = MealReminderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MealReminder.objects.filter(user=self.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # Alias user for get_queryset (fix for some versions)
    @property
    def user(self):
        return self.request.user


# -------- Chatbot --------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def chat_bot(request):
    """POST /api/v1/chat - Chat with AI nutritionist."""
    message = request.data.get("message")
    if not message:
        return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)
        
    reply = chat_with_nutritionist(message)
    return Response({"reply": reply})

