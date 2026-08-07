import fs from 'fs';
import path from 'path';

// Parse .env manually
const envPath = path.resolve(process.cwd(), '.env');
const envFile = fs.readFileSync(envPath, 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#]+?)=(.+)$/);
  if (match) {
    process.env[match[1].trim()] = match[2].trim();
  }
});

async function run() {
  console.log("Starting DB Seeder...");
  // Dynamic import ensures process.env is set BEFORE the module is evaluated
  const { seedDatabaseAction } = await import('./lib/actions/seed-actions');
  const result = await seedDatabaseAction();
  console.log(result);
}

run();
