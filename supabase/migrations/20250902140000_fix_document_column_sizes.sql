-- Fix file_type column size to accommodate longer MIME types
ALTER TABLE documents ALTER COLUMN file_type TYPE character varying(100);
