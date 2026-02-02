
// Simulate an employee object structure
interface Employee {
  id: string;
  nombreCompleto: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaIngreso: string;
  estado: string;
  // Adding more fields to simulate a real object size as per the schema
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  direccion: string;
  email: string;
  telefono: string;
  cargo: string;
  departamento: string;
  provincia: string;
  distrito: string;
}

// Generate mock data
function generateEmployees(count: number): Employee[] {
  const employees: Employee[] = [];
  for (let i = 0; i < count; i++) {
    employees.push({
      id: `emp_${i}`,
      nombreCompleto: `Empleado Test ${i}`,
      tipoDocumento: 'DNI',
      numeroDocumento: `12345678${i}`,
      fechaIngreso: new Date().toISOString(),
      estado: 'ACTIVO',
      nombres: `Nombre ${i}`,
      apellidoPaterno: `ApellidoP ${i}`,
      apellidoMaterno: `ApellidoM ${i}`,
      fechaNacimiento: '1990-01-01',
      direccion: `Calle Falsa ${i}`,
      email: `empleado${i}@example.com`,
      telefono: '999888777',
      cargo: 'Desarrollador',
      departamento: 'Lima',
      provincia: 'Lima',
      distrito: 'Miraflores'
    });
  }
  return employees;
}

const TOTAL_EMPLOYEES = 1000;
const EMPLOYEES = generateEmployees(TOTAL_EMPLOYEES);

// 1. Baseline: Fetch ALL employees
const baselinePayload = JSON.stringify({
  success: true,
  data: EMPLOYEES
});

// 2. Optimization: Fetch summary (top 5 + total count)
const optimizedPayload = JSON.stringify({
  success: true,
  data: {
    recentEmployees: EMPLOYEES.slice(0, 5),
    totalEmployees: TOTAL_EMPLOYEES,
    activeContracts: TOTAL_EMPLOYEES // Assuming 1:1 for this simulation
  }
});

const baselineSize = Buffer.byteLength(baselinePayload, 'utf8');
const optimizedSize = Buffer.byteLength(optimizedPayload, 'utf8');

console.log('--- Performance Measurement ---');
console.log(`Scenario: ${TOTAL_EMPLOYEES} employees`);
console.log(`Baseline Payload Size (Fetch All): ${(baselineSize / 1024).toFixed(2)} KB`);
console.log(`Optimized Payload Size (Summary): ${(optimizedSize / 1024).toFixed(2)} KB`);
console.log(`Reduction: ${((baselineSize - optimizedSize) / baselineSize * 100).toFixed(2)}%`);
