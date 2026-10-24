-- Make actor_name nullable temporarily if it exists
ALTER TABLE plan_history ALTER COLUMN actor_name DROP NOT NULL;

-- Add default value for actor_name
ALTER TABLE plan_history ALTER COLUMN actor_name SET DEFAULT 'System';
