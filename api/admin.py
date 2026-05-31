from django.contrib import admin
from .models import Profile, Meal, DietPlan, WeightLog, MealReminder


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "age", "weight", "height", "daily_calories", "updated_at")


@admin.register(Meal)
class MealAdmin(admin.ModelAdmin):
    list_display = ("user", "food_name", "calories", "meal_type", "created_at")
    list_filter = ("meal_type",)


@admin.register(DietPlan)
class DietPlanAdmin(admin.ModelAdmin):
    list_display = ("user", "daily_calories", "diet_preference", "updated_at")


@admin.register(WeightLog)
class WeightLogAdmin(admin.ModelAdmin):
    list_display = ("user", "weight", "date", "created_at")

@admin.register(MealReminder)
class MealReminderAdmin(admin.ModelAdmin):
    list_display = ("user", "meal_type", "reminder_time", "is_active", "created_at")
    list_filter = ("is_active", "meal_type")
