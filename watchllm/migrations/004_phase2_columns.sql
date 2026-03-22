ALTER TABLE users ADD COLUMN last_seen_at INTEGER;

ALTER TABLE projects ADD COLUMN deleted_at INTEGER;
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at);

ALTER TABLE simulations ADD COLUMN parent_sim_id TEXT REFERENCES simulations(id);
CREATE INDEX IF NOT EXISTS idx_simulations_parent_sim_id ON simulations(parent_sim_id);
