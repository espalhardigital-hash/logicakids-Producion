const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuración de la ejecución
const TEST_PASSWORD_HASH_SOURCE = 'prueba@gmail.com';
const DYNAMIC_EMAIL = `stress_${Date.now()}@gmail.com`;

console.log(`\n🚀 [INICIO] Preparando Suite de Pruebas Intensivas (Stress Test)`);
console.log(`📧 Generando usuario dinámico: ${DYNAMIC_EMAIL}`);

try {
  // 1. Crear el usuario a través de la API (para asegurar que Node.js genere el ID, username y el token correctamente)
  console.log(`⏳ Registrando usuario a través de la API...`);
  const registerCmd = `curl -s -X POST http://localhost:8000/api/auth/register -H "Content-Type: application/json" -d "{\\"username\\":\\"StressUser\\",\\"email\\":\\"${DYNAMIC_EMAIL}\\",\\"password\\":\\"pruebas\\"}"`;
  const response = execSync(registerCmd).toString();
  console.log(`✅ Registro API: ${response}`);

  // Asegurarnos de que el alumno asociado está en Nivel 1 y Fase 1 (usualmente la API ya lo hace, pero lo forzamos)
  const sqlInit = `
    UPDATE alumnos SET fase_actual_id = 1, nivel_actual = 1 
    WHERE user_id = (SELECT id FROM users WHERE email='${DYNAMIC_EMAIL}');
  `;
  execSync(`docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "${sqlInit}"`);
  console.log(`✅ Usuario ${DYNAMIC_EMAIL} inicializado en Fase 1.`);

  // 2. Definir el orden de las pruebas a ejecutar
  const testsToRun = [
    path.join(__dirname, '03-gameplay-fase1.spec.ts'),
    path.join(__dirname, '06-gameplay-fase2.spec.ts'),
    path.join(__dirname, '07-gameplay-fase3.spec.ts'),
    path.join(__dirname, '08-gameplay-fase4.spec.ts'),
    path.join(__dirname, '09-gameplay-fase5.spec.ts'),
    path.join(__dirname, '10-gameplay-fase6.spec.ts'),
    path.join(__dirname, '11-gameplay-fase7.spec.ts'),
    path.join(__dirname, '12-gameplay-fase8.spec.ts'),
    path.join(__dirname, '13-gameplay-fase9.spec.ts'),
    path.join(__dirname, '14-admin-panel.spec.ts') // Validamos admin al final
  ];

  console.log(`\n▶️ Iniciando Playwright con ${testsToRun.length} suites de prueba...`);
  
  // 3. Ejecutar Playwright en un proceso hijo para mantener la consola viva
  const testProcess = spawn('npx', ['playwright', 'test', ...testsToRun], {
    env: {
      ...process.env,
      TEST_EMAIL: DYNAMIC_EMAIL
    },
    stdio: 'inherit',
    shell: true
  });

  testProcess.on('close', (code) => {
    console.log(`\n🏁 [FIN] Playwright terminó con código de salida: ${code}`);
    
    // 4. Limpieza (Teardown)
    console.log(`🧹 Limpiando usuario de prueba de la base de datos...`);
    try {
      const sqlDeleteUser = `DELETE FROM users WHERE email = '${DYNAMIC_EMAIL}';`;
      execSync(`docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "${sqlDeleteUser}"`);
      console.log(`✅ Usuario ${DYNAMIC_EMAIL} eliminado exitosamente.`);
    } catch (e) {
      console.error(`⚠️ Error al eliminar el usuario de prueba:`, e.message);
    }
  });

} catch (err) {
  console.error(`\n❌ Error fatal durante la preparación de la prueba intensiva:`);
  console.error(err.message);
}
