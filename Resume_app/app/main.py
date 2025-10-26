from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.llm import generate_from_doc
import os, uuid

app = FastAPI(title='Resume Parser API')

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = 'docs/inputs/'
OUTPUT_DIR = 'docs/output/'
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    filename = file.filename or f"uploaded_{uuid.uuid4()}.pdf"
    file_location = os.path.join(UPLOAD_DIR, filename)
    
    with open(file_location, 'wb') as f:
        content = await file.read()
        f.write(content)
    
    llm_response = generate_from_doc(file_location)
    
    base_name = os.path.splitext(filename)[0]
    output_filename = f"{base_name}.json"
    output_file_path = os.path.join(OUTPUT_DIR, output_filename)
    
    with open(output_file_path, 'w', encoding='utf-8') as json_file:
        json_file.write(llm_response)
    
    return {'file_name': filename, 'llm_response': llm_response}

# Serve static files
app.mount("/", StaticFiles(directory="static", html=True), name="static")

