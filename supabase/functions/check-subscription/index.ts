
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { addDays } from "https://deno.land/x/date_fns@v2.22.1/index.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials not configured');
    }

    // Fetch user subscription info
    const response = await fetch(`${supabaseUrl}/rest/v1/user_subscriptions?user_id=eq.${userId}&is_active=eq.true`, {
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscription data');
    }

    const subscriptions = await response.json();
    
    // Check if user has an active subscription
    const activeSubscription = subscriptions.length > 0 ? subscriptions[0] : null;
    
    // Calculate if subscription is about to expire
    let notificationDue = false;
    let daysRemaining = 0;
    
    if (activeSubscription) {
      const expiresAt = new Date(activeSubscription.expires_at);
      const now = new Date();
      const threeDaysFromNow = addDays(now, 3);
      
      // Calculate days remaining
      daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if notification should be sent (3 days or 1 day before expiry)
      if (daysRemaining <= 3 && daysRemaining > 0) {
        notificationDue = true;
      }
    }

    return new Response(
      JSON.stringify({
        isSubscribed: activeSubscription !== null,
        subscription: activeSubscription,
        notificationDue,
        daysRemaining,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in check-subscription function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
