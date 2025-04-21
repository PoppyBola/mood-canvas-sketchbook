
// Supabase Edge Function to process CSV imports and insert into mood_entries, logging results
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req: Request) => {
  try {
    const { storagePath, userId } = await req.json();
    if (!storagePath || !userId) {
      return new Response(JSON.stringify({ error: "Missing file path or user" }), { status: 400 });
    }

    // Download CSV from storage
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: fileData, error: fileError } = await supabase
      .storage.from('mood_images').download(storagePath);
    if (fileError) throw new Error("Could not download uploaded CSV");

    const csvText = await fileData.text();
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    const expected = ["quote","quote_author","image_path","mood_tags","gradient_classes","description"];
    if (JSON.stringify(headers.map(h=>h.trim())) !== JSON.stringify(expected)) {
      return new Response(JSON.stringify({ error: "CSV headers invalid. Expected: " + expected.join(',') }), { status: 400 });
    }

    let numRows = 0, numOk = 0, numFail = 0, failures: any[] = [];
    for (let i = 1; i < lines.length; ++i) {
      numRows++;
      const cols = lines[i].split(',');
      try {
        const [quote, quote_author, image_path, mood_tags, gradient_classes, description] = cols.map(v => v.trim());
        const tags = mood_tags ? mood_tags.split('|').map(t=>t.trim()) : [];
        const gradients = gradient_classes ? gradient_classes.split('|').map(t=>t.trim()) : [];
        const { error: insErr } = await supabase.from('mood_entries').insert({
          quote, quote_author, image_path, mood_tags:tags, gradient_classes:gradients, description
        });
        if (insErr) { numFail++; failures.push({row:i+1, error:insErr.message}) }
        else numOk++;
      } catch (err) {
        numFail++;
        failures.push({row:i+1, error:err && err.message});
      }
    }

    // Log result
    await supabase.from('import_logs').insert({
      user_id: userId,
      file_name: storagePath.split('/').pop(),
      rows_processed: numRows,
      rows_succeeded: numOk,
      rows_failed: numFail,
      error_log: JSON.stringify(failures),
      status: numFail === 0 ? "completed" : "failed"
    });

    return new Response(JSON.stringify({
      message: `Import finished. Succeeded: ${numOk}, Failed: ${numFail}`,
      failures
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e && e.message }), { status: 500 });
  }
});
