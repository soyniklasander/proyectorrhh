
import { ContractService, OnboardingInput } from './contract.service';
import { Env } from '../types';

// Mock crypto.randomUUID if not available (e.g. in older Jest envs)
if (!global.crypto) {
    (global as any).crypto = {
        randomUUID: () => 'uuid-' + Math.random().toString(36).substring(2, 15)
    };
} else if (!global.crypto.randomUUID) {
    (global.crypto as any).randomUUID = () => 'uuid-' + Math.random().toString(36).substring(2, 15);
}

describe('ContractService', () => {
    let service: ContractService;
    let mockDB: any;
    let mockEnv: Env;

    const mockCompany = {
        id: 'company-123',
        razon_social: 'MI EMPRESA S.A.C.',
        ruc: '20123456789',
        direccion_fiscal: JSON.stringify({
            direccion: 'CALLE LAS GARDENIAS 456',
            distrito: 'MIRAFLORES',
            provincia: 'LIMA'
        }),
        representante_legal_nombre: 'MARIA GONZALES',
        representante_legal_dni: '87654321',
        config: '{}'
    };

    const mockEmployeeInput: OnboardingInput = {
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678',
        nombres: 'JUAN',
        apellidoPaterno: 'PEREZ',
        apellidoMaterno: 'LOPEZ',
        ubigeo: '150101',
        direccion: 'AV. LOS HEROES 123',
        banco: 'BCP',
        tipoCuenta: 'AHORROS',
        numeroCuenta: '191-12345678-0-01',
        numeroCCI: '00219112345678001500',
        sistemaPensiones: 'AFP_INTEGRA',
        cuspp: '123456CPP',
        asignacionFamiliar: true,
        cargo: 'DESARROLLADOR SENIOR',
        salarioBase: 5000.00,
        fechaInicio: '2023-01-01',
        tipoContrato: 'PLAZO INDETERMINADO',
        regimenLaboral: 'REGIMEN GENERAL'
    };

    beforeEach(() => {
        mockDB = {
            prepare: jest.fn().mockReturnThis(),
            bind: jest.fn().mockReturnThis(),
            first: jest.fn(),
            run: jest.fn(),
        };

        mockEnv = {
            DB: mockDB,
            JWT_SECRET: 'test-secret',
            ENVIRONMENT: 'test',
        };

        service = new ContractService(mockEnv, 'tenant-123');
    });

    it('should create onboarding and generate contract preview correctly', async () => {
        // Mock DB responses
        // 1. Fetch Company
        mockDB.first.mockResolvedValueOnce(mockCompany);
        // 2. Insert Employee -> run() returns nothing (or success)
        mockDB.run.mockResolvedValueOnce({ success: true });
        // 3. Insert Contract -> run() returns nothing
        mockDB.run.mockResolvedValueOnce({ success: true });

        const result = await service.createOnboarding(mockEmployeeInput);

        expect(result.success).toBe(true);
        expect(result.data.employeeId).toBeDefined();
        expect(result.data.contractId).toBeDefined();

        const preview = result.data.preview;
        expect(preview).toContain('CONTRATO DE TRABAJO');
        expect(preview).toContain('EL EMPLEADOR: MI EMPRESA S.A.C.');
        expect(preview).toContain('RUC N° 20123456789');
        expect(preview).toContain('CALLE LAS GARDENIAS 456, MIRAFLORES, LIMA');
        expect(preview).toContain('JUAN PEREZ LOPEZ');
        expect(preview).toContain('DNI N° 12345678');
        expect(preview).toContain('AV. LOS HEROES 123');
        expect(preview).toContain('DESARROLLADOR SENIOR');
        expect(preview).toContain('S/ 5000.00');
        expect(preview).toContain('REGIMEN GENERAL');

        // Date check (dynamic, so just check structure)
        // Firmado en Lima, a los X días del mes de Y del Z.
        expect(preview).toMatch(/Firmado en Lima, a los \d{1,2} días del mes de \d{1,2} del \d{4}/);
    });

    it('should throw error if company not found', async () => {
        mockDB.first.mockResolvedValueOnce(null);

        await expect(service.createOnboarding(mockEmployeeInput)).rejects.toThrow('Company not found');
    });
});
