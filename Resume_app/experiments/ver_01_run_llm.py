from app.llm import generate_text, generate_from_doc

print("Generating resume...")

with open("docs/sample.txt", "r") as file:
    sample_text = file.read()
output_doc = generate_from_doc(
    f"""Generate a professional resume based on the following information. 
    \n + {sample_text}""") 
print("Output received from document:")
print(output_doc)

print("Script finished")