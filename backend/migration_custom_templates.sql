-- ============================================
-- TABLA DE PLANTILLAS PROPIAS (CREADAS POR USUARIO)
-- ============================================
CREATE TABLE IF NOT EXISTS "custom_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'CUSTOM',
    "regimenLaboral" TEXT,
    "contenido" TEXT NOT NULL,
    "campos" TEXT,
    "requiresSignature" BOOLEAN NOT NULL DEFAULT true,
    "esEditable" BOOLEAN NOT NULL DEFAULT true,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT (datetime('now')),
    "updatedAt" DATETIME NOT NULL DEFAULT (datetime('now'))
);
