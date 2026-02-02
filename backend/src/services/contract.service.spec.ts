/// <reference types="jest" />
import { ContractService, OnboardingInput } from './contract.service';
import { Env } from '../types';

describe('ContractService', () => {
  let service: ContractService;
  let mockDb: any;
  let mockEnv: Env;

  beforeEach(() => {
    mockDb = {
      prepare: jest.fn().mockReturnThis(),
      bind: jest.fn().mockReturnThis(),
      run: jest.fn(),
      first: jest.fn(),
      batch: jest.fn().mockResolvedValue([{ success: true }, { success: true }]),
    };

    mockEnv = {
      DB: mockDb,
      JWT_SECRET: 'secret',
      ENVIRONMENT: 'test',
    };

    service = new ContractService(mockEnv, 'tenant-123');
  });

  it('should create onboarding (employee + contract) in a batch', async () => {
    const input: OnboardingInput = {
        nombres: 'John',
        apellidoPaterno: 'Doe',
        apellidoMaterno: 'Smith',
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678',
        ubigeo: '150101',
        direccion: 'Av. Larco 123',
        banco: 'BCP',
        tipoCuenta: 'AHORROS',
        numeroCuenta: '193-12345678-0-01',
        numeroCCI: '00219311234567800112',
        sistemaPensiones: 'AFP_INTEGRA',
        asignacionFamiliar: false,
        cargo: 'Developer',
        salarioBase: 5000,
        fechaInicio: '2023-01-01',
        tipoContrato: 'PLAZO_FIJO',
        regimenLaboral: 'GENERAL'
    };

    // Mock company fetch
    mockDb.first.mockResolvedValue({
           id: 'tenant-123',
           razon_social: 'Test Corp',
           ruc: '20123456789',
           direccion_fiscal: JSON.stringify({ direccion: 'Av Test 123', distrito: 'Lima', provincia: 'Lima' }),
           representante_legal_nombre: 'Juan Perez',
           representante_legal_dni: '12345678',
           config: '{}'
    });

    const result = await service.createOnboarding(input);

    expect(result.success).toBe(true);
    expect(result.data.employeeId).toBeDefined();
    expect(result.data.contractId).toBeDefined();

    // Verify batch was called
    expect(mockDb.batch).toHaveBeenCalledTimes(1);
    const batchArgs = mockDb.batch.mock.calls[0][0];
    expect(batchArgs).toHaveLength(2); // Employee and Contract statements

    // We can verify that prepare was called with correct SQL, but simple check is enough
    expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO employees'));
    expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO contracts'));
  });
});
