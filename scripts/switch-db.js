const fs = require('fs');
const path = require('path');

const target = process.argv[2];
if (!target || (target !== 'sqlite' && target !== 'postgres')) {
  console.error('Usage: node scripts/switch-db.js [sqlite|postgres]');
  process.exit(1);
}

const prismaDir = path.join(__dirname, '..', 'prisma');
const targetSchema = path.join(prismaDir, target === 'sqlite' ? 'schema.sqlite.prisma' : 'schema.postgres.prisma');
const destSchema = path.join(prismaDir, 'schema.prisma');

if (!fs.existsSync(targetSchema)) {
  console.error(`Source schema ${targetSchema} does not exist.`);
  process.exit(1);
}

fs.copyFileSync(targetSchema, destSchema);
console.log(`[PrepForge] Successfully switched active Prisma schema to: ${target.toUpperCase()}`);
