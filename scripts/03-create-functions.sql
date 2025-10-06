-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_raspberry_pi_agents_updated_at
  BEFORE UPDATE ON raspberry_pi_agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create notification when new threat is detected
CREATE OR REPLACE FUNCTION create_threat_notification()
RETURNS TRIGGER AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Create notification for all users
  FOR user_record IN SELECT id FROM auth.users LOOP
    INSERT INTO notifications (user_id, threat_id, title, message, type)
    VALUES (
      user_record.id,
      NEW.id,
      'New ' || NEW.severity || ' threat detected',
      NEW.description,
      'threat'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create notification on new threat
CREATE TRIGGER on_threat_created
  AFTER INSERT ON threats
  FOR EACH ROW
  EXECUTE FUNCTION create_threat_notification();
