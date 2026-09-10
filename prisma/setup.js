const { execSync } = require('child_process');

console.log('[PrepForge DB Setup] Running prisma generate & push...');
execSync('npx prisma generate', { stdio: 'inherit' });
execSync('npx prisma db push', { stdio: 'inherit' });

console.log('[PrepForge DB Setup] Running prisma seed...');
execSync('node prisma/seed.js', { stdio: 'inherit' });

console.log('[PrepForge DB Setup] Database setup finished successfully!');
