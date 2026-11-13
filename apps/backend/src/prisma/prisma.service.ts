import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // Attempt database connection if DATABASE_URL is configured
    if (process.env.DATABASE_URL) {
      try {
        await this.$connect();
        console.log('✅ Connected to PostgreSQL database');
      } catch (err) {
        console.warn('⚠️ PostgreSQL connection failed, running in mock/offline mode:', err.message);
      }
    } else {
      console.log('ℹ️ DATABASE_URL not set, running in offline mock mode');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
