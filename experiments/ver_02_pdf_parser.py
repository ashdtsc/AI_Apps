import pypdf
import os
from app.llm import generate_text

#file='Resume_app/docs/Ashish Mishra_Oct_2025.pdf'

# location agnostic code
base_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(base_dir, '..', 'docs', 'Ashish Mishra_Oct_2025.pdf')

# create reader
reader = pypdf.PdfReader(file_path)
number_of_pages = len(reader.pages)
print(f"Number of pages: {number_of_pages}")

# extract text from all pages
all_text = ""
for page in reader.pages:
    all_text += page.extract_text() + "\n"

# generate json format from text
json_output = generate_text(
    prompt=f""" Extract the following resume text into a structured JSON format with fields: 
    Name, Contact Information, Summary, Skills, Experience, Education. Text: {all_text}
    """
)
print(json_output)

#%%
# save json output to file
output_file_path = os.path.join(base_dir, '..', 'docs', 'output', 'Ashish_Mishra_Oct_2025.json')
with open(output_file_path, 'w') as json_file:
    json_file.write(json_output)

# %%
