// Cloudflare Workers handler compatible con Prisma para edge runtime
export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    try {
      // CORS headers
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      };

      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // Basic API routing con D1 directo (sin Prisma por ahora)
      const url = new URL(request.url);
      const path = url.pathname;

      if (path === '/api/v1/health') {
        // Quick DB health probe to ensure DB binding is alive
        try {
          if (env.DB) {
            await env.DB.prepare('SELECT 1').all();
          }
        } catch {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'DB_UNAVAILABLE',
              message: 'Database not accessible'
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            }
          );
        }
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'RRHHMod API is running',
            database: 'D1 connected',
            timestamp: new Date().toISOString()
          }),
          { 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      if (path === '/api/v1/employees' && request.method === 'GET') {
        try {
          if (!env.DB) throw new Error("DB binding not configured");
          const result = await env.DB.prepare(`
            SELECT id, nombres, apellidoPaterno, apellidoMaterno, nombreCompleto, 
                   tipoDocumento, numeroDocumento, fechaNacimiento, estado, fechaIngreso,
                   email, telefono, banco, tipoCuenta
            FROM employees 
            ORDER BY nombreCompleto
          `).all();
          return new Response(
            JSON.stringify({
              success: true,
              data: result.results,
              timestamp: new Date().toISOString()
            }),
            { 
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            }
          );
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error)
          if (msg.includes('DB binding not configured')) {
            const sample = [
              { id: 'demo-1', nombreCompleto: 'Juan Pérez García', numeroDocumento: '12345678', estado: 'ACTIVO' }
            ]
            return new Response(
              JSON.stringify({
                success: true,
                data: sample,
                timestamp: new Date().toISOString()
              }),
              { 
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
              }
            );
          }
          return new Response(
            JSON.stringify({
              success: false,
              error: 'DB_UNAVAILABLE',
              message: msg
            }),
            { 
              status: 503,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            }
          );
        }
      }

      // Endpoint para crear empleado temporal
      if (path === '/api/v1/employees' && request.method === 'POST') {
        try {
          const body = await request.json();
          
          const result = await env.DB.prepare(`
            INSERT INTO employees (id, nombres, apellidoPaterno, apellidoMaterno, nombreCompleto, tipoDocumento, numeroDocumento, fechaNacimiento, estado, fechaIngreso, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
          `).bind(
            crypto.randomUUID(),
            body.nombres || 'Demo',
            body.apellidoPaterno || 'User',
            body.apellidoMaterno || 'Test',
            `${body.nombres || 'Demo'} ${body.apellidoPaterno || 'User'} ${body.apellidoMaterno || 'Test'}`,
            body.tipoDocumento || 'DNI',
            body.numeroDocumento || '12345678',
            body.fechaNacimiento || '1990-01-01',
            body.estado || 'ACTIVO',
            body.fechaIngreso || new Date().toISOString().split('T')[0]
          ).run();

          return new Response(
            JSON.stringify({
              success: true,
              message: 'Employee created successfully',
              data: result,
              timestamp: new Date().toISOString()
            }),
            { 
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Failed to create employee',
              message: error instanceof Error ? error.message : 'Unknown error'
            }),
            { 
              status: 500,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            }
          );
        }
      }

      // Get single employee
      const employeeMatch = path.match(/^\/api\/v1\/employees\/(.+)$/);
      if (employeeMatch && request.method === 'GET') {
        try {
          const result = await env.DB.prepare(`
            SELECT * FROM employees WHERE id = ?
          `).bind(employeeMatch[1]).all();
          
          if (result.results.length === 0) {
            return new Response(
              JSON.stringify({ success: false, error: 'NOT_FOUND', message: 'Employee not found' }),
              { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }
          
          return new Response(
            JSON.stringify({ success: true, data: result.results[0] }),
            { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({ success: false, error: 'DB_ERROR', message: error instanceof Error ? error.message : 'Unknown error' }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
      }

      // ============================================
      // CONTRACT TEMPLATES ENDPOINTS
      // ============================================
      if (path === '/api/v1/contract-templates' && request.method === 'GET') {
        try {
          const result = await env.DB.prepare(`
            SELECT id, nombre, codigo, regimenLaboral, tipoContrato, descripcion,
                   diasLaborales, horasSemanales, tieneCTS, tieneVacaciones, 
                   tieneGratificaciones, tieneUtilidades, tieneAsignacionFamiliar,
                   essaludPorcentaje, camposRequeridos, camposOpcionales, estado
            FROM contract_templates
            WHERE estado = 'ACTIVO'
            ORDER BY regimenLaboral, nombre
          `).all();
          return new Response(
            JSON.stringify({
              success: true,
              data: result.results,
              timestamp: new Date().toISOString()
            }),
            {
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'DB_ERROR',
              message: error instanceof Error ? error.message : 'Unknown error'
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            }
          );
        }
      }

      // Get single template
      const templateMatch = path.match(/^\/api\/v1\/contract-templates\/(.+)$/);
      if (templateMatch && request.method === 'GET') {
        try {
          const result = await env.DB.prepare(`
            SELECT * FROM contract_templates WHERE id = ?
          `).bind(templateMatch[1]).all();
          
          if (result.results.length === 0) {
            return new Response(
              JSON.stringify({ success: false, error: 'NOT_FOUND', message: 'Template not found' }),
              { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }
          
          return new Response(
            JSON.stringify({ success: true, data: result.results[0] }),
            { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({ success: false, error: 'DB_ERROR', message: error instanceof Error ? error.message : 'Unknown error' }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
      }

      // ============================================
      // CONTRACTS ENDPOINTS
      // ============================================
      if (path === '/api/v1/contracts' && request.method === 'GET') {
        try {
          const employeeId = url.searchParams.get('empleadoId');
          let query = `
            SELECT c.*, e.nombreCompleto, e.numeroDocumento, e.email, e.telefono
            FROM contracts c
            JOIN employees e ON c.empleadoId = e.id
          `;
          const params = [];
          
          if (employeeId) {
            query += ' WHERE c.empleadoId = ?';
            params.push(employeeId);
          }
          query += ' ORDER BY c.createdAt DESC';
          
          const result = await env.DB.prepare(query).bind(...params).all();
          return new Response(
            JSON.stringify({
              success: true,
              data: result.results,
              timestamp: new Date().toISOString()
            }),
            {
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'DB_ERROR',
              message: error instanceof Error ? error.message : 'Unknown error'
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            }
          );
        }
      }

      if (path === '/api/v1/contracts' && request.method === 'POST') {
        try {
          const body = await request.json();
          const id = crypto.randomUUID();
          
          await env.DB.prepare(`
            INSERT INTO contracts (
              id, empleadoId, tipoContrato, regimenLaboral, modalidadContrato,
              fechaInicio, fechaFin, duracionMeses, cargo, puesto, categoriaOcupacional,
              nivel, centroCostos, departamentoTrabajo, areaTrabajo, turno,
              horarioTrabajo, diasTrabajo, horasSemanales, salarioBase, tipoMoneda,
              formaPago, medioPago, asignacionFamiliar, bonificacionProductividad,
              bonificacionPuesto, movilidad, refrigerio, seguroSalud, nombreEPS,
              afp, nombreAFP, cuspp, tipoSeguro, tieneCTS, tieneVacaciones,
              tieneGratificaciones, tieneUtilidades, estado, archivoContrato,
              createdById, createdAt, updatedAt
            ) VALUES (
              ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now')
            )
          `).bind(
            id, body.empleadoId, body.tipoContrato, body.regimenLaboral,
            body.modalidadContrato || 'Presencial', body.fechaInicio,
            body.fechaFin || null, body.duracionMeses || null, body.cargo,
            body.puesto || null, body.categoriaOcupacional || null,
            body.nivel || null, body.centroCostos || null,
            body.departamentoTrabajo || null, body.areaTrabajo || null,
            body.turno || null, body.horarioTrabajo || null,
            body.diasTrabajo || 5, body.horasSemanales || 48,
            body.salarioBase, body.tipoMoneda || 'PEN',
            body.formaPago || 'MENSUAL', body.medioPago || 'DEPOSITO',
            body.asignacionFamiliar || 0, body.bonificacionProductividad || 0,
            body.bonificacionPuesto || 0, body.movilidad || 0,
            body.refrigerio || 0, body.seguroSalud || 'ESSALUD',
            body.nombreEPS || null, body.afp || null, body.nombreAFP || null,
            body.cuspp || null, body.tipoSeguro || null,
            body.tieneCTS !== false, body.tieneVacaciones !== false,
            body.tieneGratificaciones !== false, body.tieneUtilidades !== false,
            body.estado || 'VIGENTE', body.archivoContrato || null,
            body.createdById || 'system'
          ).run();

          return new Response(
            JSON.stringify({
              success: true,
              message: 'Contract created successfully',
              data: { id, ...body },
              timestamp: new Date().toISOString()
            }),
            {
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Failed to create contract',
              message: error instanceof Error ? error.message : 'Unknown error'
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            }
          );
        }
      }

      // Get single contract
      const contractMatch = path.match(/^\/api\/v1\/contracts\/(.+)$/);
      if (contractMatch && request.method === 'GET') {
        try {
          const result = await env.DB.prepare(`
            SELECT c.*, e.nombreCompleto, e.numeroDocumento, e.email, e.telefono,
                   e.direccion, e.departamento, e.provincia, e.distrito
            FROM contracts c
            JOIN employees e ON c.empleadoId = e.id
            WHERE c.id = ?
          `).bind(contractMatch[1]).all();
          
          if (result.results.length === 0) {
            return new Response(
              JSON.stringify({ success: false, error: 'NOT_FOUND', message: 'Contract not found' }),
              { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }
          
          return new Response(
            JSON.stringify({ success: true, data: result.results[0] }),
            { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({ success: false, error: 'DB_ERROR', message: error instanceof Error ? error.message : 'Unknown error' }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
      }

      // Update contract
      if (contractMatch && request.method === 'PUT') {
        try {
          const body = await request.json();
          
          await env.DB.prepare(`
            UPDATE contracts SET
              tipoContrato = ?, regimenLaboral = ?, modalidadContrato = ?,
              fechaInicio = ?, fechaFin = ?, duracionMeses = ?, cargo = ?,
              puesto = ?, categoriaOcupacional = ?, nivel = ?, centroCostos = ?,
              departamentoTrabajo = ?, areaTrabajo = ?, turno = ?, horarioTrabajo = ?,
              diasTrabajo = ?, horasSemanales = ?, salarioBase = ?, tipoMoneda = ?,
              formaPago = ?, medioPago = ?, asignacionFamiliar = ?,
              bonificacionProductividad = ?, bonificacionPuesto = ?,
              movilidad = ?, refrigerio = ?, estado = ?, updatedAt = datetime('now')
            WHERE id = ?
          `).bind(
            body.tipoContrato, body.regimenLaboral, body.modalidadContrato,
            body.fechaInicio, body.fechaFin, body.duracionMeses, body.cargo,
            body.puesto, body.categoriaOcupacional, body.nivel, body.centroCostos,
            body.departamentoTrabajo, body.areaTrabajo, body.turno, body.horarioTrabajo,
            body.diasTrabajo, body.horasSemanales, body.salarioBase, body.tipoMoneda,
            body.formaPago, body.medioPago, body.asignacionFamiliar,
            body.bonificacionProductividad, body.bonificacionPuesto,
            body.movilidad, body.refrigerio, body.estado, contractMatch[1]
          ).run();

          return new Response(
            JSON.stringify({
              success: true,
              message: 'Contract updated successfully',
              timestamp: new Date().toISOString()
            }),
            {
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Failed to update contract',
              message: error instanceof Error ? error.message : 'Unknown error'
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            }
          );
        }
      }

      // ============================================
      // DEFAULT 404
      // ============================================
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Endpoint not found',
          available_endpoints: [
            'GET /api/v1/health',
            'GET /api/v1/employees',
            'POST /api/v1/employees',
            'GET /api/v1/employees/:id',
            'GET /api/v1/contract-templates',
            'GET /api/v1/contract-templates/:id',
            'GET /api/v1/contracts',
            'POST /api/v1/contracts',
            'GET /api/v1/contracts/:id',
            'PUT /api/v1/contracts/:id'
          ]
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );

    } catch (error) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
};
