const { execSync, spawn } = require('child_process');
const fs = require('fs');

console.log('====================================================');
console.log('🚀 [PrepForge] Starting Production Container...');
console.log('====================================================');

const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl) {
  console.log('[PrepForge] DATABASE_URL detected.');

  // 1. Ensure PostgreSQL schema is active
  try {
    console.log('[PrepForge] Ensuring active Prisma schema is PostgreSQL...');
    execSync('node scripts/switch-db.js postgres', { stdio: 'inherit' });
  } catch (err) {
    console.warn('[PrepForge] Schema switch note:', err.message);
  }

  // 2. Generate Prisma Client for PostgreSQL
  try {
    console.log('[PrepForge] Generating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
  } catch (err) {
    console.warn('[PrepForge] Prisma generate warning:', err.message);
  }

  // 3. Push schema to PostgreSQL database (creates all tables)
  try {
    console.log('[PrepForge] Pushing Prisma schema to PostgreSQL (prisma db push)...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('[PrepForge] ✅ Database tables created/verified successfully.');
  } catch (err) {
    console.error('[PrepForge] ⚠️ Database push failed:', err.message);
  }

  // 4. Seed curriculum, sessions, and default users
  try {
    console.log('[PrepForge] Seeding initial database data...');
    execSync('node prisma/seed.js', { stdio: 'inherit' });
    console.log('[PrepForge] ✅ Database seeded successfully.');
  } catch (err) {
    console.warn('[PrepForge] Database seed notice:', err.message);
  }
} else {
  console.log('[PrepForge] No DATABASE_URL provided. Continuing with default local configuration.');
}

console.log('====================================================');
console.log('🚀 [PrepForge] Launching Next.js Production Server...');
console.log('====================================================');

const port = process.env.PORT || '3000';
const host = process.env.HOSTNAME || '0.0.0.0';

// Check if standalone server.js exists
const isStandalone = fs.existsSync('./server.js');
const startCmd = isStandalone ? 'node' : 'npx';
const startArgs = isStandalone ? ['server.js'] : ['next', 'start', '-p', port, '-H', host];

console.log(`[PrepForge] Executing: ${startCmd} ${startArgs.join(' ')}`);

const child = spawn(startCmd, startArgs, {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: port,
    HOSTNAME: host,
  },
});

child.on('exit', (code, signal) => {
  console.log(`[PrepForge] Next.js server exited with code ${code}, signal ${signal}`);
  process.exit(code || 0);
});

process.on('SIGINT', () => {
  console.log('[PrepForge] Received SIGINT. Shutting down gracefully...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('[PrepForge] Received SIGTERM. Shutting down gracefully...');
  child.kill('SIGTERM');
});
