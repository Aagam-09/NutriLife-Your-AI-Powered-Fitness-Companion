from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    """User body metrics and calculated BMR/BMI/daily calories."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    age = models.PositiveIntegerField(null=True, blank=True)
    height = models.FloatField(null=True, blank=True)  # cm
    weight = models.FloatField(null=True, blank=True)  # kg
    GENDER_CHOICES = [("male", "Male"), ("female", "Female"), ("other", "Other")]
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
    ACTIVITY_LEVELS = [
        ("sedentary", "Sedentary"),
        ("light", "Light"),
        ("moderate", "Moderate"),
        ("active", "Active"),
        ("very_active", "Very Active"),
    ]
    activity_level = models.CharField(max_length=20, choices=ACTIVITY_LEVELS, null=True, blank=True)
    GOAL_CHOICES = [
        ("fat_loss", "Fat Loss"),
        ("maintain", "Maintain"),
        ("muscle_gain", "Muscle Gain"),
    ]
    goal = models.CharField(max_length=20, choices=GOAL_CHOICES, null=True, blank=True)
    DIET_PREFERENCES = [
        ("vegetarian", "Vegetarian"),
        ("vegan", "Vegan"),
        ("non_vegetarian", "Non-Vegetarian"),
    ]
    diet_preference = models.CharField(max_length=20, choices=DIET_PREFERENCES, null=True, blank=True)
    # Calculated fields
    bmi = models.FloatField(null=True, blank=True)
    bmr = models.FloatField(null=True, blank=True)
    daily_calories = models.FloatField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile({self.user.email})"


class Meal(models.Model):
    """Single logged meal entry."""
    MEAL_TYPES = [
        ("breakfast", "Breakfast"),
        ("lunch", "Lunch"),
        ("dinner", "Dinner"),
        ("snack", "Snack"),
        ("beverage", "Beverage"),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="meals")
    food_name = models.CharField(max_length=255)
    calories = models.FloatField()
    protein = models.FloatField(default=0)
    carbs = models.FloatField(default=0)
    fat = models.FloatField(default=0)
    sugar = models.FloatField(default=0)
    fiber = models.FloatField(default=0)
    sodium = models.FloatField(default=0)
    cholesterol = models.FloatField(default=0)
    is_fried = models.BooleanField(default=False)
    contains_refined_flour = models.BooleanField(default=False)
    is_processed = models.BooleanField(default=False)
    is_food = models.BooleanField(default=True)
    is_beverage = models.BooleanField(default=False)
    quantity = models.FloatField(default=1.0)
    unit = models.CharField(max_length=50, default="unit")
    meal_type = models.CharField(max_length=20, choices=MEAL_TYPES)
    
    # Nutrition AI Coaching Fields
    score = models.FloatField(null=True, blank=True)
    analysis_reason = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.food_name} ({self.meal_type})"


class DietPlan(models.Model):
    """Generated diet plan per user (current plan)."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="diet_plan")
    breakfast = models.JSONField(default=list)  # list of food names
    lunch = models.JSONField(default=list)
    dinner = models.JSONField(default=list)
    snacks = models.JSONField(default=list)
    daily_calories = models.FloatField(null=True, blank=True)
    diet_preference = models.CharField(max_length=50, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"DietPlan({self.user.email})"


class WeightLog(models.Model):
    """Weight progress over time."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="weight_logs")
    weight = models.FloatField()
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]
        unique_together = [["user", "date"]]

    def __str__(self):
        return f"{self.user.email} - {self.date}: {self.weight}kg"


class MealReminder(models.Model):
    """Scheduled meal alerts for users."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="meal_reminders")
    meal_type = models.CharField(max_length=50)
    reminder_time = models.TimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["reminder_time"]

    def __str__(self):
        return f"{self.user.email} - {self.meal_type} at {self.reminder_time}"


class Insight(models.Model):
    """Stores AI-generated or rules-based behavioral insights."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="insights")
    message = models.TextField()
    type = models.CharField(max_length=50, default="pattern")  # 'pattern', 'warning', 'praise'
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Insight({self.user.username}): {self.message[:20]}"


class FoodSwap(models.Model):
    """Deterministic healthy alternatives."""
    original_food = models.CharField(max_length=100, unique=True)
    healthy_alternative = models.CharField(max_length=100)
    reason = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.original_food} -> {self.healthy_alternative}"


class ExerciseBalance(models.Model):
    """Deterministic exercise mapping to calories burned per 30 minutes."""
    activity = models.CharField(max_length=100, unique=True)
    calories_burned_per_30_min = models.IntegerField()

    def __str__(self):
        return f"{self.activity} ({self.calories_burned_per_30_min} kcal/30m)"
