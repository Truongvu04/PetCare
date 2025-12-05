import { PrismaClient } from '@prisma/client';

const prismaClientOptions = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
};

export const prisma = new PrismaClient(prismaClientOptions);

prisma.$connect().then(() => {
  console.log('✅ Prisma connected with UTF-8 encoding');
}).catch((err) => {
  console.error('❌ Prisma connection error:', err);
});

export default prisma;
