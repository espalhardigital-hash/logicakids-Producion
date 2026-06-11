const fs = require('fs');
const path = require('path');

const testsDir = path.join(__dirname, '../tests');
const files = fs.readdirSync(testsDir).filter(f => f.endsWith('.spec.ts'));

for (const file of files) {
  const filePath = path.join(testsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip files that don't need this specific refactor
  if (!content.includes('function getCorrectAnswer')) continue;

  console.log('Refactoring ' + file);

  // 1. Remove duplicated functions using Regex
  content = content.replace(/\/\*\*\s*\n\s*\* Helper to query the local database for correct answers\.[\s\S]*?function getCorrectAnswer[\s\S]*?return '';\s*\n\s*}\s*\n\s*}/g, '');
  content = content.replace(/\/\*\*\s*\n\s*\* Clean up all attempts and progress for the test user to avoid state leakage\.[\s\S]*?function clearTestUserProgress[\s\S]*?}\s*\n\s*}/g, '');
  content = content.replace(/\/\*\*\s*\n\s*\* Dynamically answers a question correctly based on database queries\.[\s\S]*?async function submitCorrectAnswer[\s\S]*?}\s*\n\s*}/g, '');
  content = content.replace(/\/\*\*\s*\n\s*\* Dynamically answers a question incorrectly based on database queries\.[\s\S]*?async function failCurrentQuestion[\s\S]*?}\s*\n\s*}/g, '');

  // For Chained steps
  content = content.replace(/\/\*\*\s*\n\s*\* Helper to query the local database for Chained Steps answers \(Module 4\)\.[\s\S]*?function getChainedStepAnswer[\s\S]*?}\s*\n\s*}/g, '');

  // A more robust regex removal for any left over functions
  content = content.replace(/function getCorrectAnswer\(.*?\).*?catch.*?}\s*\n}/s, '');
  content = content.replace(/function clearTestUserProgress\(.*?\).*?catch.*?}\s*\n}/s, '');
  content = content.replace(/async function submitCorrectAnswer\(.*?\).*?first\(\)\.click\(\);\s*\n}/s, '');
  content = content.replace(/async function failCurrentQuestion\(.*?\).*?first\(\)\.click\(\);\s*\n}/s, '');
  content = content.replace(/function getChainedStepAnswer\(.*?\).*?catch.*?}\s*\n}/s, '');

  // Replace DB executions in hooks
  content = content.replace(/execSync\([\s\S]*?UPDATE users SET role = 'ADMIN'[\s\S]*?\);/g, '');
  content = content.replace(/execSync\([\s\S]*?UPDATE alumnos SET fase_actual_id =[\s\S]*?\);/g, '');
  content = content.replace(/execSync\([\s\S]*?UPDATE users SET role = 'USER'[\s\S]*?\);/g, '');

  // Use new utils
  content = content.replace(/submitCorrectAnswer\(/g, 'submitCorrectAnswerDatabase(');
  content = content.replace(/failCurrentQuestion\(/g, 'failCurrentQuestionDatabase(');

  // Add imports
  if (!content.includes('import { setAdminRoleAndPhase')) {
    content = content.replace(/import \{ ensureAuthenticated \} from '\.\.\/helpers\/auth';/, `import { ensureAuthenticated } from '../helpers/auth';\nimport { setAdminRoleAndPhase, restoreUserRole, clearTestUserProgress, getChainedStepAnswer } from '../helpers/db-utils';\nimport { submitCorrectAnswerDatabase, failCurrentQuestionDatabase } from '../helpers/gameplay-utils';`);
  }

  // Remove child_process
  content = content.replace(/import \{ execSync \} from 'child_process';\n/g, '');

  fs.writeFileSync(filePath, content, 'utf8');
}
console.log('Done refactoring spec files!');
