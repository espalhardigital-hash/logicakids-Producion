const fs = require('fs');
const path = require('path');

const testsDir = 'D:/Antigravity/APP_Logica_Matematicas_kids/docs/Pruebas_y_Test_Unitario/tests';
const files = fs.readdirSync(testsDir).filter(f => f.endsWith('.spec.ts'));

files.forEach(file => {
  const filePath = path.join(testsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Remove duplicate loginAsTestUser blocks
  content = content.replace(/[ \t]*if\s*\(page\.url\(\)\.includes\('\/login'\)\)\s*\{[\s\S]*?await loginAsTestUser\(page\);[\s\S]*?\}\n?/g, '');

  // Remove duplicate registerDynamicTestUser in test() bodies
  // A bit hard to match reliably with regex without affecting beforeEach.
  // Instead, let's just find "const testUserEmail = await registerDynamicTestUser(page);\n    setPhaseForUser(testUserEmail, X);"
  // If it appears more than once, we keep the first one (in beforeEach usually).
  // Wait, some files have MULTIPLE test.describe blocks? No, only one test.describe usually.
  // Actually, we can just look for "    const testUserEmail = await registerDynamicTestUser(page);\n    setPhaseForUser(testUserEmail, \\d+);\n"
  // and replace it with empty string IF it is NOT inside a beforeEach.
  
  // A simpler way: we know beforeEach has it. We can just replace all instances, and then add it back to beforeEach!
  
  // Wait, let's just use string replacement on known lines.
  const lines = content.split('\n');
  let inBeforeEach = false;
  const newLines = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('test.beforeEach')) {
      inBeforeEach = true;
    }
    if (inBeforeEach && lines[i].includes('});')) {
      inBeforeEach = false;
    }

    if (lines[i].includes('registerDynamicTestUser') && !lines[i].includes('import')) {
      if (!inBeforeEach) {
        // Skip this line and the next one (setPhaseForUser)
        if (i + 1 < lines.length && lines[i+1].includes('setPhaseForUser')) {
          i++; // skip next line
        }
        continue;
      }
    }
    
    // Also remove any stray loginAsTestUser from imports
    if (lines[i].includes('import') && lines[i].includes('loginAsTestUser')) {
      lines[i] = lines[i].replace('loginAsTestUser, ', '').replace(', loginAsTestUser', '').replace('loginAsTestUser', '');
      if (lines[i].includes('import { }')) {
        continue; // skip empty imports
      }
    }
    
    newLines.push(lines[i]);
  }

  content = newLines.join('\n');
  fs.writeFileSync(filePath, content);
  console.log('Cleaned ' + file);
});
