import sys
try:
    import PyPDF2
except ImportError:
    import os
    os.system("pip install PyPDF2")
    import PyPDF2

def analyze_pdf(filepath):
    try:
        with open(filepath, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            num_pages = len(reader.pages)
            print(f"Total pages: {num_pages}")
            
            text_sample = ""
            for i in range(min(5, num_pages)):
                page = reader.pages[i]
                text_sample += page.extract_text() + "\n--- PAGE BREAK ---\n"
                
            print("\nSample Text (First 5 pages):")
            print(text_sample)
            
    except Exception as e:
        print(f"Error reading PDF: {e}")

if __name__ == "__main__":
    analyze_pdf("/app/Matematica_Compilado_Todos.pdf")
