import { Injectable } from '@nestjs/common';

@Injectable()
export class EmployeesService {
  // TODO: Implementar con Prisma
  findAll() {
    return [];
  }

  findOne(id: string) {
    return null;
  }

  create(data: any) {
    return data;
  }

  update(id: string, data: any) {
    return data;
  }

  remove(id: string) {
    return { deleted: true };
  }
}