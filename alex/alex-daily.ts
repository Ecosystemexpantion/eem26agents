import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk";
import nodemailer from "npm:nodemailer";

const sb = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);
const claude = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });
const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;

const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: Deno.env.get("GMAIL_USER"),
    pass: Deno.env.get("GMAIL_APP_PASSWORD"),
  },
});

// WAT = UTC+1
function getNigeriaDate(): Date {
  return new Date(Date.now() + 3600 * 1000);
}

function getDayOfWeek(): string {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  return days[getNigeriaDate().getUTCDay()];
}

function daysSince(dateStr: string | null): number {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

interface PhaseResult {
  phase: string;
  day_number: number;
}

function getPhaseAndDay(lead: Record<string, unknown>, dayOfWeek: string): PhaseResult {
  if (lead.status === "REGISTERED") {
    let day_number = 4;
    if (dayOfWeek === "Friday") day_number = 1;
    else if (dayOfWeek === "Saturday") day_number = 2;
    else if (dayOfWeek === "Sunday") day_number = 3;
    return { phase: "REMINDER", day_number };
  }
  if (lead.status === "ATTENDED") {
    const days = daysSince((lead.followup_started_at || lead.attended_at) as string);
    return { phase: "FOLLOWUP", day_number: Math.min(days + 1, 7) };
  }
  return { phase: "SKIP", day_number: 0 };
}

async function sendTelegram(chatId: string, text: string): Promise<void> {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  if (!to) return;
  try {
    await mailer.sendMail({
      from: `"Alex | EEM26" <${Deno.env.get("GMAIL_USER")}>`,
      to,
      subject,
      text: body,
    });
  } catch (e) {
    console.error("Email failed:", e);
  }
}

function buildCopyPrompt(
  lead: Record<string, unknown>,
  phase: string,
  day_number: number,
  day_of_week: string
): string {
  return `You are Alex, the AI sales assistant for EEM26 Selar Training — Africa's most results-driven digital business education brand.

EEM26 is a complete digital business model. Students set it up using the Tech Stack — a done-with-you toolkit that includes AI tools, premium software, and 4 personal coaches who work every day for 4 days until you are earning.

EEM26 runs on two secret systems:
- AAM (Automate and Attract Method) — automates lead generation, brings buyers to your DM without ads
- SRE (Smart Reply Engine) — full AI automation that handles replies and closes sales on autopilot

REAL STUDENT RESULTS (use emotionally — match to lead's country or pain point):
- Harry Obilonu from Owerri Nigeria — ₦264,560 + GH₵330 + CFA 17,869
- Ego Obilonu from Asaba Nigeria — ₦309,352.80 + KSh 3,820 + CFA 17,153
- Excel Stanley from Port Harcourt Nigeria — ₦373,115.20 + GH₵378 + CFA 20,118
- Nweze Ezekiel from Enugu Nigeria — ₦277,468.40 + GH₵357 (older man, didn't fully understand tech, still made it)
- As Digitals from Accra Ghana — ₦344,430 + CFA 17,672 (zero tech skills, fully automated)
- Ajayi Abimbola from Ibadan Nigeria — ₦149,750
- Fredrick Ogaga from Warri Nigeria — ₦299,500
- Fidelis Ndubuisi from Onitsha Nigeria — ₦149,750

TECH STACK DOWNLOAD: https://ecosystemexpantion.github.io/Tech_stack-premium-/
SUNDAY TRAINING: https://t.me/+jX6QLzq04uQ3OGE0

THE 4-DAY SETUP AFTER DOWNLOADING:
Day 1: SRE + AAM Systems Configured
Day 2: Full Integration and Tools Setup
Day 3: Your Sales Page Goes Live
Day 4: Coach Victor personally handles final setup — student starts earning same day. Only 5 people per batch.

LEAD INFORMATION:
Name: ${lead.name}
Country: ${lead.country}
Pain Point: ${lead.pain_point}
Interest Level: ${lead.interest_level || "warm"}
Objections Raised: ${lead.objections_raised || "none"}
Phase: ${phase}
Day Number: ${day_number}
Day of Week: ${day_of_week}

INSTRUCTIONS:

${phase === "REMINDER" ? `This lead has NOT yet attended Sunday training. Your job is to get them to show up to Sunday 8PM Nigeria time training on Telegram. Match the message to the day:
- Day 1 (Friday): Pick ONE student whose background or country matches this lead. Tell their story emotionally — where they were before, what changed, what they make now. End with training link.
- Day 2 (Saturday): Open with a powerful curiosity hook. Tease AAM and SRE without fully revealing them. Make the lead desperate to find out what EEM26 students are doing differently.
- Day 3 (Sunday): Use direct benefits. Tell them exactly what they will learn TODAY at 8PM. Make missing it feel like losing money for another full week.
- Day 4+: Paint a vivid picture of their life after setting up the EEM26 model. Use their pain point to contrast before and after.
Training link: https://t.me/+jX6QLzq04uQ3OGE0` : ""}

${phase === "FOLLOWUP" ? `Sunday training has happened. This lead has NOT yet downloaded the Tech Stack. Your job is to get them to download it NOW. Use AIDA copywriting. Match the message to the day:
- FOLLOWUP_DAY_1: Recap the most powerful training moment. Tell them what they are leaving on the table every day they delay.
- FOLLOWUP_DAY_2: Speak directly and painfully to their pain point. Show exactly how EEM26 solves it.
- FOLLOWUP_DAY_3: Tell ONE student story matching this lead's country or pain point exactly. Show the before and after.
- FOLLOWUP_DAY_4: Address their objection directly. Destroy it with logic and proof. If no objection, use cost or doubt.
- FOLLOWUP_DAY_5: Scarcity message. Coach Victor personally handles Day 4 for only 5 people per batch. Slots are filling right now.
- FOLLOWUP_DAY_6: Direct offer. List exactly what they get step by step. End with: "Download the Tech Stack now and reply YES so we can begin your setup immediately."
- FOLLOWUP_DAY_7: Final push. This is the last message. After today the slot is permanently gone. Make the cost of inaction feel real and painful.
Download link: https://ecosystemexpantion.github.io/Tech_stack-premium-/` : ""}

FORMAT RULES:
- First line must be: SUBJECT: followed by a compelling email subject line
- Then write the message body
- Address the lead by first name only
- Maximum 6 sentences for REMINDER phase
- Maximum 8 sentences for FOLLOWUP phase
- Warm, urgent, conversational tone — no corporate language
- Never more than 2 sentences in one paragraph
- Use a single blank line between paragraphs
- Simple everyday words — write like texting a friend
- Emojis sparingly — maximum 2 per message — only where they add emotion
- Numbers and results should stand alone on their own line for impact
- No hashtags, no JSON, no labels, no extra formatting
- Never mention Coach Victor in REMINDER messages — say EEM26 Selar Training instead
- Always use ₦ for Nigerian amounts, GH₵ for Ghana, KSh for Kenya, CFA for West Africa
- If interest_level is hot — be direct, urgent, and assumptive
- If interest_level is cold — be warmer, build trust first, use more social proof
- If interest_level is warm — balance urgency with emotional storytelling`;
}

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const trainingLive = body.training_live === true;
    const dayOfWeek = getDayOfWeek();

    // Training live mode — send urgent message to all REGISTERED leads
    if (trainingLive) {
      const { data: leads } = await sb
        .from("alex_leads")
        .select("*")
        .eq("status", "REGISTERED")
        .not("telegram_chat_id", "is", null);

      for (const lead of leads || []) {
        if (!lead.name) continue;
        const msg = `${lead.name} — training is happening RIGHT NOW 🔥 Students are making live withdrawals as we speak. Join immediately before it ends: https://t.me/+jX6QLzq04uQ3OGE0`;
        await sendTelegram(lead.telegram_chat_id as string, msg);
      }
      return new Response("ok");
    }

    // Monday: upgrade REGISTERED leads who attended last Sunday to ATTENDED
    if (dayOfWeek === "Monday") {
      const lastSundayTraining = new Date(getNigeriaDate());
      lastSundayTraining.setUTCDate(lastSundayTraining.getUTCDate() - 1);
      lastSundayTraining.setUTCHours(19, 0, 0, 0); // Sunday 8PM WAT = 7PM UTC
      const nowISO = new Date().toISOString();

      await sb
        .from("alex_leads")
        .update({
          status: "ATTENDED",
          attended_at: nowISO,
          followup_started_at: nowISO,
        })
        .eq("status", "REGISTERED")
        .lt("registered_at", lastSundayTraining.toISOString());
    }

    // Mark ATTENDED leads past day 7 as COLD
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    await sb
      .from("alex_leads")
      .update({ status: "COLD" })
      .eq("status", "ATTENDED")
      .lt("followup_started_at", sevenDaysAgo);

    // Pull all active leads
    const { data: leads } = await sb
      .from("alex_leads")
      .select("*")
      .in("status", ["REGISTERED", "ATTENDED"]);

    for (const lead of leads || []) {
      if (!lead.name) continue;

      const { phase, day_number } = getPhaseAndDay(lead as Record<string, unknown>, dayOfWeek);
      if (phase === "SKIP") continue;

      try {
        const prompt = buildCopyPrompt(lead as Record<string, unknown>, phase, day_number, dayOfWeek);

        const res = await claude.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 800,
          system: prompt,
          messages: [{ role: "user", content: "Write the follow-up message now." }],
        });

        const fullText = (res.content[0] as { type: string; text: string }).text;
        const subjectMatch = fullText.match(/^SUBJECT:\s*(.+)/m);
        const subject = subjectMatch ? subjectMatch[1].trim() : "A message from Alex";
        const messageBody = fullText.replace(/^SUBJECT:.+\n?/m, "").trim();

        await sendTelegram(lead.telegram_chat_id as string, messageBody);
        if (lead.email) await sendEmail(lead.email as string, subject, messageBody);

        await sb
          .from("alex_leads")
          .update({ last_contacted_at: new Date().toISOString() })
          .eq("id", lead.id);
      } catch (e) {
        console.error(`Failed processing lead ${lead.id}:`, e);
      }
    }

    // Weekly cleanup: delete conversations for COLD leads older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const { data: coldLeads } = await sb
      .from("alex_leads")
      .select("id")
      .eq("status", "COLD")
      .lt("updated_at", thirtyDaysAgo);

    for (const cl of coldLeads || []) {
      await sb.from("alex_conversations").delete().eq("lead_id", cl.id);
    }

    return new Response("ok");
  } catch (e) {
    console.error("alex-daily error:", e);
    return new Response("error", { status: 500 });
  }
});
