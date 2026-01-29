import { Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseService {
  constructor() {
    this.initializePrisma();
  }

  private async initializePrisma() {
    try {
      const { PrismaClient } = await import('@prisma/client');
      
      // Para Cloudflare Workers, usamos el binding de la base de datos
      if (typeof globalThis.DB !== 'undefined') {
        const prisma = new PrismaClient({
          datasources: {
            db: {
              url: 'file:./db_mchk.db'
            }
          }
        });
        return prisma;
      } else {
        // Para desarrollo local
        const prisma = new PrismaClient();
        return prisma;
      }
    } catch (error) {
      console.error('Error initializing Prisma:', error);
      throw error;
    }
  }
}