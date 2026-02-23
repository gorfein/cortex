-- Backfill existing topics with auto_converge: true default
UPDATE topics
SET settings = COALESCE(settings, '{}'::jsonb) || '{"auto_converge": true}'::jsonb
WHERE settings IS NULL OR NOT (settings ? 'auto_converge');
