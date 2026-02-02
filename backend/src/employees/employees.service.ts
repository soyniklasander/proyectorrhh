import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  findAll(companyId?: string) {
    if (companyId) {
      return this.prisma.employee.findMany({
        where: { company_id: companyId },
        include: {
          contracts: true,
        },
      });
    }
    return this.prisma.employee.findMany({
      include: {
        contracts: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.employee.findUnique({
      where: { id },
      include: {
        contracts: true,
        employeeLoans: true,
        deductions: true,
        payroll: true,
      },
    });
  }

  create(data: any) {
    return this.prisma.employee.create({
      data,
    });
  }

  update(id: string, data: any) {
    return this.prisma.employee.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.employee.delete({
      where: { id },
    });
  }
}