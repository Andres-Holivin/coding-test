from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
from dotenv import load_dotenv
import os
from pydantic import BaseModel
from google import genai



load_dotenv()
app = FastAPI()
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# genai.configure(api_key=os.getenv('GOOGLE_API_AI_KEY'))
# model = genai.GenerativeModel('gemini-pro')
client = genai.Client(api_key=os.getenv('GOOGLE_API_AI_KEY'))

class Question(BaseModel):
    question: str
    
class AnswareRespose(BaseModel):
    answare: str = None
    salesReps: list = None

# Load dummy data
with open("../dummyData.json", "r") as f:
    DUMMY_DATA = json.load(f)

@app.get("/api/data",response_model=AnswareRespose)
def get_data():
    return DUMMY_DATA


    
@app.post("/api/ai", response_model=AnswareRespose)
async def ai_endpoint(request: Question):
    """
    Accepts a user question and returns a placeholder AI response.
    (Optionally integrate a real AI model or external service here.)
    """
    try:
        user_question = request.question
        
        context = f"""
        You are a helpful assistant with access to contact information.
        Here is the contacts database in JSON format:
        {json.dumps(DUMMY_DATA, indent=2)}
        
        Answer the following question based on this information:
        {user_question}
        
        if answer is in the database, return the answer in JSON format and the key "salesReps".
        else return a JSON object with the key "answer" in every answer.
        """
        # response = model.generate_content(context)

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[context]
        )
        print(response.text)
        json_str = response.text.strip('```json\n').strip('```').strip()

        # Parse the JSON string into a Python dictionary
        json_data = json.loads(json_str)
        print(json_data)
        # Placeholder logic: echo the question or generate a simple response
        # Replace with real AI logic as desired (e.g., call to an LLM).
        return json_data
    except Exception as e:
        print(f"Error processing request: {e}")
        return {"answer": "Your question could not be processed. Please try again."}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
