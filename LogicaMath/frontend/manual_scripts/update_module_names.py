import os

base_path = r"D:\Antigravity\Apps_LogicaKids - Desarrollo\LogicaMath\frontend\components"

fase5_names = """const MODULE_NAMES: Record<number, string> = {
  1: 'Perímetro y Borde',
  2: 'Área en Malha',
  3: 'Figuras Compuestas',
  4: 'Conversión y Pantallas',
};"""

fase6_names = """const MODULE_NAMES: Record<number, string> = {
  1: 'Reconocimiento 3D',
  2: 'Patrones de Crecimiento',
  3: 'Cubos Unitarios',
  4: 'Medidas Físicas',
};"""

def update_file(filepath, replacement_text):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Simple replace
    import re
    content = re.sub(r"const MODULE_NAMES: Record<number, string> = \{.*?\};", replacement_text, content, flags=re.DOTALL)
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

# Fase 5
update_file(os.path.join(base_path, "fase5", "WelcomeScreenPhase5.tsx"), fase5_names)
update_file(os.path.join(base_path, "fase5", "Fase5GameScreen.tsx"), fase5_names)

# Fase 6
update_file(os.path.join(base_path, "fase6", "WelcomeScreenPhase6.tsx"), fase6_names)
update_file(os.path.join(base_path, "fase6", "Fase6GameScreen.tsx"), fase6_names)

print("Updated module names.")
