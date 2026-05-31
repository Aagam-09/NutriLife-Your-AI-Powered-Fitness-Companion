from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Profile, Meal, DietPlan, WeightLog, MealReminder


# ---- Auth ----
import re

class RegisterSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_password(self, value):
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one number.")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError("Password must contain at least one special character.")
        return value

    age = serializers.IntegerField(write_only=True, required=False)
    height = serializers.FloatField(write_only=True, required=False)
    weight = serializers.FloatField(write_only=True, required=False)
    gender = serializers.ChoiceField(choices=Profile.GENDER_CHOICES, write_only=True, required=False)
    activity_level = serializers.ChoiceField(choices=Profile.ACTIVITY_LEVELS, write_only=True, required=False)
    goal = serializers.ChoiceField(choices=Profile.GOAL_CHOICES, write_only=True, required=False)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "first_name", "name", "age", "height", "weight", "gender", "activity_level", "goal")
        extra_kwargs = {"first_name": {"required": False}, "username": {"required": False}}

    def validate_email(self, value):
        if value and User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        from .utils import calculate_daily_calories, calculate_bmi, calculate_bmr
        
        name = validated_data.pop("name", None) or validated_data.get("first_name", "")
        validated_data.pop("first_name", None)
        email = validated_data.pop("email")
        username = validated_data.pop("username", email)
        password = validated_data.pop("password")
        
        # Pop body metrics
        age = validated_data.pop("age", None)
        height = validated_data.pop("height", None)
        weight = validated_data.pop("weight", None)
        gender = validated_data.pop("gender", "male")
        activity_level = validated_data.pop("activity_level", "moderate")
        goal = validated_data.pop("goal", "maintain")

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=name,
        )
        
        # Calculate budget
        daily_calories = calculate_daily_calories(weight, height, age, gender, activity_level, goal)
        bmi = calculate_bmi(weight, height)
        bmr = calculate_bmr(weight, height, age, gender)

        # Create Profile
        Profile.objects.create(
            user=user,
            age=age,
            height=height,
            weight=weight,
            gender=gender,
            activity_level=activity_level,
            goal=goal,
            daily_calories=daily_calories,
            bmi=bmi,
            bmr=bmr
        )
        
        return user


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="first_name", read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "name", "date_joined")


# ---- Profile ----
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = (
            "age", "height", "weight", "gender", "activity_level",
            "goal", "diet_preference", "bmi", "bmr", "daily_calories",
        )
        read_only_fields = ("bmi", "bmr", "daily_calories")


# ---- Meals ----
class MealSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meal
        fields = ("id", "food_name", "calories", "protein", "carbs", "fat", "sugar", "fiber", "sodium", "cholesterol", "is_fried", "contains_refined_flour", "is_food", "is_beverage", "quantity", "unit", "meal_type", "score", "analysis_reason", "created_at")
        read_only_fields = ("id", "created_at", "score", "analysis_reason")


class MealCreateSerializer(serializers.ModelSerializer):
    is_processed = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = Meal
        fields = ("food_name", "calories", "protein", "carbs", "fat", "sugar", "fiber", "sodium", "cholesterol", "is_fried", "contains_refined_flour", "meal_type", "is_processed", "is_food", "is_beverage", "quantity", "unit")


# ---- Diet Plan ----
class DietPlanGenerateSerializer(serializers.Serializer):
    daily_calories = serializers.FloatField()
    diet_preference = serializers.CharField(required=False, default="vegetarian")


class DietPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = DietPlan
        fields = ("breakfast", "lunch", "dinner", "snacks", "daily_calories", "diet_preference")


# ---- Progress ----
class WeightLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeightLog
        fields = ("id", "weight", "date", "created_at")


class WeightLogCreateSerializer(serializers.Serializer):
    weight = serializers.FloatField()


class MealReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealReminder
        fields = ("id", "meal_type", "reminder_time", "is_active", "created_at")
        read_only_fields = ("id", "created_at")

