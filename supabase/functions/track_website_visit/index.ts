import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { session_id, path, user_agent } = await req.json()
    const ip_address = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip')

    // Track the visit
    const { data, error } = await supabaseClient.rpc('track_website_visit', {
      p_session_id: session_id,
      p_path: path,
      p_user_agent: user_agent,
      p_ip_address: ip_address
    })

    if (error) throw error

    // Return both the visit ID and IP address
    return new Response(
      JSON.stringify({ 
        id: data,
        ip_address: ip_address || 'unknown'
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in track_website_visit:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})