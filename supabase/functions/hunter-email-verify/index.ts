import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const apiKey = Deno.env.get("HUNTER_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const verifyOne = async (email: string) => {
      try {
        const params = new URLSearchParams({ api_key: apiKey, email });
        const r = await fetch(`https://api.hunter.io/v2/email-verifier?${params}`);
        const json = await r.json();
        if (!r.ok) {
          return { email, error: json?.errors?.[0]?.details || "Verification failed" };
        }
        const d = json.data ?? {};
        return {
          email: d.email ?? email,
          status: d.status,
          result: d.result,
          confidence: d.score,
          deliverable: d.status === "valid",
        };
      } catch (err) {
        return { email, error: (err as Error).message };
      }
    };

    // Bulk mode
    if (Array.isArray(body?.emails)) {
      const emails = (body.emails as unknown[])
        .map((e) => String(e).trim())
        .filter((e) => e.length > 0)
        .slice(0, 100);
      if (emails.length === 0) {
        return new Response(JSON.stringify({ error: "emails array is empty" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Run with limited concurrency (5 at a time)
      const results: any[] = [];
      const concurrency = 5;
      for (let i = 0; i < emails.length; i += concurrency) {
        const chunk = emails.slice(i, i + concurrency);
        const r = await Promise.all(chunk.map(verifyOne));
        results.push(...r);
      }
      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Single mode
    const { email } = body;
    if (!email) {
      return new Response(JSON.stringify({ error: "email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const single = await verifyOne(String(email));
    if ((single as any).error) {
      return new Response(JSON.stringify({ error: (single as any).error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(single), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
