import os
import shutil

src_dir = r"D:\Antigravity\Apps_LogicaKids - Desarrollo\LogicaMath\frontend\components\fase2"
dest_dir_5 = r"D:\Antigravity\Apps_LogicaKids - Desarrollo\LogicaMath\frontend\components\fase5"
dest_dir_6 = r"D:\Antigravity\Apps_LogicaKids - Desarrollo\LogicaMath\frontend\components\fase6"

def duplicate_and_replace(src, dest, fase_num):
    if not os.path.exists(dest):
        os.makedirs(dest)
    
    for filename in os.listdir(src):
        if not os.path.isfile(os.path.join(src, filename)):
            continue
            
        new_filename = filename.replace("2", str(fase_num))
        new_filepath = os.path.join(dest, new_filename)
        
        with open(os.path.join(src, filename), "r", encoding="utf-8") as f:
            content = f.read()
            
        # Standard replacements
        content = content.replace("Fase2", f"Fase{fase_num}")
        content = content.replace("fase2", f"fase{fase_num}")
        content = content.replace("Fase 2", f"Fase {fase_num}")
        content = content.replace("f2-", f"f{fase_num}-")
        
        # We'll write to the new file
        with open(new_filepath, "w", encoding="utf-8") as f:
            f.write(content)

duplicate_and_replace(src_dir, dest_dir_5, 5)
duplicate_and_replace(src_dir, dest_dir_6, 6)

print("Generated frontend phase 5 and 6 files successfully!")
