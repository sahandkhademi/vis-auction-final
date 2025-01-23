CREATE OR REPLACE FUNCTION public.track_website_visit(
  p_session_id text,
  p_path text,
  p_user_agent text,
  p_ip_address text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_device_type TEXT;
  v_platform TEXT;
  v_visitor_id UUID;
  v_visit_id UUID;
BEGIN
  -- Extract device type from user agent
  v_device_type := CASE 
    WHEN p_user_agent ILIKE '%mobile%' OR p_user_agent ILIKE '%android%' OR p_user_agent ILIKE '%iphone%' THEN 'Mobile'
    WHEN p_user_agent ILIKE '%tablet%' OR p_user_agent ILIKE '%ipad%' THEN 'Tablet'
    ELSE 'Desktop'
  END;
  
  -- Extract platform from user agent
  v_platform := CASE 
    WHEN p_user_agent ILIKE '%windows%' THEN 'Windows'
    WHEN p_user_agent ILIKE '%mac%' OR 
         p_user_agent ILIKE '%macintosh%' OR 
         p_user_agent ILIKE '%macintel%' OR 
         p_user_agent ILIKE '%intel mac%' THEN 'MacOS'
    WHEN p_user_agent ILIKE '%linux%' THEN 'Linux'
    WHEN p_user_agent ILIKE '%android%' THEN 'Android'
    WHEN p_user_agent ILIKE '%ios%' OR 
         p_user_agent ILIKE '%iphone%' OR 
         p_user_agent ILIKE '%ipad%' THEN 'iOS'
    ELSE 'Unknown (' || p_user_agent || ')'
  END;

  -- Optional: Log the user agent for debugging purposes
  INSERT INTO user_agent_logs (user_agent, detected_platform) 
  VALUES (p_user_agent, v_platform);

  -- Get visitor ID if authenticated
  v_visitor_id := auth.uid();
  
  -- Insert visit record with IP address
  INSERT INTO website_visits (
    visitor_id,
    session_id,
    path,
    user_agent,
    device_type,
    platform,
    ip_address
  ) VALUES (
    v_visitor_id,
    p_session_id,
    p_path,
    p_user_agent,
    v_device_type,
    v_platform,
    p_ip_address
  ) RETURNING id INTO v_visit_id;
  
  RETURN v_visit_id;
END;
$$;
