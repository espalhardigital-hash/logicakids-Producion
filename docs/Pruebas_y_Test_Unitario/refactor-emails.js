const fs = require('fs');
const path = require('path');

const testsDir = path.join(__dirname, 'tests');

function refactorTests() {
  const files = fs.readdirSync(testsDir).filter(f => f.endsWith('.spec.ts'));
  
  let modifiedCount = 0;

  for (const file of files) {
    const filePath = path.join(testsDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Replace literal 'prueba@gmail.com' inside execSync backticks with env variable
    // We look for 'prueba@gmail.com'
    if (content.includes("'prueba@gmail.com'")) {
      content = content.replace(/'prueba@gmail\.com'/g, `'${process.env.TEST_EMAIL || 'prueba@gmail.com'}'`);
      // Since it's inside a backtick string, using ${process.env.TEST_EMAIL || 'prueba@gmail.com'} directly
      // Wait, if it's already inside a template literal in TS, we can inject JS variables:
      content = content.replace(/\$\{process\.env\.TEST_EMAIL \|\| 'prueba@gmail\.com'\}/g, 'prueba@gmail.com'); // reset first if run multiple times
      content = content.replace(/'prueba@gmail\.com'/g, `'${"${process.env.TEST_EMAIL || 'prueba@gmail.com'}"}'`);
      
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Refactored: ${file}`);
      modifiedCount++;
    }
  }

  console.log(`\nRefactoring complete. ${modifiedCount} files updated to support dynamic TEST_EMAIL.`);
}

refactorTests();
