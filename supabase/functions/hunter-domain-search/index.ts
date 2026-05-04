import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { domain, company, limit, department, seniority } = await req.json();
    if (!domain && !company) {
      return new Response(JSON.stringify({ error: "domain or company is required" }), {
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

    const params = new URLSearchParams({ api_key: apiKey, limit: String(limit ?? 10) });
    if (domain) params.set("domain", domain);
    if (company) params.set("company", company);
    const depts = Array.isArray(department) ? department.join(",") : department;
    const senrs = Array.isArray(seniority) ? seniority.join(",") : seniority;
    if (depts) params.set("department", depts);
    if (senrs) params.set("seniority", senrs);

    const r = await fetch(`https://api.hunter.io/v2/domain-search?${params}`);
    const json = await r.json();

    if (!r.ok) {
      return new Response(JSON.stringify({ error: json?.errors?.[0]?.details || "Search failed" }), {
        status: r.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const d = json.data ?? {};
    const normalized = {
      domain: d.domain,
      organization: d.organization,
      emails: (d.emails ?? []).map((e: any) => ({
        email: e.value,
        firstName: e.first_name,
        lastName: e.last_name,
        position: e.position,
        department: e.department,
        seniority: e.seniority,
        confidence: e.confidence,
      })),
    };

    return new Response(JSON.stringify(normalized), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
