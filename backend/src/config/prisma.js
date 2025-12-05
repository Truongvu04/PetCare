import { PrismaClient } from '@prisma/client';

let databaseUrl = process.env.DATABASE_URL || '';

if (databaseUrl && !databaseUrl.includes('charset')) {
  const separator = databaseUrl.includes('?') ? '&' : '?';
  databaseUrl = `${databaseUrl}${separator}charset=utf8mb4`;
}

if (databaseUrl && !databaseUrl.includes('connection_limit')) {
  const separator = databaseUrl.includes('?') ? '&' : '?';
  databaseUrl = `${databaseUrl}${separator}connection_limit=5`;
}

if (databaseUrl && !databaseUrl.includes('socket_timeout')) {
  const separator = databaseUrl.includes('?') ? '&' : '?';
  databaseUrl = `${databaseUrl}${separator}socket_timeout=30`;
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

async function initializePrisma() {
  try {
    await prisma.$connect();
    
    await prisma.$executeRaw`SET NAMES 'utf8mb4'`;
    await prisma.$executeRaw`SET CHARACTER SET 'utf8mb4'`;
    await prisma.$executeRaw`SET character_set_client = 'utf8mb4'`;
    await prisma.$executeRaw`SET character_set_connection = 'utf8mb4'`;
    await prisma.$executeRaw`SET character_set_results = 'utf8mb4'`;
    await prisma.$executeRaw`SET collation_connection = 'utf8mb4_unicode_ci'`;
    
    console.log('✅ [Database] Connected successfully.');
    console.log('✅ [Database] Forced charset/collation to utf8mb4.');
  } catch (error) {
    console.error('❌ [Database] Connection error:', error);
  }
}

initializePrisma();

export default prisma;
export { prisma };
