import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
    // Note: In a Worker environment, we would need to pass the adapter.
    // However, NestJS dependency injection in this codebase is primarily for structure
    // or local dev. The actual Worker uses Hono and direct D1 bindings.
    // If we were to run NestJS in the worker, we'd need to inject the D1 binding here.
    // For now, we ensure compatibility with the schema "driverAdapters" feature.
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
