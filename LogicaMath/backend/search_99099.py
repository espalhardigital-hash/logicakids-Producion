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
    print("Searching for '99099'...")
    matches = search_files("D:\\Antigravity\\Apps_LogicaKids - Desarrollo", "99099")
    for filepath, line_num, line in matches:
        print(f"{filepath}:{line_num}: {line}")

if __name__ == "__main__":
    main()
