from typing import Union
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Welcome to the Resume App API!"}

@app.get("/resume/{name}")
def read_resume(name: str, format: Union[str, None] = None) -> dict[str, str]:
    if format == "pdf":
        return {"resume": f"PDF resume for {name}."}
    elif format == "docx":
        return {"resume": f"DOCX resume for {name}."}
    else:
        return {"resume": f"Text resume for {name}."}