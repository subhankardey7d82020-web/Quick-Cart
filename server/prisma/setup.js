const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const prismaDir = __dirname;
const activeSchemaPath = path.join(prismaDir, 'schema.prisma');
const pgSchemaPath = path.join(prismaDir, 'schema.postgresql.prisma');
const sqliteSchemaPath = path.join(prismaDir, 'schema.sqlite.prisma');

const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
const isPostgres = databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://');

console.log('----------------------------------------------------');
console.log(`[Quick Cart Database Config]`);
console.log(`  DATABASE_URL detected: ${isPostgres ? databaseUrl.split('@')[1] || 'PostgreSQL Connection' : 'file:./dev.db'}`);
console.log(`  Target Provider:       ${isPostgres ? 'PostgreSQL (Production/Neon)' : 'SQLite (Local Development)'}`);
console.log('----------------------------------------------------');

try {
  if (isPostgres) {
    if (fs.existsSync(pgSchemaPath)) {
      const pgSchema = fs.readFileSync(pgSchemaPath, 'utf8');
      fs.writeFileSync(activeSchemaPath, pgSchema, 'utf8');
      console.log('✅ Active schema.prisma configured for PostgreSQL.');
    } else {
      console.warn('⚠️ schema.postgresql.prisma not found, keeping existing schema.prisma');
    }
  } else {
    if (fs.existsSync(sqliteSchemaPath)) {
      const sqliteSchema = fs.readFileSync(sqliteSchemaPath, 'utf8');
      fs.writeFileSync(activeSchemaPath, sqliteSchema, 'utf8');
      console.log('✅ Active schema.prisma configured for SQLite (dev.db preserved).');
    } else {
      console.warn('⚠️ schema.sqlite.prisma not found, keeping existing schema.prisma');
    }
  }
} catch (err) {
  console.error('❌ Error configuring schema.prisma:', err);
  process.exit(1);
}
