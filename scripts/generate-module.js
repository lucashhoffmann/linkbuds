import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const command = args[0];
const rawName = args[1];

const helpText = `
Usage:
  pnpm g module <name>

Examples:
  pnpm g module user
  pnpm g module billing-report
`.trim();

if (!command || command === '-h' || command === '--help') {
  console.log(helpText);
  process.exit(0);
}

if (command !== 'module') {
  console.error(`Unknown command: ${command}`);
  console.error(helpText);
  process.exit(1);
}

if (!rawName) {
  console.error('Missing module name.');
  console.error(helpText);
  process.exit(1);
}

const toWords = (value) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

const toKebabCase = (value) =>
  toWords(value)
    .map((w) => w.toLowerCase())
    .join('-');

const toPascalCase = (value) =>
  toWords(value)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');

const kebabName = toKebabCase(rawName);
const pascalName = toPascalCase(rawName);

if (!kebabName) {
  console.error('Invalid module name.');
  process.exit(1);
}

const rootDir = path.resolve(__dirname, '..');
const modulesDir = path.join(rootDir, 'src', 'app', 'modules');
const moduleDir = path.join(modulesDir, kebabName);

if (fs.existsSync(moduleDir)) {
  console.error(`Module already exists at ${moduleDir}`);
  process.exit(1);
}

const dirsToCreate = [
  moduleDir,
  path.join(moduleDir, 'keys'),
  path.join(moduleDir, 'service'),
  path.join(moduleDir, 'types'),
  path.join(moduleDir, 'use-cases'),
];

dirsToCreate.forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

// Template contents
const keysSource = `const ${pascalName}MutationKeys = {} as const;

const ${pascalName}QueryKeys = {} as const;

export { ${pascalName}MutationKeys, ${pascalName}QueryKeys };
`;

const serviceSource = `class ${pascalName}Service {}

export default new ${pascalName}Service();
`;

const typesSource = `export {};
`;

const useCasesIndexSource = `export {};
`;

// Write files
fs.writeFileSync(
  path.join(moduleDir, 'keys', `${kebabName}.keys.ts`),
  keysSource,
  'utf8',
);
fs.writeFileSync(
  path.join(moduleDir, 'service', `${kebabName}.service.ts`),
  serviceSource,
  'utf8',
);
fs.writeFileSync(
  path.join(moduleDir, 'types', `${kebabName}.types.ts`),
  typesSource,
  'utf8',
);
fs.writeFileSync(
  path.join(moduleDir, 'use-cases', 'index.ts'),
  useCasesIndexSource,
  'utf8',
);

// No barrels: docs/pattern.md forbids `export *`; import from the file itself.

console.log(`Module created: ${moduleDir}`);
