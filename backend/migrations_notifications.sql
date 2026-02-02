-- Migration for Notifications System

CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT,
    "user_id" TEXT,
    "type" TEXT NOT NULL, -- 'employee', 'contract', 'payroll', 'overtime', 'leave', 'warning', etc.
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" INTEGER NOT NULL DEFAULT 0, -- 0: false, 1: true
    "actions" TEXT, -- JSON string defining actions like [{key: 'view', label: 'Ver'}]
    "metadata" TEXT, -- JSON string for extra data needed for actions (e.g., employeeId, contractId)
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON DELETE CASCADE,
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
);

CREATE INDEX "idx_notifications_user_timestamp" ON "notifications"("user_id", "timestamp" DESC);
CREATE INDEX "idx_notifications_company_timestamp" ON "notifications"("company_id", "timestamp" DESC);
