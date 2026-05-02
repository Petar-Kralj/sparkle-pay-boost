import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("HUNTER_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const params = new URLSearchParams({ api_key: apiKey, email });
    const r = await fetch(`https://api.hunter.io/v2/email-verifier?${params}`);
    const json = await r.json();

    if (!r.ok) {
      return new Response(JSON.stringify({ error: json?.errors?.[0]?.details || "Verification failed" }), {
        status: r.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const d = json.data ?? {};
    return new Response(
      JSON.stringify({
        email: d.email,
        status: d.status,
        result: d.result,
        confidence: d.score,
        deliverable: d.status === "valid",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
