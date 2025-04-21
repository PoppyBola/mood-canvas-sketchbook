
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function.
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Check if the user is authenticated
    const { data: { session } } = await supabaseClient.auth.getSession()
    if (!session) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401 
        }
      )
    }

    // Process the form data
    const formData = await req.formData()
    const file = formData.get('file')
    const moodTag = formData.get('moodTag')

    if (!file || !(file instanceof File) || !moodTag) {
      return new Response(
        JSON.stringify({ error: "Missing file or mood tag" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      )
    }

    // Create a unique file name
    const fileExt = file.name.split('.').pop()
    const fileName = `${moodTag.toString().toLowerCase()}_${Date.now()}.${fileExt}`

    // Upload the file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('mood_images')
      .upload(fileName, file)

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return new Response(
        JSON.stringify({ error: "Failed to upload file: " + uploadError.message }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      )
    }

    // Get the public URL of the uploaded file
    const { data: { publicUrl } } = supabaseClient.storage
      .from('mood_images')
      .getPublicUrl(fileName)

    return new Response(
      JSON.stringify({ 
        success: true, 
        filePath: fileName,
        fileUrl: publicUrl 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    )
  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    )
  }
})
