import os
from dotenv import load_dotenv
from google import genai
import pypdf

load_dotenv()

# Get API key
api_key = os.getenv('KEY')

# Initialize Gemini client
client = genai.Client(api_key=api_key)
model = "gemini-2.5-flash"

# Function to generate text using Gemini
def generate_text(prompt):
    response = client.models.generate_content(
        model=model,
        contents=[prompt],
    )
    return response.text

def generate_from_doc(file_path):
    """
    Reads the pdf file and generates structured JSON using Gemini LLM.
    """
    try:
        # create reader
        reader = pypdf.PdfReader(file_path)
        number_of_pages = len(reader.pages)
        print(f"Resume has {number_of_pages} pages.")

        # extract text
        all_text = ""
        for page in reader.pages:
            all_text += page.extract_text() + '\n'

        # Generate structured JSON from extracted text
        prompt=f""" Extract the following resume text into a structured JSON format with fields: 
        Name, Contact Information, Summary, Skills, Experience, Education. Text: {all_text}
        """
        response = client.models.generate_content(
            model=model,
            contents=[prompt]
        )
        return response.text
    
    except Exception as e:
        print(f"Error processing file: {e}")
        raise