import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const sb = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async () => {
  try {
    // Find all unsettled sales where settlement time has passed
    const { data: overdueSales } = await sb
      .from("sales")
      .select("id, agent_id, commission, settlement_hours, created_at")
      .eq("settled", false);

    if (!overdueSales || overdueSales.length === 0) {
      return new Response(JSON.stringify({ settled: 0 }), { headers: { "Content-Type": "application/json" } });
    }

    const now = new Date();
    const toSettle = overdueSales.filter((s) => {
      const settleAt = new Date(new Date(s.created_at).getTime() + s.settlement_hours * 60 * 60 * 1000);
      return now >= settleAt;
    });

    if (toSettle.length === 0) {
      return new Response(JSON.stringify({ settled: 0 }), { headers: { "Content-Type": "application/json" } });
    }

    // Mark them settled
    const ids = toSettle.map((s) => s.id);
    await sb.from("sales").update({ settled: true }).in("id", ids);

    // Get unique affected agents
    const agentIds = [...new Set(toSettle.map((s) => s.agent_id))];

    // Recalculate and update each agent's profile
    for (const agentId of agentIds) {
      const { data: allSettled } = await sb
        .from("sales")
        .select("commission")
        .eq("agent_id", agentId)
        .eq("settled", true);

      const { data: allPaid } = await sb
        .from("withdrawals")
        .select("amount")
        .eq("agent_id", agentId)
        .eq("status", "paid");

      const totalEarned = (allSettled || []).reduce((sum, s) => sum + s.commission, 0);
      const totalWithdrawn = (allPaid || []).reduce((sum, w) => sum + w.amount, 0);
      const availableBalance = Math.max(0, totalEarned - totalWithdrawn);

      await sb.from("profiles").update({
        total_earned: totalEarned,
        available_balance: availableBalance,
      }).eq("id", agentId);
    }

    console.log(`Settled ${toSettle.length} sales for ${agentIds.length} agents`);
    return new Response(
      JSON.stringify({ settled: toSettle.length, agents: agentIds.length }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("settle-commissions error:", e);
    return new Response("error", { status: 500 });
  }
});
