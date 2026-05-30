import os

def search_files(directory, queries):
    matches = []
    for root, dirs, files in os.walk(directory):
        if "node_modules" in dirs:
            dirs.remove("node_modules")
        for file in files:
            if file.endswith((".ts", ".tsx", ".js", ".jsx", ".json")):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                        for line_num, line in enumerate(f, 1):
                            for query in queries:
                                if query in line:
                                    matches.append((filepath, line_num, query, line.strip()))
                except Exception as e:
                    pass
    return matches

def main():
    queries = ["unlocked_level", "unlockedLevel", "fase_actual_id"]
    print("Searching frontend for queries...")
    matches = search_files("D:\\Antigravity\\Apps_LogicaKids - Desarrollo\\LogicaMath\\frontend", queries)
    for filepath, line_num, query, line in matches:
        print(f"{filepath}:{line_num} ({query}): {line}")

if __name__ == "__main__":
    main()
