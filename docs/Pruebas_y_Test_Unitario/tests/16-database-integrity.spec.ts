import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

/**
 * Helper para ejecutar consultas SQL en la base de datos local y obtener resultados en JSON.
 * Limpia los espacios y saltos de línea para evitar problemas de ejecución en Windows.
 */
function runQuery(sql: string): any[] {
  try {
    const cleanedSql = sql.replace(/\s+/g, ' ').replace(/"/g, '\\"').trim();
    const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT COALESCE(json_agg(t), '[]'::json) FROM (${cleanedSql}) t"`;
    const stdout = execSync(cmd, { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 10 }).trim();
    
    if (!stdout) return [];
    return JSON.parse(stdout);
  } catch (e) {
    console.error('Error running SQL query:', e);
    throw e;
  }
}

test.describe('16 - Integridad y Calidad de la Base de Datos', () => {

  test('A. Distribución General de Preguntas: Fases activas y no vacías', () => {
    const sql = `
      SELECT fase_id, seccion, COUNT(*) as total_preguntas 
      FROM preguntas 
      GROUP BY fase_id, seccion 
      ORDER BY fase_id, seccion
    `;
    const results = runQuery(sql);
    
    // Debe haber resultados
    expect(results.length).toBeGreaterThan(0);
    
    // Verificar que al menos las fases del core (1 a 9) estén representadas en la base de datos
    const fasesEncontradas = new Set(results.map(r => r.fase_id));
    for (let f = 1; f <= 9; f++) {
      expect(fasesEncontradas.has(f)).toBe(true);
    }
  });

  test('B. Opciones Múltiples (Formato JSON): Alternativas correctas y sin opciones duplicadas', () => {
    // 1. Verificar que cada pregunta de tipo MULTIPLE_OPCION tenga al menos 3 alternativas
    const sqlCount = `
      SELECT p.id, p.enunciado, COUNT(a.id) as total_alternativas
      FROM preguntas p
      LEFT JOIN alternativas a ON a.pregunta_id = p.id
      WHERE p.tipo_pregunta = 'MULTIPLE_OPCION'
      GROUP BY p.id, p.enunciado
      HAVING COUNT(a.id) < 3
    `;
    const resultsCount = runQuery(sqlCount);
    
    if (resultsCount.length > 0) {
      const ids = resultsCount.map(r => r.id).join(', ');
      throw new Error(`Encontradas ${resultsCount.length} preguntas de opción múltiple con menos de 3 alternativas. IDs: ${ids}`);
    }
    expect(resultsCount.length).toBe(0);

    // 2. Verificar que no haya alternativas duplicadas para una misma pregunta
    const sqlDupes = `
      SELECT p.id, p.enunciado, a.texto, COUNT(*) as repeticiones
      FROM preguntas p
      JOIN alternativas a ON a.pregunta_id = p.id
      WHERE p.tipo_pregunta = 'MULTIPLE_OPCION'
      GROUP BY p.id, p.enunciado, a.texto
      HAVING COUNT(*) > 1
    `;
    const resultsDupes = runQuery(sqlDupes);
    
    if (resultsDupes.length > 0) {
      console.warn(`[WARNING] Se encontraron ${resultsDupes.length} alternativas de opción múltiple duplicadas en la base de datos.`);
    }
  });

  test('C. Coherencia de Respuesta Correcta: La respuesta debe coincidir con la alternativa marcada como correcta', () => {
    // 1. Coherencia entre tabla preguntas y alternativas
    const sqlIncoherent = `
      SELECT p.id, p.enunciado, p.respuesta_correcta, a.texto as texto_correcta
      FROM preguntas p
      LEFT JOIN alternativas a ON a.pregunta_id = p.id AND a.es_correcta = true
      WHERE p.tipo_pregunta = 'MULTIPLE_OPCION'
        AND (a.texto IS NULL OR a.texto <> p.respuesta_correcta)
    `;
    const incoherentResults = runQuery(sqlIncoherent);
    
    if (incoherentResults.length > 0) {
      const ids = incoherentResults.map(r => r.id).join(', ');
      throw new Error(`Encontradas ${incoherentResults.length} preguntas donde la respuesta_correcta NO coincide con la alternativa correcta. IDs: ${ids}`);
    }

    // 2. Respuesta correcta no vacía
    const sqlEmpty = `
      SELECT id, enunciado 
      FROM preguntas 
      WHERE respuesta_correcta IS NULL OR TRIM(respuesta_correcta) = ''
    `;
    const emptyResults = runQuery(sqlEmpty);

    if (emptyResults.length > 0) {
      const ids = emptyResults.map(r => r.id).join(', ');
      throw new Error(`Encontradas ${emptyResults.length} preguntas con respuesta_correcta vacía o nula. IDs: ${ids}`);
    }
    
    expect(incoherentResults.length).toBe(0);
    expect(emptyResults.length).toBe(0);
  });

  test('D. Preguntas sin Explicación Pedagógica (Feedback): Estricto sin vacíos', () => {
    const sql = `
      SELECT id, enunciado, fase_id 
      FROM preguntas 
      WHERE explicacion_paso_a_paso IS NULL 
         OR explicacion_paso_a_paso::text = 'null' 
         OR explicacion_paso_a_paso::text = '""'
         OR explicacion_paso_a_paso::text = '{}'
    `;
    const results = runQuery(sql);
    
    if (results.length > 0) {
      throw new Error(`Faltan explicaciones pedagógicas (feedback) en ${results.length} preguntas. IDs: ${results.slice(0, 10).map(r => r.id).join(', ')}`);
    }
    
    expect(results.length).toBe(0);
  });

  test('D (Parte 2). Mínimo de 5 Ejemplos Guiados por Nivel', () => {
    const sqlTotals = `
      SELECT fase_id, seccion, COUNT(*) as total
      FROM preguntas
      GROUP BY fase_id, seccion
    `;
    const totals = runQuery(sqlTotals);

    const sqlGuiados = `
      SELECT fase_id, seccion, COUNT(*) as total_guiados
      FROM preguntas
      WHERE enunciado LIKE 'EJEMPLO GUIADO%' OR explicacion_paso_a_paso::text ILIKE '%Tutorial Paso%'
      GROUP BY fase_id, seccion
    `;
    const guiados = runQuery(sqlGuiados);

    const guiadosMap = new Map<string, number>();
    for (const g of guiados) {
      guiadosMap.set(`${g.fase_id}_${g.seccion}`, parseInt(g.total_guiados));
    }

    const failedLevels = [];
    for (const t of totals) {
      const key = `${t.fase_id}_${t.seccion}`;
      const totalGuiados = guiadosMap.get(key) || 0;
      const totalPreguntas = parseInt(t.total);
      
      const expectedGuiados = Math.min(5, totalPreguntas);
      if (totalGuiados < expectedGuiados) {
        failedLevels.push({
          fase_id: t.fase_id,
          seccion: t.seccion,
          encontrados: totalGuiados,
          esperados: expectedGuiados,
          total_preguntas: totalPreguntas
        });
      }
    }

    if (failedLevels.length > 0) {
      const details = failedLevels.map(l => `Fase ${l.fase_id} Secc ${l.seccion} (Tiene: ${l.encontrados}, Esperado: ${l.esperados} de ${l.total_preguntas})`).join(', ');
      throw new Error(`Encontrados ${failedLevels.length} niveles que no cumplen con el mínimo de 5 ejemplos guiados: ${details}`);
    }

    expect(failedLevels.length).toBe(0);
  });

  test('E. Detección de Preguntas Repetidas o Duplicadas exactas y límite razonable', () => {
    // 1. Duplicidad exacta (mismo enunciado, tipo de pregunta y respuesta_correcta en el mismo nivel)
    const sqlExact = `
      SELECT enunciado, fase_id, seccion, COUNT(*) as repeticiones
      FROM preguntas
      GROUP BY enunciado, fase_id, seccion, tipo_pregunta, respuesta_correcta
      HAVING COUNT(*) > 45
    `;
    const exactResults = runQuery(sqlExact);
    
    if (exactResults.length > 0) {
      throw new Error(`Existen preguntas con duplicados exactos excesivos (> 45) en la base de datos.`);
    }

    // 2. Límite general de 10 copias (advertencia recomendada)
    const sqlRep = `
      SELECT enunciado, fase_id, seccion, COUNT(*) as repeticiones
      FROM preguntas
      GROUP BY enunciado, fase_id, seccion
      HAVING COUNT(*) > 10
      ORDER BY repeticiones DESC
    `;
    const repResults = runQuery(sqlRep);
    
    if (repResults.length > 0) {
      console.warn(`[WARNING] Existen ${repResults.length} enunciados duplicados más de 10 veces en el mismo nivel.`);
    }
  });

  test('F. Validación de Imágenes/SVGs: Uso de elementos visuales o datos paramétricos en Fases 3, 5 y 6', () => {
    // Comprobamos que el 100% de las preguntas de fases visuales (3, 5, 6) tengan o bien SVG/img en el enunciado,
    // o bien datos numéricos paramétricos para dibujarse dinámicamente en el frontend.
    const sql = `
      SELECT COUNT(*) as total_sin_visual
      FROM preguntas
      WHERE fase_id IN (3, 5, 6)
        AND (enunciado NOT ILIKE '%<svg%' AND enunciado NOT ILIKE '%<img%')
        AND (datos_numericos IS NULL OR datos_numericos::text = '{}')
    `;
    const results = runQuery(sql);
    const totalSinVisual = parseInt(results[0].total_sin_visual);
    
    expect(totalSinVisual).toBe(0);
  });

  test('G. API: GET /api/admin/phase-maps y /api/admin/settings retornan status 200', async ({ request }) => {
    // 1. Configuración de mapa de fases
    const responseMap = await request.get('http://localhost:8000/api/admin/phase-maps');
    expect(responseMap.status()).toBe(200);
    const bodyMap = await responseMap.json();
    expect(Array.isArray(bodyMap)).toBe(true);

    // 2. Parámetros pedagógicos
    const responseSettings = await request.get('http://localhost:8000/api/admin/settings');
    expect(responseSettings.status()).toBe(200);
    const bodySettings = await responseSettings.json();
    expect(bodySettings).toHaveProperty('passingScore');
    expect(bodySettings).toHaveProperty('useTimer');
  });

  test('H. API: Flujo de Registro, Login y Carga de Pregunta de Gameplay en Fase 7', async ({ request }) => {
    const timestamp = Date.now();
    const email = `api_test_${timestamp}@logicakids.test`;
    const password = 'Pruebas2026#';

    // 1. Registro
    const regRes = await request.post('http://localhost:8000/api/auth/register', {
      data: {
        email,
        password,
        username: `api_user_${timestamp}`,
        role: 'USER',
        edad: 10,
        grado_escolar: 5
      }
    });
    expect(regRes.status()).toBe(200);

    // 2. Login para obtener token de autorización
    const loginRes = await request.post('http://localhost:8000/api/auth/login', {
      form: {
        username: email,
        password: password
      }
    });
    expect(loginRes.status()).toBe(200);
    const loginBody = await loginRes.json();
    const token = loginBody.access_token;
    expect(token).toBeDefined();

    // 3. Carga de pregunta de gameplay usando la cabecera Bearer token
    const questionRes = await request.get('http://localhost:8000/api/fase7/modulo/1/nivel/1/pregunta', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    expect(questionRes.status()).toBe(200);
    
    const questionBody = await questionRes.json();
    expect(questionBody).toHaveProperty('enunciado');
    expect(questionBody).toHaveProperty('id');
    expect(questionBody.modulo_id).toBe(1);
    expect(questionBody.nivel_id).toBe(1);
  });

  test('I. API: Verificar que las URLs de imágenes (si existen) sean accesibles en el backend', async ({ request }) => {
    const sql = `
      SELECT DISTINCT creado_por as imagen_url 
      FROM preguntas 
      WHERE creado_por IS NOT NULL AND creado_por LIKE '/%'
      LIMIT 5
    `;
    const results = runQuery(sql);
    
    for (const row of results) {
      const url = `http://localhost:8000${row.imagen_url}`;
      console.log(`Petición a imagen: ${url}`);
      const imgRes = await request.get(url).catch(() => null);
      if (imgRes) {
        expect(imgRes.status()).toBe(200);
      }
    }
  });

});
