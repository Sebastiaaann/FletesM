-- Migration: Add delivery_proof column to routes table
-- Description: Adds JSONB column to store digital signature and delivery proof data
-- Date: 2024-11-25

-- Add delivery_proof column
ALTER TABLE routes ADD COLUMN IF NOT EXISTS delivery_proof JSONB;

-- Add comment to explain the column
COMMENT ON COLUMN routes.delivery_proof IS 'JSON object containing delivery proof data: signature (base64 PNG), clientName, clientId, deliveredAt timestamp, and notes';

-- Optional: Add index for queries filtering by delivery proof existence
CREATE INDEX IF NOT EXISTS idx_routes_has_delivery_proof ON routes ((delivery_proof IS NOT NULL));

-- Example data structure:
-- {
--   "signature": "data:image/png;base64,iVBORw0KG...",
--   "clientName": "Juan Pérez",
--   "clientId": "12.345.678-9",
--   "deliveredAt": 1704067200000,
--   "notes": "Entregado en buen estado"
-- }
