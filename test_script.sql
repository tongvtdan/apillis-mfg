DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'test_type') THEN CREATE TYPE test_type AS ENUM ('test1', 'test2'); END IF; END $$;
