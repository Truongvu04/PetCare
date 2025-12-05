import { PrismaClient } from '@prisma/client';

let databaseUrl = process.env.DATABASE_URL || '';

if (databaseUrl && !databaseUrl.includes('charset')) {
  const separator = databaseUrl.includes('?') ? '&' : '?';
  databaseUrl = `${databaseUrl}${separator}charset=utf8mb4`;
}

if (databaseUrl && !databaseUrl.includes('connectionLimit')) {
  const separator = databaseUrl.includes('?') ? '&' : '?';
  databaseUrl = `${databaseUrl}${separator}connectionLimit=10`;
}

const prismaClientOptions = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: databaseUrl
    }
  }
};

export const prisma = new PrismaClient(prismaClientOptions);

prisma.$connect().then(async () => {
  console.log('✅ Prisma connected');
  
  try {
    await prisma.$executeRaw`SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci`;
    await prisma.$executeRaw`SET CHARACTER SET utf8mb4`;
    await prisma.$executeRaw`SET character_set_client = utf8mb4`;
    await prisma.$executeRaw`SET character_set_connection = utf8mb4`;
    await prisma.$executeRaw`SET character_set_results = utf8mb4`;
    console.log('✅ Database charset set to utf8mb4');
  } catch (err) {
    console.warn('⚠️ Could not set database charset:', err.message);
  }
}).catch((err) => {
  console.error('❌ Prisma connection error:', err);
});

export default prisma;
