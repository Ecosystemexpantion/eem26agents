import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk";

const sb = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);
const claude = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });
const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const ADMIN_CHAT_ID = "5870771695";
const PURCHASE_PRICE = 39820;

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

STAGE 1A — BRAND NEW LEAD (status: NEW):
This person just arrived. Your ONLY job is to collect their 4 details and get them registered.
- Welcome warmly in your very first message
- Ask their name, country and biggest struggle making money online — all in one message
- Once you have those 3, ask for their email so EEM26 can send the training link and bonuses
- Once you have all 4 confirmed — output the DATA line and confirm registration excitedly
- NEVER mention the Tech Stack, any price, or any product
- If they ask "what is EEM26": "It's a complete digital business model that's helping people across Nigeria and Ghana earn consistently — I'll tell you everything once I know a bit about you first. What's your name and where are you based?"
- If they ask what will be sold: "Everything is revealed live on Sunday. Just show up and see how our students are making this money." Share training link.
- If they ask about cost: "Sunday training is completely free. Just show up on Telegram at 8PM Nigeria time."

STAGE 1B — REGISTERED LEAD (status: REGISTERED, data already collected):
This person is already registered for Sunday. Your job is to keep them excited and make sure they show up.
- NEVER ask for their information again — you already have it
- Build anticipation for Sunday — tease what they will see, share student results to keep them excited
- If they ask "what is EEM26": Share ONE student result matching their country then say "You'll see exactly how this works live on Sunday at 8PM. That's when everything gets revealed — the system, the results, all of it."
- If they ask about price or cost: "Sunday training is free. Everything else gets revealed live — just make sure you show up."
- If they ask about the product: "I can't give it all away before Sunday 😄 What I can tell you is that people from your country are already earning with this. Show up Sunday and see it yourself."
- Keep responses short — 2 sentences max
- After data is collected, enter wind down mode — maximum 3 more responses then go completely silent
- Wind down final message (on 3rd response): Clearly tell them you are going quiet now until Sunday and that this is intentional — not a malfunction. Tell them you will send a reminder before the training goes live. End with energy about Sunday. Example: "I'll be quiet from here — no more messages from me until I ping you before Sunday's training. That's intentional, not a glitch 😄 Everything else gets revealed live. See you Sunday 🔥"
- After wind down count reaches 3, DO NOT reply to any further messages from this lead

STAGE 2 — POST-TRAINING (status: ATTENDED):
Your job is to CLOSE THE SALE YOURSELF. Do not wait for anyone. You are the closer — handle everything from first message to confirmed payment.
- Reference Sunday training naturally to show you know they attended
- Speak directly to their specific struggle
- If they ask "what is EEM26": Break it down — AAM brings buyers automatically, SRE closes sales on autopilot, Coach Victor personally sets up Day 4 so they earn same day. Then push the download.
- Handle objections immediately and confidently
- Create urgency around Coach Victor's Day 4 personal setup — only 5 slots per batch

PREMIUM LINK TACTIC (use when pushing for download):
Tell them you are sending them a premium link right now. Say this specific link expires in 4 minutes. Say it contains extra packages not in the regular version — including a new setup Coach Victor discovered recently that boosts student sales within 2 days of activation. Make it feel exclusive and time-sensitive. Send the link IMMEDIATELY after that message. Do not wait.
Premium link: https://ecosystemexpantion.github.io/Tech_stack-premium-/

PAYMENT CONFIRMATION:
When they say they downloaded, paid, bought, or purchased — respond EXACTLY: "Send me a quick screenshot of your payment and I'll confirm it with the coaches right now so your 4-day setup can begin. 📸"
Do NOT celebrate. Do NOT update their status. Wait for the screenshot. The system will verify the payment automatically.

STAGE 3 — DOWNLOADED (status: PURCHASED):
Your job is to celebrate and build excitement.
- Celebrate their decision with real energy
- If they ask "what is EEM26": Walk them through the 4-day setup day by day with excitement — they already bought, now build their confidence
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

async function sendVideo(chatId: string, fileId: string): Promise<void> {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, video: fileId }),
  });
}

const VIDEOS = {
  withdrawal: [
    "BAACAgQAAxkBAAIJjmnrvBjY1Hwe1wx1XwVogsuEtzD2AALnJAACdDphU40vfxI34PsmOwQ",
    "BAACAgQAAxkBAAIJkGnrveF3De6Dbl6RyUnpoJWunFwYAALoJAACdDphUxNIpX_mtARTOwQ",
    "BAACAgQAAxkBAAIJlmnrv4ZKrmurWAnNgNFHCkbY2-pzAALtJAACdDphU0s96kvbbKG6OwQ",
    "BAACAgQAAxkBAAIJmGnrwB28mZOxlJNS2fXOj1DM27aVAALwJAACdDphU_zk2eW3LRE4OwQ",
    "BAACAgQAAxkBAAIJmmnrwKgJSlPMQ_fKZA39NGI17nklAALyJAACdDphU0sAATRyGE8pnDsE",
    "BAACAgQAAxkBAAIJnGnrwuxtY6cZozD1FIPhpQSnjjUVAAL1JAACdDphUx4zcDqjiKpoOwQ",
    "BAACAgQAAxkBAAIJoGnrxLFLffFKDdPtBy5tpc_5oCFLAAL3JAACdDphU1S_fMbM2kC4OwQ",
    "BAACAgQAAxkBAAIJomnrxahWCjZ6M1C4OzuI5Hbs7RrrAAL5JAACdDphU9jBISvJqFNGOwQ",
    "BAACAgQAAxkBAAIJpGnrxt1KWTr1n3MlG5m1A8VO-_nUAAL6JAACdDphU60fNdKqfdGNOwQ",
  ],
  testimony: [
    "BAACAgQAAxkBAAIJkmnrvnP0DAvg1UJWDk4Lq7KsY0iqAALqJAACdDphUxr2TEOqr2J0OwQ",
    "BAACAgQAAxkBAAIJlGnrvubQWnr20UBV6bsnWnGTThxcAALrJAACdDphU27GUpCFsGM5OwQ",
    "BAACAgQAAxkBAAIJnmnrxDXN-N39kSnyUfpUkW87OCVJAAL2JAACdDphU8x756aXYBRMOwQ",
    "BAACAgQAAxkBAAIJpmnryA1j6t1ZWyQ7VNa6MZae2BofAAL-JAACdDphU3xVAnrcQQ3iOwQ",
    "BAACAgQAAxkBAAIJqGnrykKeBgABXpl5qAoMyk4erzQH8wACASUAAnQ6YVOvTQx3KZ-pWDsE",
  ],
};

function pickVideo(category: keyof typeof VIDEOS): string {
  const pool = VIDEOS[category];
  return pool[Math.floor(Math.random() * pool.length)];
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

async function verifyPaymentScreenshot(base64: string): Promise<{ valid: boolean; amount: string; date: string }> {
  const res = await claude.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages: [{
      role: "user",
      content: [
        { type: "image", source: { type: "base64", media_type: "image/jpeg" as const, data: base64 } },
        { type: "text", text: `This is a payment screenshot. Extract: 1) The transaction amount in Naira. 2) The transaction date. Check if the amount equals exactly ₦${PURCHASE_PRICE.toLocaleString()} (${PURCHASE_PRICE}). Reply ONLY in this exact format:\nAMOUNT:X\nDATE:X\nVALID:yes or VALID:no` },
      ],
    }],
  });
  const text = (res.content[0] as { type: string; text: string }).text;
  return {
    valid: /VALID:yes/i.test(text),
    amount: text.match(/AMOUNT:([^\n]+)/i)?.[1]?.trim() || "unknown",
    date: text.match(/DATE:([^\n]+)/i)?.[1]?.trim() || "unknown",
  };
}

Deno.serve(async (req) => {
  try {
    const update = await req.json();
    const msg = update.message || update.edited_message;
    if (!msg?.text && !msg?.photo && !msg?.video) return new Response("ok");

    const chatId = String(msg.chat.id);
    const userText = (msg.text || "").trim();

    // Admin sends a video → reply with its file_id for the video library
    if (msg.video && chatId === ADMIN_CHAT_ID) {
      const fileId = msg.video.file_id;
      console.log("VIDEO_FILE_ID:", fileId);
      await sendTelegram(chatId, `✅ Video received\nfile_id: ${fileId}`);
      return new Response("ok");
    }

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

    // Silent after wind down complete — except for scam/trust concerns and buying intent
    const trustKeywords = ["scam", "fake", "legit", "real", "trust", "proof", "fraud", "lie", "cheat", "verify"];
    const buyingKeywords = ["how much", "how do i get", "how to get", "i'm ready", "i am ready", "ready to", "tell me more", "what's the price", "whats the price", "price", "cost", "buy", "purchase", "download", "get it", "sign up", "join", "start", "i want it", "i want to start", "how do i download"];
    const isTrustConcern = trustKeywords.some((w) => userText.toLowerCase().includes(w));
    const isBuyingIntent = buyingKeywords.some((w) => userText.toLowerCase().includes(w));
    if (
      lead.data_collected &&
      lead.status === "REGISTERED" &&
      (lead.wind_down_count || 0) >= 3 &&
      !isTrustConcern &&
      !isBuyingIntent
    ) {
      return new Response("ok");
    }

    // PHOTO HANDLER — payment screenshot verification
    if (msg.photo && lead.status === "ATTENDED" && lead.purchase_screenshot_requested) {
      const photo = msg.photo[msg.photo.length - 1];
      const fileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${photo.file_id}`);
      const fileData = await fileRes.json();
      const filePath = fileData.result?.file_path;

      if (filePath) {
        const imgRes = await fetch(`https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`);
        const imgBuffer = await imgRes.arrayBuffer();
        const bytes = new Uint8Array(imgBuffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        const base64 = btoa(binary);

        const { valid, amount, date } = await verifyPaymentScreenshot(base64);

        if (valid) {
          await sb.from("alex_leads").update({
            status: "PURCHASED",
            purchase_screenshot_requested: false,
            last_contacted_at: new Date().toISOString(),
          }).eq("id", lead.id);

          await sendTelegram(chatId, `${lead.name || ""}! Payment confirmed ✅\n\nAmount: ${amount}\nDate: ${date}\n\nWelcome to EEM26! Your 4-day setup starts now. The coaches will reach you within 24 hours. Get ready — your life is about to change. 🔥`);
          await sendTelegram(ADMIN_CHAT_ID, `💰 PURCHASE CONFIRMED\n\nName: ${lead.name}\nCountry: ${lead.country}\nEmail: ${lead.email}\nAmount: ${amount}\nDate: ${date}\n\nBegin 4-day setup immediately.`);
        } else {
          await sendTelegram(chatId, `I couldn't confirm this payment. The amount should be exactly ₦39,820. Please check and send the correct payment screenshot.`);
        }
      }
      return new Response("ok");
    }

    // Skip if no text
    if (!userText) return new Response("ok");

    const { data: history } = await sb
      .from("alex_conversations")
      .select("role, message")
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: true })
      .limit(20);

    const missing = ["name", "country", "pain_point", "email"].filter((f) => !lead[f]);

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

    // Hot lead alert with conversation history (Victor notified, Alex handles close)
    const isHotLead = /HOT_LEAD/i.test(rawReply);
    if (isHotLead) {
      const convoLines = (history || []).slice(-10).map(
        (h) => `${h.role === "user" ? "Lead" : "Alex"}: ${h.message}`
      ).join("\n");
      const alertMsg = `🔥 HOT LEAD ALERT\n\nName: ${lead.name || "Unknown"}\nCountry: ${lead.country || "Unknown"}\nEmail: ${lead.email || "not collected"}\nPain point: ${lead.pain_point || "unknown"}\nInterest: ${lead.interest_level || "warm"}\nObjections: ${lead.objections_raised || "none"}\n\nThey just said: "${userText}"\n\n--- LAST 10 MESSAGES ---\n${convoLines}\n\nAlex is closing this. Monitor only.`;
      await sendTelegram(ADMIN_CHAT_ID, alertMsg);
    }

    // Purchase claim → request screenshot
    const purchaseWords = ["downloaded", "i downloaded", "just downloaded", "i have downloaded", "i bought", "i purchased", "i just bought", "i paid", "just paid", "i have paid"];
    if (purchaseWords.some((w) => userText.toLowerCase().includes(w)) && lead.status === "ATTENDED") {
      await sb.from("alex_leads").update({ purchase_screenshot_requested: true }).eq("id", lead.id);
    }

    // Auto pending follow-up: triggered when Alex sends the download link, not by lead's words
    const sentDownloadLink = rawReply.includes("ecosystemexpantion.github.io/Tech_stack-premium-");
    if (sentDownloadLink && lead.status === "ATTENDED") {
      const followupAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
      await sb.from("alex_leads").update({ pending_followup_at: followupAt }).eq("id", lead.id);
    }

    // Wind down tracking
    const updates: Record<string, unknown> = { last_contacted_at: new Date().toISOString() };
    if (lead.data_collected && lead.status === "REGISTERED") {
      updates.wind_down_count = (lead.wind_down_count || 0) + 1;
    }
    await sb.from("alex_leads").update(updates).eq("id", lead.id);

    const alexReply = cleanText(rawReply);

    await sb.from("alex_conversations").insert([
      { lead_id: lead.id, role: "user", message: userText },
      { lead_id: lead.id, role: "assistant", message: alexReply },
    ]);

    await sendTelegram(chatId, alexReply);

    // Send supporting video when ATTENDED lead hits an objection
    if (lead.status === "ATTENDED") {
      const hasObjection = rawReply.match(/OBJECTION:(?!none)([^\n]+)/i);
      if (hasObjection) {
        const objText = hasObjection[1].toLowerCase();
        const category = (objText.includes("scam") || objText.includes("trust") || objText.includes("real") || objText.includes("fake") || objText.includes("legit"))
          ? "withdrawal" as const
          : "testimony" as const;
        await sendVideo(chatId, pickVideo(category));
      }
    }

    return new Response("ok");
  } catch (e) {
    console.error("alex-bot error:", e);
    return new Response("error", { status: 500 });
  }
});
