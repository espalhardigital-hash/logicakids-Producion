import sqlite3

def main():
    conn = sqlite3.connect("local_verify.db")
    cursor = conn.cursor()
    
    # Let's inspect all configs in ConfiguracionProgreso
    cursor.execute("""
        SELECT id, fase_id, seccion, operacion, activo 
        FROM configuracion_progreso
        WHERE seccion > 0 AND activo = 1
        ORDER BY fase_id, seccion, operacion
    """)
    configs = cursor.fetchall()
    
    print(f"Total active configs: {len(configs)}")
    fase_map = {}
    for c in configs:
        f_id = c[1]
        if f_id not in fase_map:
            fase_map[f_id] = []
        fase_map[f_id].append(c)
        
    for f_id, items in sorted(fase_map.items()):
        print(f"\nPhase {f_id} has {len(items)} configurations:")
        for item in items:
            print(f"  ID: {item[0]} | Fase: {item[1]} | Seccion: {item[2]} | Operacion: {item[3]} | Activo: {item[4]}")
            
    conn.close()

if __name__ == "__main__":
    main()
