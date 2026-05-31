# Calorie Tracker API – Endpoints & Use Cases

**Base URL:** `http://localhost:8000/api/v1`  
**Auth:** JWT in header: `Authorization: Bearer <token>`

---

## 1. Authentication

Users must log in to track calories. All protected endpoints require the JWT in the header.

| Method | Endpoint | Use case | Auth |
|--------|----------|-----------|------|
| POST | `/auth/register` | Create new account | No |
| POST | `/auth/login` | Get JWT and user object | No |
| GET | `/auth/me` | Get current user (validate token) | Yes |

### Register
- **POST** `/api/v1/auth/register`  
- **Body:** `{ "name": "Sarjan", "email": "user@email.com", "password": "123456" }`  
- **Response:** `{ "userId": "123", "token": "jwt_token" }`  
- **Use case:** Sign up before first login.

### Login
- **POST** `/api/v1/auth/login`  
- **Body:** `{ "email": "user@email.com", "password": "123456" }`  
- **Response:** `{ "token": "jwt_token", "user": { "id", "email", "name", ... } }`  
- **Use case:** Get token for subsequent API calls.

### Get current user
- **GET** `/api/v1/auth/me`  
- **Header:** `Authorization: Bearer <token>`  
- **Response:** Current user object.  
- **Use case:** Check auth, show profile, refresh user state.

---

## 2. User profile

Stores body metrics. Backend computes BMI, BMR, and daily calories.

| Method | Endpoint | Use case | Auth |
|--------|----------|-----------|------|
| GET | `/user/profile` | Fetch profile and calculated metrics | Yes |
| POST | `/user/profile` | Create or update profile; recalc BMI/BMR/dailyCalories | Yes |

### Create / update profile
- **POST** `/api/v1/user/profile`  
- **Body:**  
  `{ "age": 22, "height": 175, "weight": 70, "gender": "male", "activityLevel": "moderate", "goal": "fat_loss", "dietPreference": "vegetarian" }`  
- **Note:** Use camelCase or snake_case (e.g. `activity_level`).  
- **Response:** `{ "bmi": 22.8, "bmr": 1650, "dailyCalories": 2100, ... }`  
- **Use case:** Onboarding, updating goals or body metrics.

### Get profile
- **GET** `/api/v1/user/profile`  
- **Response:** Profile with `bmi`, `bmr`, `daily_calories`, and other fields.  
- **Use case:** Dashboard, settings, calorie goal display.

---

## 3. Diet plan

Generate and fetch the current diet plan.

| Method | Endpoint | Use case | Auth |
|--------|----------|-----------|------|
| POST | `/diet/generate` | Generate plan from calories + preference | Yes |
| GET | `/diet/current` | Get current plan | Yes |

### Generate diet plan
- **POST** `/api/v1/diet/generate`  
- **Body:** `{ "dailyCalories": 2000, "dietPreference": "vegetarian" }`  
- **Response:**  
  `{ "breakfast": ["oats","milk","banana"], "lunch": ["rice","dal","salad"], "dinner": ["paneer","roti"], "snacks": ["fruit"] }`  
- **Use case:** After profile is set or goal changes.

### Get current diet plan
- **GET** `/api/v1/diet/current`  
- **Response:** Same structure as generate, or empty if none.  
- **Use case:** Diet plan screen, meal suggestions.

---

## 4. Food recognition

Meal image analysis (currently stub; can be wired to OpenAI Vision or Nutritionix).

| Method | Endpoint | Use case | Auth |
|--------|----------|----------|------|
| POST | `/food/analyze` | Upload image → get food + nutrition | Yes |

### Upload food image
- **POST** `/api/v1/food/analyze`  
- **Content-Type:** `multipart/form-data`  
- **Body:** `image`: file  
- **Response:**  
  `{ "food": "pizza", "calories": 285, "protein": 12, "carbs": 36, "fat": 10 }`  
- **Use case:** Scan meal to pre-fill meal log.

---

## 5. Food logging (meals)

Log and list meals.

| Method | Endpoint | Use case | Auth |
|--------|----------|-----------|------|
| POST | `/meals/add` | Log a meal | Yes |
| GET | `/meals/today` | Today’s meals + total calories | Yes |
| DELETE | `/meals/<mealId>` | Remove a meal | Yes |

### Add meal
- **POST** `/api/v1/meals/add`  
- **Body:**  
  `{ "foodName": "Pizza slice", "calories": 285, "protein": 12, "carbs": 36, "fat": 10, "mealType": "lunch" }`  
- **mealType:** `breakfast` \| `lunch` \| `dinner` \| `snack`  
- **Use case:** Manual log or after food/analyze.

### Get today’s meals
- **GET** `/api/v1/meals/today`  
- **Response:** `{ "totalCalories": 1350, "meals": [ ... ] }`  
- **Use case:** Dashboard, meal list for the day.

### Delete meal
- **DELETE** `/api/v1/meals/<mealId>`  
- **Response:** 204 No Content.  
- **Use case:** Correct mistaken log.

---

## 6. Calorie tracking

Daily and weekly calorie summary.

| Method | Endpoint | Use case | Auth |
|--------|----------|-----------|------|
| GET | `/calories/today` | Goal, consumed, remaining | Yes |
| GET | `/calories/weekly` | Last 7 days calories | Yes |

### Daily summary
- **GET** `/api/v1/calories/today`  
- **Response:** `{ "goal": 2000, "consumed": 1350, "remaining": 650 }`  
- **Use case:** Progress circle, “remaining calories” on dashboard.

### Weekly stats
- **GET** `/api/v1/calories/weekly`  
- **Response:** `[ { "day": "Mon", "date": "2026-03-03", "calories": 1800 }, ... ]`  
- **Use case:** Weekly chart.

---

## 7. Workout recommendation

| Method | Endpoint | Use case | Auth |
|--------|----------|-----------|------|
| GET | `/workout/recommendation` | Get suggestion + estimated burn | Yes |

### Get workout suggestion
- **GET** `/api/v1/workout/recommendation`  
- **Response:** `{ "suggestion": "30 min jogging", "caloriesBurn": 300 }`  
- **Use case:** Workout card on dashboard or workout page.

---

## 8. Insights

Smart, feedback-style insights.

| Method | Endpoint | Use case | Auth |
|--------|----------|-----------|------|
| GET | `/insights` | Get list of insight strings | Yes |

### Get insights
- **GET** `/api/v1/insights`  
- **Response:** `[ "Your protein intake is low today", "You consumed most calories at night", "Try adding eggs or lentils to breakfast" ]`  
- **Use case:** Insights card on dashboard.

---

## 9. Progress (weight)

Log weight and get history for graphs.

| Method | Endpoint | Use case | Auth |
|--------|----------|-----------|------|
| POST | `/progress/weight` | Log weight for today | Yes |
| GET | `/progress/weight` | Weight history for graph | Yes |

### Log weight
- **POST** `/api/v1/progress/weight`  
- **Body:** `{ "weight": 68 }`  
- **Use case:** Daily/weekly weight entry.

### Get progress graph data
- **GET** `/api/v1/progress/weight`  
- **Response:** `[ { "date": "2026-03-01", "weight": 70 }, { "date": "2026-03-05", "weight": 69 } ]`  
- **Use case:** Weight trend chart.

---

## Quick test order (e.g. Postman)

1. **POST** `/api/v1/auth/register` → get `token`.  
2. **POST** `/api/v1/auth/login` → confirm `token` and `user`.  
3. **GET** `/api/v1/auth/me` with `Authorization: Bearer <token>`.  
4. **POST** `/api/v1/user/profile` with body metrics.  
5. **GET** `/api/v1/user/profile`.  
6. **POST** `/api/v1/meals/add` → then **GET** `/api/v1/meals/today` and **GET** `/api/v1/calories/today`.  
7. **POST** `/api/v1/diet/generate` → **GET** `/api/v1/diet/current`.  
8. **GET** `/api/v1/workout/recommendation`, **GET** `/api/v1/insights`.  
9. **POST** `/api/v1/progress/weight` → **GET** `/api/v1/progress/weight`.  
10. **POST** `/api/v1/food/analyze` with form-data `image` file.

---

## Database models (reference)

- **User** – id, name (first_name), email, password, createdAt.  
- **Profile** – userId, age, height, weight, gender, activityLevel, goal, dietPreference, bmi, bmr, dailyCalories.  
- **Meal** – userId, foodName, calories, protein, carbs, fat, mealType, createdAt.  
- **DietPlan** – userId, breakfast[], lunch[], dinner[], snacks[].  
- **WeightLog** – userId, weight, date.
