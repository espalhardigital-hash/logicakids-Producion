"""
Script de test para verificar los endpoints de Fase 9 Simulados.
Ejecutar desde dentro del contenedor: python -m scripts.test_fase9_api
"""
import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://localhost:8000"

def login():
    data = urllib.parse.urlencode({
        "username": "admin@logicakids.pro",
        "password": "admin123"
    }).encode()
    req = urllib.request.Request(
        f"{BASE_URL}/api/auth/login",
        data=data,
        method="POST"
    )
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    with urllib.request.urlopen(req) as r:
        body = json.load(r)
        return body["access_token"]


def get(path, token):
    req = urllib.request.Request(f"{BASE_URL}{path}")
    req.add_header("Authorization", f"Bearer {token}")
    with urllib.request.urlopen(req) as r:
        return json.load(r)


def post(path, token, payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(f"{BASE_URL}{path}", data=data, method="POST")
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req) as r:
        return json.load(r)


def main():
    print("=" * 60)
    print("TEST ENDPOINTS FASE 9 — Simulacros Pedro II")
    print("=" * 60)

    # 1. Login
    print("\n[1] Login admin...")
    token = login()
    print(f"    OK — token: {token[:40]}...")

    # 2. GET /progresso
    print("\n[2] GET /api/fases/9/simulados/progresso ...")
    prog = get("/api/fases/9/simulados/progresso", token)
    sims = prog["simulacros"]
    mods = prog["modulos"]
    print(f"    OK — {len(sims)} simulacros, {len(mods)} módulos")
    print(f"    Simulacro 1: {sims[0]['nome']} | estado={sims[0]['estado']}")
    print(f"    Simulacro 20: {sims[19]['nome']} | estado={sims[19]['estado']}")
    print(f"    Módulo 1: {mods[0]['nome']} — {mods[0]['aprobados']}/{mods[0]['total_simulacros']}")

    # 3. POST /iniciar simulacro 1
    print("\n[3] POST /api/fases/9/simulados/iniciar (simulacro_numero=1) ...")
    inicio = post("/api/fases/9/simulados/iniciar", token, {"simulacro_numero": 1})
    session_id = inicio["session_id"]
    preguntas = inicio["preguntas"]
    print(f"    OK — session_id: {session_id[:16]}...")
    print(f"    Preguntas: {len(preguntas)}")
    print(f"    Tiempo total: {inicio['tiempo_total_segundos']}s")
    print(f"    Pregunta 1 ID: {preguntas[0]['id']}")
    print(f"    Pregunta 1: {preguntas[0]['enunciado'][:60]}...")

    # Verificar que NO viene alternativa_correta en las preguntas
    for p in preguntas:
        assert "alternativa_correta" not in p, "ERROR: gabarito expuesto antes de entregar!"
    print("    SEGURIDAD OK — gabarito no expuesto en preguntas")

    # 4. POST /{session_id}/save_progress
    print("\n[4] POST /save_progress ...")
    respuestas = {preguntas[0]["id"]: "A", preguntas[1]["id"]: "B"}
    save = post(f"/api/fases/9/simulados/{session_id}/save_progress", token, {
        "respuestas": respuestas,
        "marcadores_revision": [preguntas[2]["id"]],
        "tiempo_restante_segundos": 1100
    })
    print(f"    OK — status: {save['status']}")

    # 5. POST /{session_id}/entregar
    print("\n[5] POST /entregar ...")
    # Responder todas las preguntas con "A" para simular entrega
    todas_respuestas = {p["id"]: "A" for p in preguntas}
    resultado = post(f"/api/fases/9/simulados/{session_id}/entregar", token, {
        "respuestas": todas_respuestas,
        "tiempo_restante_segundos": 900
    })
    print(f"    OK — puntaje: {resultado['puntaje']}/{resultado['total']}")
    print(f"    Porcentaje: {resultado['porcentaje']}%")
    print(f"    Aprobado: {resultado['aprobado']}")
    print(f"    Simulacro: {resultado['simulacro_numero']}")
    print(f"    Proximo: {resultado['proximo_simulacro']}")
    print(f"    Detalles: {len(resultado['detalles'])} preguntas con resolução")

    # Verificar resolução incluida
    d0 = resultado["detalles"][0]
    print(f"    Detalle Q1: correta={d0['resposta_correta']}, alumno={d0['resposta_alumno']}, resolucao_pasos={len(d0['resolucao'])}")

    print("\n" + "=" * 60)
    print("TODOS LOS TESTS PASARON ✅")
    print("=" * 60)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
