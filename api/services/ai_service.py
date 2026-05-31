import os
import json
import time
import logging
from google import genai
from google.genai import types
from django.conf import settings

# Configure logging
logger = logging.getLogger(__name__)

# Gemini key loading is intentionally disabled.
API_KEY_1 = ""
API_KEY_2 = ""

clients = []
if API_KEY_1:
    clients.append(genai.Client(api_key=API_KEY_1))
if API_KEY_2:
    clients.append(genai.Client(api_key=API_KEY_2))

# Models to try in order of preference (helps bypass model-specific quotas)
# Using specific versions from user dashboard + standard stable versions
MODELS_QUEUE = [
    "gemini-2.5-flash",    # Primary from user screenshot
    "gemini-2.5-pro",      # Secondary from user screenshot
    "gemini-2.0-flash",    # Tertiary from user screenshot
    "gemini-1.5-flash",    # Standard stable fallback
    "gemini-1.5-pro",      # Standard high-performance fallback
]

MAX_RETRIES = 1

def call_gemini_with_fallback(func, *args, **kwargs):
    """
    Generic wrapper to call Gemini APIs with nested fallback:
    Models Queue -> Multiple Clients -> Local Retries
    """
    if not clients:
        logger.warning("No Gemini API clients configured.")
        return None

    last_err = None
    for model_id in MODELS_QUEUE:
        for i, client in enumerate(clients):
            for attempt in range(MAX_RETRIES + 1):
                try:
                    logger.info(f"Attempting {model_id} with Client {i+1} (Attempt {attempt+1})")
                    return func(client, model_id, *args, **kwargs)
                except Exception as e:
                    err_msg = str(e).lower()
                    last_err = e
                    
                    # If it's a quota/rate limit error, move to next CLIENT immediately
                    if "429" in err_msg or "quota" in err_msg or "resource_exhausted" in err_msg:
                        logger.warning(f"Quota reached for {model_id} on Client {i+1}. Switching client...")
                        break # Break retry loop, move to next client
                    
                    # If it's a service error or timeout, retry locally first
                    if attempt < MAX_RETRIES:
                        logger.info(f"Retrying {model_id} due to transient error: {e}")
                        time.sleep(1)
                        continue
                    
                    # If all retries failed for this client, move to next client
                    logger.error(f"Error calling {model_id} on Client {i+1}: {e}")
                    break 

    logger.critical(f"All models and clients failed. Last error: {last_err}")
    return None

def identify_food_from_image(image_bytes, mime_type="image/jpeg"):
    """
    Given raw image bytes and mime type, asks Gemini to identify the food.
    Tries multiple models if quota is hit.
    """
    prompt = """
    Identify the food or drink in this image. 
    Return ONLY a JSON object with: 
    { 
        "food_name": string, 
        "calories": number, 
        "protein": number, 
        "carbs": number, 
        "fat": number, 
        "sugar": number, 
        "fiber": number, 
        "sodium": number, 
        "cholesterol": number, 
        "is_processed": boolean, 
        "is_fried": boolean, 
        "contains_refined_flour": boolean, 
        "is_food": boolean, 
        "is_beverage": boolean, 
        "unit": string 
    } 
    Be extremely accurate. 
    Estimated nutritional values MUST be PER ONE UNIT (e.g. per 1 apple, per 1 bowl, per 100 ml).
    
    CRITICAL INSTRUCTIONS FOR WATER AND LIQUIDS:
    1. If the item is Water, tea, coffee, soda, or ANY liquid:
       - "is_beverage" MUST BE true
       - "unit" MUST BE EXACTLY "ml"
       - "is_food" MUST BE true (so it can be logged)
       - All nutritional facts MUST be per 100 ml.
    
    CRITICAL INSTRUCTIONS FOR SOLID FOODS:
    - "is_beverage" MUST BE false.
    - "unit" should be a logical unit (e.g. "g", "bowl", "handful", "apple", "unit").
    
    CRITICAL INSTRUCTIONS FOR NON-FOOD ITEM (e.g. medicine, balms, random objects):
    - "is_food" MUST BE false.
    
    CRITICAL INSTRUCTIONS FOR BOOLEAN FLAGS:
    - is_processed MUST be true for packaged/factory-made items.
    - is_fried MUST be true if the food is deep-fried or oily. 
    - contains_refined_flour MUST be true if it contains 'maida'.
    """

    def vision_func(client, model_id):
        response = client.models.generate_content(
            model=model_id,
            contents=[
                prompt,
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        try:
            return json.loads(response.text.strip())
        except:
            import re
            match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if match:
                return json.loads(match.group())
            raise ValueError("Cloud not parse JSON from Gemini response")

    result = call_gemini_with_fallback(vision_func)
    
    if result:
        return result
    
    # Fallback default if everything fails
    return {"food_name": "Unknown Food (Service Unavailable)", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "sugar": 0, "fiber": 0, "sodium": 0, "cholesterol": 0, "is_processed": False, "is_fried": False, "contains_refined_flour": False, "is_food": False}


def generate_pattern_insights(user_data_summary: str) -> str:
    """
    Given a string describing the user's current status (calories, hydration, last 2 meals),
    generate a single short insight and 1 exercise recommendation.
    """
    def insight_func(client, model_id):
        prompt = f'''
        You are a friendly, concise AI nutrition and fitness coach. 
        Here is the user's current status for today:
        "{user_data_summary}"
        
        Write exactly ONE short, punchy sentence of insight/tip based on this data.
        Followed by EXACTLY ONE short exercise suggestion (e.g. "Do a 15 min brisk walk").
        Format your response strictly as:
        [Your insight sentence] | [Your exercise suggestion]
        
        Do not include any other text.
        '''
        response = client.models.generate_content(model=model_id, contents=prompt)
        return response.text.strip()

    result = call_gemini_with_fallback(insight_func)
    return result if result else "Keep tracking your meals to unlock personalized insights! | 10 mins stretching"


def chat_with_nutritionist(user_message: str) -> str:
    """
    Given a user message, answers STRICTLY as a nutrition assistant.
    """
    def chat_func(client, model_id):
        prompt = f'''
        You are a strict nutrition and calorie assistant. 
        Your task is to assist the user STRICTLY REGARDING ANY FOOD OR CALORIE QUERY.
        
        RULES:
        1. Always reply in very short, concise bullet points using standard markdown.
        2. Do NOT use long paragraphs.
        3. Bold key terms using **word**.
        4. If the user asks anything outside of nutrition/calories, reply exactly with: "I am your nutrition assistant and I can only help you with food, diet, and calorie tracking queries."
        
        User message: "{user_message}"
        '''
        response = client.models.generate_content(model=model_id, contents=prompt)
        return response.text.strip()

    result = call_gemini_with_fallback(chat_func)
    return result if result else "I'm having trouble connecting right now. Please try again later."
