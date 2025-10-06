-- Enable Row Level Security
ALTER TABLE raspberry_pi_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE threats ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for raspberry_pi_agents
CREATE POLICY "Allow authenticated users to read agents"
  ON raspberry_pi_agents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert agents"
  ON raspberry_pi_agents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update agents"
  ON raspberry_pi_agents FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for threats
CREATE POLICY "Allow authenticated users to read threats"
  ON threats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert threats"
  ON threats FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update threats"
  ON threats FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for notifications
CREATE POLICY "Users can read their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for system_logs
CREATE POLICY "Allow authenticated users to read system logs"
  ON system_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert system logs"
  ON system_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for user_settings
CREATE POLICY "Users can read their own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
