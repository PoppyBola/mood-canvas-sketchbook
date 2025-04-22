
// Daily Mood Reminder Edge Function
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get users who have opted into daily reminders
    const { data: users, error: usersError } = await supabase
      .from('user_preferences')
      .select('user_id, reminder_time')
      .eq('daily_reminder_enabled', true);

    if (usersError) throw usersError;

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users with reminders enabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current time
    const now = new Date();
    const currentHour = now.getUTCHours();
    
    // Find users who should receive a reminder now (matching hour)
    const usersToNotify = users.filter(user => {
      const reminderHour = new Date(user.reminder_time).getUTCHours();
      return reminderHour === currentHour;
    });

    if (usersToNotify.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users to notify at this time' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For demonstration - in a real implementation, you would:
    // 1. Send push notifications via a service like Firebase Cloud Messaging
    // 2. Or deliver notifications via email using a service like Resend
    // 3. Or store notifications in a table for in-app retrieval
    const processedUsers = usersToNotify.map(user => user.user_id);
    
    // In this example, we'll just store the notifications in the database
    const { data: notificationsData, error: notificationsError } = await supabase
      .from('user_notifications')
      .insert(
        processedUsers.map(userId => ({
          user_id: userId,
          title: "How are you feeling today?",
          message: "Take a moment to reflect on your mood and create today's canvas.",
          type: "daily_reminder",
          is_read: false
        }))
      );
    
    if (notificationsError) throw notificationsError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedUsers.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing daily reminders:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
