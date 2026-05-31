from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path("auth/register", views.register),
    path("auth/login", views.LoginView.as_view()),
    path("auth/me", views.me),
    # User profile
    path("user/profile", views.profile_view),
    # Diet
    path("diet/generate", views.diet_generate),
    path("diet/current", views.diet_current),
    # Food
    path("food/analyze", views.food_analyze),
    # Meals
    path("meals/add", views.meals_add),
    path("meals/today", views.meals_today),
    path("meals/<int:meal_id>", views.meal_delete),
    # Calories
    path("calories/today", views.calories_today),
    path("calories/weekly", views.calories_weekly),
    # Workout
    path("workout/recommendation", views.workout_recommendation),
    # Insights
    path("insights", views.insights),
    # Progress
    path("progress/weight", views.progress_weight),
    # Meal Reminders
    path("meal-reminders", views.MealReminderViewSet.as_view({"get": "list", "post": "create"})),
    path("meal-reminders/<int:pk>", views.MealReminderViewSet.as_view({"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"})),
    # Chatbot
    path("chat", views.chat_bot),
]
