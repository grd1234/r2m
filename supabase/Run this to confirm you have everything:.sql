 Run this to confirm you have everything:

  -- Should return 10
  SELECT COUNT(*) FROM profiles
  WHERE email LIKE 'demo+investor%@infyra.ai';

  -- Should return 6 (investors with AI/ML domain)
  SELECT COUNT(*) FROM profiles
  WHERE profile->'domains' ? 'AI/ML'
  AND user_type IN ('investor', 'corporate_rd', 'tto', 'innovation_hub');

  -- Should return 2 new tables
  SELECT table_name FROM information_schema.tables
  WHERE table_name IN ('researcher_connections', 'analytics_events');
