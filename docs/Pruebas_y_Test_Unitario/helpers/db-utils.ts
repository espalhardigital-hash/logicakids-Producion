import { execSync } from 'child_process';
import { TEST_USER } from './constants';

/**
 * Ejecuta una consulta SQL en la base de datos de test (PostgreSQL en Docker local).
 * @param query Consulta SQL a ejecutar
 */
export function execDbQuery(query: string) {
  try {
    execSync(`docker exec -i logicakids_local_db psql -U logicakids_local_user -d logicakids_local`, { input: query });
  } catch (e) {
    console.error(`❌ Error ejecutando query DB:\n${query}`, e);
    throw e;
  }
}

/**
 * Sube los privilegios de un usuario a ADMIN y opcionalmente altera su fase actual.
 * Esto es útil para bypassear bloqueos de la UI en tests E2E.
 * @param email Email del usuario de test. Por defecto usa TEST_USER.email.
 * @param fase_actual_id ID de la fase a la que se desea saltar.
 */
export function setAdminRoleAndPhase(email: string = TEST_USER.email, fase_actual_id?: number) {
  const queryAdmin = `UPDATE users SET role = 'ADMIN' WHERE email = '${email}';`;
  execDbQuery(queryAdmin);

  if (fase_actual_id !== undefined) {
    const queryPhase = `UPDATE alumnos SET fase_actual_id = ${fase_actual_id} WHERE user_id = (SELECT id FROM users WHERE email = '${email}');`;
    execDbQuery(queryPhase);
  }
  console.log(`✅ Test user (${email}) set to role ADMIN${fase_actual_id ? ` and phase ${fase_actual_id}` : ''}.`);
}

/**
 * Restaura el usuario a rol USER.
 * @param email Email del usuario de test. Por defecto usa TEST_USER.email.
 */
export function restoreUserRole(email: string = TEST_USER.email) {
  const queryUser = `UPDATE users SET role = 'USER' WHERE email = '${email}';`;
  execDbQuery(queryUser);
  console.log(`✅ Test user (${email}) role restored to USER.`);
}

/**
 * Borra todos los intentos, pasos, y progreso de maestría del usuario de test.
 * @param email Email del usuario de test. Por defecto usa TEST_USER.email.
 */
export function clearTestUserProgress(email: string = TEST_USER.email) {
  const queries = [
    `DELETE FROM intento_pasos WHERE intento_pregunta_id IN (SELECT id FROM intento_preguntas WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}')));`,
    `DELETE FROM intento_preguntas WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}'));`,
    `DELETE FROM intentos WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}'));`,
    `DELETE FROM progreso_maestria WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}'));`
  ];
  for (const q of queries) {
    execDbQuery(q);
  }
  console.log(`🧹 Test user database progress successfully cleared for ${email}.`);
}

/**
 * Actualiza la fase actual de un usuario sin alterar su rol.
 * Esto simula que el usuario aprobó las fases previas y puede entrar a la fase indicada de forma natural.
 * @param email Email del usuario
 * @param targetFase Fase a la que se desea saltar
 */
export function setPhaseForUser(email: string, targetFase: number) {
  const queryPhase = `UPDATE alumnos SET fase_actual_id = ${targetFase} WHERE user_id = (SELECT id FROM users WHERE email = '${email}');`;
  execDbQuery(queryPhase);
  console.log(`✅ Progress injected: Test user (${email}) set to phase ${targetFase}.`);
}

/**
 * Aprueba el progreso de maestría para una sección y operación dada de forma directa.
 */
export function approveProgresoMaestria(email: string, faseId: number, seccion: number, operacion: string) {
  const upperOp = operacion.toUpperCase();
  const query = `
    INSERT INTO progreso_maestria (alumno_id, fase_id, seccion, operacion, estado, aciertos_acumulados, intentos_totales, porcentaje_actual, aprobado_por_admin, fecha_inicio, fecha_aprobacion, ultima_actualizacion)
    VALUES (
      (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}') LIMIT 1),
      ${faseId},
      ${seccion},
      '${upperOp}',
      'APROBADO',
      15,
      15,
      100,
      false,
      NOW(),
      NOW(),
      NOW()
    )
    ON CONFLICT (alumno_id, fase_id, seccion, operacion) 
    DO UPDATE SET 
      estado = 'APROBADO', 
      porcentaje_actual = 100, 
      aciertos_acumulados = 15, 
      intentos_totales = 15,
      fecha_aprobacion = NOW(),
      ultima_actualizacion = NOW();
  `;
  execDbQuery(query);
  console.log(`✅ ProgresoMaestria aprobado inyectado para ${email}: Fase ${faseId}, Sección ${seccion}, Operación ${upperOp}`);
}

/**
 * Desbloquea todos los módulos anteriores al moduloId especificado aprobando sus niveles y desafíos.
 */
export function unlockAllUpToModule(email: string, faseId: number, moduloId: number) {
  if (faseId === 1) {
    const categories = ['addition', 'subtraction', 'multiplication', 'division', 'challenge'];
    let levels: Record<string, number> = { addition: 1, subtraction: 1, multiplication: 1, division: 1, challenge: 1 };
    for (let i = 1; i < moduloId; i++) {
        levels[categories[i-1]] = 5; 
    }
    const query = `
      UPDATE users 
      SET settings = jsonb_set(
        COALESCE(settings, '{}'::jsonb), 
        '{unlockedLevels}', 
        '${JSON.stringify(levels)}'::jsonb
      )
      WHERE email = '${email}';
    `;
    execDbQuery(query);
    console.log(`✅ Fase 1 unloked up to module ${moduloId} for ${email}`);
    return;
  }

  try {
    const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT seccion, operacion FROM configuracion_progreso WHERE fase_id = ${faseId} AND activo = true"`;
    const lines = execSync(cmd).toString().trim().split('\n');
    for (const line of lines) {
      if (!line) continue;
      const [seccionStr, operacion] = line.split('|');
      const seccion = parseInt(seccionStr, 10);
      
      let mId = 0;
      if (seccion >= 1000) {
        mId = Math.floor(seccion / 1000);
      } else {
        mId = Math.floor(seccion / 100);
      }
      
      // Ignore mastery challenge (e.g. 99099)
      if (mId === 99) continue;

      if (mId < moduloId) {
        approveProgresoMaestria(email, faseId, seccion, operacion);
      }
    }
  } catch (e) {
    console.error(`❌ Failed to dynamically unlock all up to module ${moduloId} for phase ${faseId}:`, e);
  }
}

/**
 * Helper to query the local database for correct answers.
 */
export function getCorrectAnswer(questionId: number): string {
  try {
    const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT respuesta_correcta FROM preguntas WHERE id = ${questionId}"`;
    return execSync(cmd).toString().trim();
  } catch (e) {
    console.error(`Error querying answer for question ${questionId}:`, e);
    return '';
  }
}

/**
 * Helper to query the local database for Chained Steps answers (Module 4).
 */
export function getChainedStepAnswer(questionId: number, stepNumber: number): string {
  try {
    const query = `SELECT datos_numericos->'pasos'->${stepNumber - 1}->>'respuesta_correcta' FROM preguntas WHERE id = ${questionId}`;
    const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "${query}"`;
    return execSync(cmd).toString().trim();
  } catch (e) {
    console.error(`Error querying chained step ${stepNumber} for question ${questionId}:`, e);
    return '';
  }
}

export function getQuestionType(questionId: number): string {
  try {
    const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT tipo_pregunta FROM preguntas WHERE id = ${questionId}"`;
    return execSync(cmd).toString().trim();
  } catch (e) {
    console.error(`Error querying question type for ${questionId}:`, e);
    return '';
  }
}

export function getCorrectAlternative(questionId: number): string {
  try {
    const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT texto FROM alternativas WHERE pregunta_id = ${questionId} AND es_correcta = true LIMIT 1"`;
    return execSync(cmd).toString().trim();
  } catch (e) {
    console.error(`Error querying correct alternative for ${questionId}:`, e);
    return '';
  }
}

export function getIncorrectAlternative(questionId: number): string {
  try {
    const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT texto FROM alternativas WHERE pregunta_id = ${questionId} AND es_correcta = false LIMIT 1"`;
    return execSync(cmd).toString().trim();
  } catch (e) {
    console.error(`Error querying incorrect alternative for ${questionId}:`, e);
    return '';
  }
}
