const fs = require('fs');
const path = require('path');

const testsDir = 'D:/Antigravity/APP_Logica_Matematicas_kids/docs/Pruebas_y_Test_Unitario/tests';
const files = fs.readdirSync(testsDir).filter(f => f.endsWith('.spec.ts') && !f.includes('11') && !f.includes('13') && !f.includes('14') && !f.includes('06'));

files.forEach(file => {
  const filePath = path.join(testsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Replace ensureAuthenticated import
  content = content.replace(/import \{.*?ensureAuthenticated.*?\} from '\.\.\/helpers\/auth';/g, 
    "import { registerDynamicTestUser } from '../helpers/auth';\nimport { setPhaseForUser } from '../helpers/db-utils';");

  // Replace ensureAuthenticated call in beforeEach
  const phaseMatch = file.match(/fase(\d+)/);
  const phase = phaseMatch ? parseInt(phaseMatch[1], 10) : 1;

  content = content.replace(/await ensureAuthenticated\(page\);/g, 
    `const testUserEmail = await registerDynamicTestUser(page);\n    setPhaseForUser(testUserEmail, ${phase});`);

  fs.writeFileSync(filePath, content);
  console.log('Updated ' + file);
});
