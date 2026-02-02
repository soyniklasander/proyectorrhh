import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './employees/employees.module';
import { ContractsModule } from './contracts/contracts.module';
import { OvertimeHoursModule } from './overtime-hours/overtime-hours.module';
import { EmployeeLoansModule } from './employee-loans/employee-loans.module';
import { LoanInstallmentsModule } from './loan-installments/loan-installments.module';
import { DeductionsModule } from './deductions/deductions.module';
import { PayrollModule } from './payroll/payroll.module';
import { LeavesPermissionsModule } from './leaves-permissions/leaves-permissions.module';
import { AttendanceControlModule } from './attendance-control/attendance-control.module';
import { WithholdingsModule } from './withholdings/withholdings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    EmployeesModule,
    ContractsModule,
    OvertimeHoursModule,
    EmployeeLoansModule,
    LoanInstallmentsModule,
    DeductionsModule,
    PayrollModule,
    LeavesPermissionsModule,
    AttendanceControlModule,
    WithholdingsModule,
  ],
})
export class AppModule {}