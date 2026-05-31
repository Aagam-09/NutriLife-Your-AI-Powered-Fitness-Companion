# Calorie Tracker – Django Backend

## Setup

```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
python manage.py migrate
python manage.py runserver 8000
```

API base: **http://localhost:8000/api/v1**

## Test with Postman

1. **Register:** `POST /api/v1/auth/register`  
   Body (JSON): `{"name":"Sarjan","email":"user@email.com","password":"123456"}`  
   → Copy the `token` from the response.

2. **Login:** `POST /api/v1/auth/login`  
   Body: `{"email":"user@email.com","password":"123456"}`  
   → Use the returned `token` for other requests.

3. **Protected endpoints:** Add header  
   `Authorization: Bearer <your_token>`

4. See **docs/API_ENDPOINTS.md** for all endpoints, request/response shapes, and use cases.

## Food image analysis

`POST /api/v1/food/analyze` currently returns mock data. To use real AI:

- **OpenAI Vision:** Send the uploaded image to the Vision API and parse the response into `food`, `calories`, `protein`, `carbs`, `fat`.
- **Nutritionix:** Use their food image or search API and map the result to the same fields.

Update the `food_analyze` view in `api/views.py` to call your chosen API.

## Database

Default: SQLite (`db.sqlite3`). For MongoDB, you’d need a different adapter (e.g. djongo or custom PyMongo usage); the current code uses the Django ORM with SQLite.
