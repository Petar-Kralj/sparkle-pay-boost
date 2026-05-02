import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { domain, company, firstName, lastName, fullName } = await req.json();
    if ((!domain && !company) || (!fullName && !(firstName && lastName))) {
      return new Response(JSON.stringify({ error: "domain/company and a name are required" }), {
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

    const params = new URLSearchParams({ api_key: apiKey });
    if (domain) params.set("domain", domain);
    if (company) params.set("company", company);
    if (fullName) params.set("full_name", fullName);
    if (firstName) params.set("first_name", firstName);
    if (lastName) params.set("last_name", lastName);

    const r = await fetch(`https://api.hunter.io/v2/email-finder?${params}`);
    const json = await r.json();

    if (!r.ok) {
      return new Response(JSON.stringify({ error: json?.errors?.[0]?.details || "Search failed" }), {
        status: r.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const d = json.data ?? {};
    return new Response(
      JSON.stringify({
        email: d.email,
        firstName: d.first_name,
        lastName: d.last_name,
        position: d.position,
        company: d.company,
        confidence: d.score,
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
