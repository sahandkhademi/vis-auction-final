import { supabase } from "@/integrations/supabase/client";

export const trackPageVisit = async () => {
  try {
    // Generate a session ID if none exists
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('session_id', sessionId);
    }

    const { data, error } = await supabase.functions.invoke('track_website_visit', {
      body: {
        session_id: sessionId,
        path: window.location.pathname,
        user_agent: navigator.userAgent,
      }
    });

    if (error) {
      console.error('Error tracking visit:', error);
      return;
    }

    console.log('Visit recorded successfully:', data.id);
  } catch (err) {
    console.error('Failed to track visit:', err);
  }
};