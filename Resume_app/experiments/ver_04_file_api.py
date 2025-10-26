from fastapi import FastAPI, UploadFile, File
from app.llm import generate_from_doc
import os, uuid, shutil
from fastapi.staticfiles import StaticFiles

app = FastAPI(title='File Upload API')

# Upload directory
UPLOAD_DIR = 'docs/inputs/'
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Serve static files (HTML, CSS, JS)
app.mount("/", StaticFiles(directory="static", html=True), name="static")

# API
@app.get("/")
async def root():
    return {"message": "API is Running...", "endpoints": ["/uploads/"]}

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    """
    Uploads a file, stores it temporarily, invokes LLM and returns contents in JSON format.
    """
    # Save uploaded file
    filename = file.filename or f"uploaded_{uuid.uuid4()}.pdf"
    file_location = os.path.join(UPLOAD_DIR, file.filename)

    # save file to disk
    with open(file_location, 'wb') as f:
        content = await file.read()
        f.write(content)

    # Invoke LLM
    llm_response = generate_from_doc(file_location)

    print(llm_response)

    # save JSON response to file
    base_name = os.path.splitext(filename)[0] # removes extension
    output_file_name = f'{base_name}.json'
    output_file_path = os.path.join(UPLOAD_DIR, '..', 'output', output_file_name)
    with open(output_file_path, 'w') as json_file:
        json_file.write(llm_response)

    print(f"Response saved in {output_file_name}")
    
    return {'file_name': file.filename, 'llm_response': llm_response}

        