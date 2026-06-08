# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 01-login.spec.ts >> 01 - Flujo de Autenticación >> La interfaz de login se renderiza completamente
- Location: tests\01-login.spec.ts:16:7

# Error details

```
Error: Errores en consola:
  [1] Failed to load resource: net::ERR_EMPTY_RESPONSE (http://localhost:8000/api/admin/settings)
  [2] Error fetching admin settings: TypeError: Failed to fetch
    at We (http://localhost:3000/assets/index-DkGZ_79z.js:615:2899)
    at async Qg (http://localhost:3000/assets/index-DkGZ_79z.js:615:8052)
    at async q (http://localhost:3000/assets/index-DkGZ_79z.js:736:17155)
    at async http://localhost:3000/assets/index-DkGZ_79z.js:736:17897 (http://localhost:3000/assets/index-DkGZ_79z.js)
  [3] Failed to load resource: net::ERR_EMPTY_RESPONSE (http://localhost:8000/api/admin/settings)
  [4] Error fetching admin settings: TypeError: Failed to fetch
    at We (http://localhost:3000/assets/index-DkGZ_79z.js:615:2899)
    at async Qg (http://localhost:3000/assets/index-DkGZ_79z.js:615:8052)
    at async q (http://localhost:3000/assets/index-DkGZ_79z.js:736:17155)
    at async http://localhost:3000/assets/index-DkGZ_79z.js:736:17897 (http://localhost:3000/assets/index-DkGZ_79z.js)

expect(received).toBe(expected) // Object.is equality

Expected: false
Received: true
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e6]:
    - generic [ref=e7]:
      - heading "Logica Kids" [level=1] [ref=e8]
      - paragraph [ref=e9]: Domina las matemáticas jugando
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]:
          - img [ref=e13]
          - textbox "Correo Electrónico" [ref=e16]
        - generic [ref=e17]:
          - img [ref=e18]
          - textbox "Contraseña" [ref=e21]
          - button [ref=e22]:
            - img [ref=e23]
        - button "¿Olvidaste tu contraseña?" [ref=e27]
        - button "Entrar" [ref=e28]:
          - text: Entrar
          - img [ref=e29]
      - generic [ref=e31]:
        - paragraph [ref=e32]:
          - text: ¿No tienes cuenta?
          - button "Regístrate" [ref=e33]
        - generic [ref=e36]: O bien
        - button "Continuar como Invitado" [ref=e38]
  - button "Alternar Tema Claro/Oscuro" [ref=e39] [cursor=pointer]:
    - img [ref=e41]
```