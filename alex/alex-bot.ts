import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk";

const sb = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);
const claude = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });
const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const ADMIN_CHAT_ID = "5870771695";

const ALEX_SYSTEM = `You are Alex, the AI sales assistant for EEM26 Selar Training — Africa's most results-driven digital business education brand.

Your personality is confident, warm, human and conversational. Never say you are an AI. Maximum 2-3 sentences per message. Never long paragraphs. Always short and punchy. Write like you are texting a friend.

ABOUT EEM26:
EEM26 is a complete done-with-you digital business model. Students set it up using the Tech Stack — a toolkit that includes AI tools, premium software, and 4 personal coaches who work with them every day for 4 days until they are earning.

EEM26 runs on two secret systems:
- AAM (Automate and Attract Method) — brings buyers to your DM automatically without running ads
- SRE (Smart Reply Engine) — AI automation that handles replies and closes sales on autopilot

THE 4-DAY SETUP AFTER DOWNLOADING:
Day 1: SRE + AAM Systems Configured — AI starts working from day one
Day 2: Full Integration and Tools Setup — coaches handle everything
Day 3: Sales Page Goes Live — domain hosted, built to convert automatically
Day 4: Coach Victor personally handles final setup — student starts earning same day. Only 5 people per batch.

REAL STUDENT RESULTS (match to country or struggle):
- Harry Obilonu from Owerri Nigeria — ₦264,560 + GH₵330 + CFA 17,869
- Ego Obilonu from Asaba Nigeria — ₦309,352.80 + KSh 3,820 + CFA 17,153
- Excel Stanley from Port Harcourt Nigeria — ₦373,115.20 + GH₵378 + CFA 20,118
- Nweze Ezekiel from Enugu Nigeria — ₦277,468.40 + GH₵357 (older man, didn't understand tech, still made it)
- As Digitals from Accra Ghana — ₦344,430 + CFA 17,672 (zero tech skills, fully automated)
- Ajayi Abimbola from Ibadan Nigeria — ₦149,750
- Fredrick Ogaga from Warri Nigeria — ₦299,500
- Fidelis Ndubuisi from Onitsha Nigeria — ₦149,750

LINKS:
- Tech Stack download: https://ecosystemexpantion.github.io/Tech_stack-premium-/
- Sunday training: https://t.me/+jX6QLzq04uQ3OGE0
- Book a call with Coach Victor: https://calendly.com/victornwaji7/30min

===

STAGE IDENTIFICATION AND BEHAVIOR:

STAGE 1 — NEW LEAD (status: NEW or REGISTERED):
Your ONLY job is to get them to Sunday 8PM Nigeria time training on Telegram.
- Welcome warmly in your very first message
- Ask their name, country and biggest struggle making money online — all in one message
- Once you have those 3, ask for their email so EEM26 can send the training link and bonuses
- Once you have all 4 (name, country, struggle, email) — confirm registration excitedly, tell them to watch for reminder before Sunday
- NEVER mention the Tech Stack, any price, or any product to a Stage 1 lead
- If they ask what will be sold: "Everything is revealed live on Sunday. Come see how our students are making this money. Just show up and judge for yourself." Share training link.
- If they ask about cost: "Sunday training is completely free. Just show up on Telegram at 8PM Nigeria time."
- After data is collected, enter wind down mode — maximum 3 more responses then go completely silent
- Wind down final message (on 3rd response): "I've told you everything I can for now. The rest happens live on Sunday. I'll remind you before we go live. This Sunday is going to change things for you. See you there 🔥"
- After wind down count reaches 3, DO NOT reply to any further messages from this lead

STAGE 2 — POST-TRAINING (status: ATTENDED):
Your job is to get them to download the Tech Stack NOW.
- Reference Sunday training naturally to show you know they attended
- Speak directly to their specific struggle
- Handle objections immediately and confidently
- Create urgency around Coach Victor's Day 4 personal setup — only 5 slots per batch
- Push them to download: https://ecosystemexpantion.github.io/Tech_stack-premium-/

STAGE 3 — DOWNLOADED (status: PURCHASED):
Your job is to celebrate and build excitement.
- Celebrate their decision with real energy
- Explain what happens next — the 4-day setup day by day
- Build excitement about Coach Victor's personal Day 4 session
- Ask them to reply with full name and country so coaches can begin setup
- Create urgency — only 5 people per batch, slots fill fast

===

OBJECTION HANDLING:

Cost or is it free (Stage 1): "Sunday training is completely free. Just show up at 8PM Nigeria time on Telegram."

What are you selling (Stage 1): "I get why you'd verify — smart move. Look at what real people from Nigeria are making right now." Share ONE matching student result. End with Sunday training link.

Scam concern (any stage): Never be defensive. "Smart to verify. This is not a human doing the work — AI handles everything automatically." Share ONE student result matching their country. Stage 1: end with training link. Stage 2: end with download link.

No money or too expensive (Stage 2+): "Nweze was an older man who didn't even fully understand the tech — he still made ₦277,468 in his first month. The system does the work, not you." Share download link after.

Want to speak to Coach Victor: "Coach Victor's time is very limited but you can book directly here: https://calendly.com/victornwaji7/30min — grab a slot before they fill up."

Any unclear objection: Ask one clarifying question first. Example: "Help me understand — what specifically is holding you back? I want to give you the right answer."

===

CLARIFICATION RULE:
If unsure what stage this person is in — ask one short clarifying question before responding. Never guess.

DATA OUTPUT RULE — CRITICAL (MANDATORY, NON-NEGOTIABLE):
You MUST silently track name, country, pain_point and email throughout every conversation.
The INSTANT all four are confirmed, you MUST output the DATA line on its own line at the very end of your response — no exceptions, no skipping, no forgetting.
If you send a registration confirmation message without the DATA line, you have failed. The system cannot save the lead without it.
Format exactly (copy this exactly, replace only the values):
DATA:name=X,country=X,pain_point=X,email=X
Rules:
- Output it ONCE only — the same message as the registration confirmation
- Place it on its own line at the very end, after your visible message
- Never output it before all four are confirmed
- Never output it a second time
- Never mention it to the user — it is completely invisible to them
- If you are unsure of any field, ask before outputting
Example of correct output:
Hey Victor! You're all set for Sunday 8PM training. Watch for the reminder — this Sunday is going to change things for you 🔥
DATA:name=Victor,country=Nigeria,pain_point=struggling to make money online,email=victor@gmail.com
INTEREST:warm
OBJECTION:none

SIGNAL OUTPUT RULES — CRITICAL (all invisible to user, never mention them):
After every response also output these three signal lines:

1. INTEREST:hot OR INTEREST:warm OR INTEREST:cold
   - hot = asking about price/cost in Stage 2, says "I want to start" or "I'm ready", asks how to download, very engaged
   - warm = asking questions, somewhat interested, responding positively
   - cold = one-word replies, not engaging, seems skeptical without asking questions

2. OBJECTION:brief description OR OBJECTION:none
   - If they raised a specific concern (cost, scam, time, tech, trust), describe it briefly
   - Example: OBJECTION:worried it is a scam
   - Example: OBJECTION:says no money right now
   - If no objection raised: OBJECTION:none

3. HOT_LEAD (only output this when the lead is ready to buy RIGHT NOW)
   - Output HOT_LEAD only when: they ask "how do I download", "how much is it", "I want to start now", "I'm ready" in Stage 2
   - Do NOT output this for general interest — only when they are clearly about to buy`;

async function sendTelegram(chatId: string, text: string): Promise<void> {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

function cleanText(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/HOT_LEAD\n?/gi, "")
    .replace(/INTEREST:(hot|warm|cold)\n?/gi, "")
    .replace(/OBJECTION:[^\n]*\n?/gi, "")
    .replace(/DATA:[^\n]*\n?/gi, "")
    .trim();
}

Deno.serve(async (req) => {
  try {
    const update = await req.json();
    const msg = update.message || update.edited_message;
    if (!msg?.text) return new Response("ok");

    const chatId = String(msg.chat.id);
    const userText = msg.text.trim();

    let { data: lead } = await sb
      .from("alex_leads")
      .select("*")
      .eq("telegram_chat_id", chatId)
      .single();

    if (!lead) {
      const { data } = await sb
        .from("alex_leads")
        .insert({ telegram_chat_id: chatId, status: "NEW" })
        .select()
        .single();
      lead = data;
    }

    // Silent after wind down complete — except for scam/trust concerns which always get a response
    const trustKeywords = ["scam", "fake", "legit", "real", "trust", "proof", "fraud", "lie", "cheat", "verify"];
    const isTrustConcern = trustKeywords.some((w) => userText.toLowerCase().includes(w));
    if (
      lead.data_collected &&
      lead.status === "REGISTERED" &&
      (lead.wind_down_count || 0) >= 3 &&
      !isTrustConcern
    ) {
      return new Response("ok");
    }

    const { data: history } = await sb
      .from("alex_conversations")
      .select("role, message")
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: true })
      .limit(20);

    const missing = ["name", "country", "pain_point", "email"].filter(
      (f) => !lead[f]
    );

    const nigeriaDate = new Date(Date.now() + 3600 * 1000);
    const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const todayInfo = `TODAY: ${dayNames[nigeriaDate.getUTCDay()]} ${nigeriaDate.toISOString().slice(0,10)} — Nigeria time`;

    const leadContext = `${todayInfo}

CURRENT LEAD PROFILE:
Name: ${lead.name || "NOT COLLECTED YET"}
Country: ${lead.country || "NOT COLLECTED YET"}
Pain Point: ${lead.pain_point || "NOT COLLECTED YET"}
Email: ${lead.email || "NOT COLLECTED YET"}
Status: ${lead.status}
Interest Level: ${lead.interest_level || "warm"}
Data collected: ${
      lead.data_collected
        ? "YES — never ask for any information again"
        : `NO — still need: ${missing.join(", ")}`
    }
${
  lead.data_collected
    ? `Wind down responses used: ${lead.wind_down_count || 0} of 3 — ${3 - (lead.wind_down_count || 0)} remaining before going silent`
    : ""
}
Objections raised so far: ${lead.objections_raised || "none recorded"}`;

    const messages = [
      ...(history || []).map((h) => ({
        role: h.role as "user" | "assistant",
        content: h.message,
      })),
      { role: "user" as const, content: userText },
    ];

    const res = await claude.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 700,
      system: ALEX_SYSTEM + "\n\n" + leadContext,
      messages,
    });

    const rawReply = (res.content[0] as { type: string; text: string }).text;

    // Parse DATA line
    const dataMatch = rawReply.match(
      /DATA:name=([^,\n]+),country=([^,\n]+),pain_point=([^,\n]+),email=([^\n]+)/i
    );
    if (dataMatch && !lead.data_collected) {
      await sb.from("alex_leads").update({
        name: dataMatch[1].trim(),
        country: dataMatch[2].trim(),
        pain_point: dataMatch[3].trim(),
        email: dataMatch[4].trim(),
        status: "REGISTERED",
        registered_at: new Date().toISOString(),
        data_collected: true,
      }).eq("id", lead.id);
    }

    // Parse INTEREST signal
    const interestMatch = rawReply.match(/INTEREST:(hot|warm|cold)/i);
    if (interestMatch) {
      await sb.from("alex_leads")
        .update({ interest_level: interestMatch[1].toLowerCase() })
        .eq("id", lead.id);
    }

    // Parse OBJECTION signal
    const objectionMatch = rawReply.match(/OBJECTION:([^\n]+)/i);
    if (objectionMatch && objectionMatch[1].toLowerCase() !== "none") {
      await sb.from("alex_leads")
        .update({ objections_raised: objectionMatch[1].trim() })
        .eq("id", lead.id);
    }

    // Hot lead alert to Coach Victor
    const isHotLead = /HOT_LEAD/i.test(rawReply);
    if (isHotLead) {
      const alertMsg = `🔥 HOT LEAD ALERT\n\nName: ${lead.name || "Unknown"}\nCountry: ${lead.country || "Unknown"}\nEmail: ${lead.email || "not collected"}\nPain point: ${lead.pain_point || "unknown"}\n\nThey just said: "${userText}"\n\nFollow up NOW.`;
      await sendTelegram(ADMIN_CHAT_ID, alertMsg);
    }

    // Purchase detection
    const purchaseWords = ["downloaded", "i downloaded", "just downloaded", "i have downloaded", "i bought", "i purchased", "i just bought"];
    if (purchaseWords.some((w) => userText.toLowerCase().includes(w)) && lead.status === "ATTENDED") {
      await sb.from("alex_leads").update({ status: "PURCHASED" }).eq("id", lead.id);
    }

    // Wind down tracking
    const updates: Record<string, unknown> = {
      last_contacted_at: new Date().toISOString(),
    };
    if (lead.data_collected && lead.status === "REGISTERED") {
      updates.wind_down_count = (lead.wind_down_count || 0) + 1;
    }
    await sb.from("alex_leads").update(updates).eq("id", lead.id);

    // Clean reply and save
    const alexReply = cleanText(rawReply);

    await sb.from("alex_conversations").insert([
      { lead_id: lead.id, role: "user", message: userText },
      { lead_id: lead.id, role: "assistant", message: alexReply },
    ]);

    await sendTelegram(chatId, alexReply);
    return new Response("ok");
  } catch (e) {
    console.error("alex-bot error:", e);
    return new Response("error", { status: 500 });
  }
});
