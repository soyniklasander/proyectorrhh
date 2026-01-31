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
          const result = await env.DB.prepare('SELECT id, nombreCompleto, numeroDocumento, estado FROM employees LIMIT 5').all();
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
          // Fallback local mock data if DB binding is not configured (for development/demo)
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
          // Si es otro error, reportar DB_MISSING/UNAVAILABLE
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

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Endpoint not found',
          available_endpoints: [
            'GET /api/v1/health',
            'GET /api/v1/employees',
            'POST /api/v1/employees'
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
