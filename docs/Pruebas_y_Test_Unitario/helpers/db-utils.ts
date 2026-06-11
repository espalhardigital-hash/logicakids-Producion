import { execSync } from 'child_process';
import { TEST_USER } from './constants';

/**
 * Ejecuta una consulta SQL en la base de datos de test (PostgreSQL en Docker local).
 * @param query Consulta SQL a ejecutar
 */
export function execDbQuery(query: string) {
  try {
    execSync(`docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "${query}"`);
  } catch (e) {
    console.error(`❌ Error ejecutando query DB: ${query}`, e);
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
