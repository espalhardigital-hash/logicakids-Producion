import os

def search_files(directory, query):
    matches = []
    for root, dirs, files in os.walk(directory):
        if "venv" in root or ".git" in root or "node_modules" in root:
            continue
        for file in files:
            if file.endswith((".py", ".ts", ".tsx", ".js", ".json")):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                        for line_num, line in enumerate(f, 1):
                            if query in line:
                                matches.append((filepath, line_num, line.strip()))
                except Exception as e:
                    pass
    return matches

def main():
    print("Searching for 'Ciclos y Agrupaciones Máximas'...")
    matches = search_files("D:\\Antigravity\\Apps_LogicaKids - Desarrollo", "Ciclos y Agrupaciones Máximas")
    for filepath, line_num, line in matches:
        print(f"{filepath}:{line_num}: {line}")
        
    print("\nSearching for 'Visualización de Saltos'...")
    matches2 = search_files("D:\\Antigravity\\Apps_LogicaKids - Desarrollo", "Visualización de Saltos")
    for filepath, line_num, line in matches2:
        print(f"{filepath}:{line_num}: {line}")

if __name__ == "__main__":
    main()
