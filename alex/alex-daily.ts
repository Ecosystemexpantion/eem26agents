import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk";
import nodemailer from "npm:nodemailer";

const sb = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);
const claude = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });
const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const ADMIN_CHAT_ID = "5870771695";

const GMAIL_ACCOUNTS = [
  { user: Deno.env.get("GMAIL_USER")!, pass: Deno.env.get("GMAIL_APP_PASSWORD")! },
  { user: Deno.env.get("GMAIL_USER_2") || "", pass: Deno.env.get("GMAIL_APP_PASSWORD_2") || "" },
].filter(a => a.user && a.pass);

const mailers = GMAIL_ACCOUNTS.map(a =>
  nodemailer.createTransport({ service: "gmail", auth: { user: a.user, pass: a.pass } })
);

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

function hasScamObjection(lead: Record<string, unknown>): boolean {
  const obj = ((lead.objections_raised as string) || "").toLowerCase();
  return ["scam", "fake", "fraud", "419", "not real"].some(w => obj.includes(w));
}

function getPhaseAndDay(lead: Record<string, unknown>, dayOfWeek: string): { phase: string; day_number: number } {
  if (lead.status === "REGISTERED") {
    const dayMap: Record<string, number> = {
      "Sunday": 1, "Monday": 2, "Tuesday": 3, "Wednesday": 4,
      "Thursday": 5, "Friday": 6, "Saturday": 7,
    };
    return { phase: "REMINDER", day_number: dayMap[dayOfWeek] || 4 };
  }
  if (lead.status === "ATTENDED") {
    const days = daysSince((lead.followup_started_at || lead.attended_at) as string);
    if (hasScamObjection(lead)) {
      if (days >= 7) return { phase: "SKIP", day_number: 0 };
      return { phase: "TRUST_BUILDING", day_number: Math.min(days + 1, 7) };
    }
    if (dayOfWeek === "Wednesday") {
      return { phase: "SETUP_INVITE", day_number: 1 };
    }
    if (days >= 7 && (lead.interest_level === "hot" || lead.interest_level === "warm")) {
      return { phase: "SETUP_INVITE", day_number: 1 };
    }
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

async function sendVideo(chatId: string, fileId: string, caption: string): Promise<void> {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, video: fileId, caption }),
  });
}

const VIDEOS = {
  withdrawal: [
    { fileId: "BAACAgQAAxkBAAIJjmnrvBjY1Hwe1wx1XwVogsuEtzD2AALnJAACdDphU40vfxI34PsmOwQ", caption: "Watch Coach Stanley make a withdrawal of over ₦650k 👀" },
    { fileId: "BAACAgQAAxkBAAIJkGnrveF3De6Dbl6RyUnpoJWunFwYAALoJAACdDphUxNIpX_mtARTOwQ", caption: "You will be surprised how much Coach Victor made this morning 😮" },
    { fileId: "BAACAgQAAxkBAAIJlmnrv4ZKrmurWAnNgNFHCkbY2-pzAALtJAACdDphU0s96kvbbKG6OwQ", caption: "Coach Victor showing his upcoming payout and how much his student made today 💰" },
    { fileId: "BAACAgQAAxkBAAIJmGnrwB28mZOxlJNS2fXOj1DM27aVAALwJAACdDphU_zk2eW3LRE4OwQ", caption: "Coach Victor currently has 1 million naira sitting in his wallet 👀" },
    { fileId: "BAACAgQAAxkBAAIJmmnrwKgJSlPMQ_fKZA39NGI17nklAALyJAACdDphU0sAATRyGE8pnDsE", caption: "Watch how much Coach Victor has made overall — over 40 million naira plus earnings in other currencies 🤯" },
    { fileId: "BAACAgQAAxkBAAIJnGnrwuxtY6cZozD1FIPhpQSnjjUVAAL1JAACdDphUx4zcDqjiKpoOwQ", caption: "Mr Stanley showing his total earned in 2 months — ₦5,275,485 from 246 affiliate sales 📈" },
    { fileId: "BAACAgQAAxkBAAIJoGnrxLFLffFKDdPtBy5tpc_5oCFLAAL3JAACdDphU1S_fMbM2kC4OwQ", caption: "Harry Obilonu made a screen record of his wallet balance 💳" },
    { fileId: "BAACAgQAAxkBAAIJomnrxahWCjZ6M1C4OzuI5Hbs7RrrAAL5JAACdDphU9jBISvJqFNGOwQ", caption: "Watch Ego as she makes a withdrawal of over ₦300k 💸" },
    { fileId: "BAACAgQAAxkBAAIJpGnrxt1KWTr1n3MlG5m1A8VO-_nUAAL6JAACdDphU60fNdKqfdGNOwQ", caption: "Oduye Esther making a withdrawal of over ₦200k live during training 💰" },
  ],
  testimony: [
    { fileId: "BAACAgQAAxkBAAIJkmnrvnP0DAvg1UJWDk4Lq7KsY0iqAALqJAACdDphUxr2TEOqr2J0OwQ", caption: "Halima showing how much she made in just 4 days during our live training 🔥" },
    { fileId: "BAACAgQAAxkBAAIJlGnrvubQWnr20UBV6bsnWnGTThxcAALrJAACdDphU27GUpCFsGM5OwQ", caption: "She was shocked at how much she made on day 6 😱" },
    { fileId: "BAACAgQAAxkBAAIJnmnrxDXN-N39kSnyUfpUkW87OCVJAAL2JAACdDphU8x756aXYBRMOwQ", caption: "Miracle Nelson showing how much he made in a single day after his 4-day setup 🔥" },
    { fileId: "BAACAgQAAxkBAAIJpmnryA1j6t1ZWyQ7VNa6MZae2BofAAL-JAACdDphU3xVAnrcQQ3iOwQ", caption: "We just finished his setup and he already has ₦61k ready to withdraw 🚀" },
    { fileId: "BAACAgQAAxkBAAIJqGnrykKeBgABXpl5qAoMyk4erzQH8wACASUAAnQ6YVOvTQx3KZ-pWDsE", caption: "Coach Victor guiding Oluranti to make her withdrawal of over ₦140k after just 4 days of setup 🙌" },
  ],
};

function pickVideo(category: keyof typeof VIDEOS) {
  const pool = VIDEOS[category];
  return pool[Math.floor(Math.random() * pool.length)];
}

async function sendEmail(to: string, subject: string, body: string, idx = 0): Promise<void> {
  if (!to || !to.trim() || idx >= mailers.length) return;
  try {
    await mailers[idx].sendMail({
      from: `"Alex | EEM26" <${GMAIL_ACCOUNTS[idx].user}>`,
      to,
      subject,
      text: body,
    });
  } catch (e: unknown) {
    const msg = String((e as { message?: string })?.message || e);
    if (msg.includes("Daily") || msg.includes("550") || msg.includes("sending limit")) {
      await sendEmail(to, subject, body, idx + 1); // rotate to next Gmail account
    } else {
      console.error("Email failed:", e);
    }
  }
}

function cleanText(text: string): string {
  // Strip internal metadata header Claude sometimes prepends before the real message
  // Pattern: one or two summary lines followed by "---"
  const withoutMeta = text.replace(/^[\s\S]{0,300}?---\n+/, "").trim();
  const cleaned = withoutMeta || text;
  return cleaned
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .trim();
}

function buildCopyPrompt(lead: Record<string, unknown>, phase: string, day_number: number, day_of_week: string): string {
  return `You are Alex, the AI sales assistant for EEM26 Selar Training.

REAL STUDENT RESULTS (match to lead country or pain point):
- Harry Obilonu Nigeria — ₦264,560 + GH₵330 + CFA 17,869
- Ego Obilonu Nigeria — ₦309,352.80 + KSh 3,820 + CFA 17,153
- Excel Stanley Nigeria — ₦373,115.20 + GH₵378 + CFA 20,118
- Nweze Ezekiel Nigeria — ₦277,468.40 + GH₵357 (older man, didn't understand tech, still made it)
- As Digitals Ghana — ₦344,430 + CFA 17,672 (zero tech skills, fully automated)
- Ajayi Abimbola Nigeria — ₦149,750
- Fredrick Ogaga Nigeria — ₦299,500
- Fidelis Ndubuisi Nigeria — ₦149,750

TECH STACK: https://ecosystemexpantion.github.io/Tech_stack-premium-/
SUNDAY TRAINING: https://t.me/+jX6QLzq04uQ3OGE0
4-DAY SETUP: Day 1 SRE+AAM. Day 2 full integration. Day 3 sales page live. Day 4 Coach Victor personally handles final setup — student earns same day. Only 5 per batch.

CURRENT DATE AND TIME: ${day_of_week} ${getNigeriaDate().toISOString().slice(0,10)} 8AM Nigeria time.
LEAD: Name=${lead.name} Country=${lead.country} PainPoint=${lead.pain_point} InterestLevel=${lead.interest_level || "warm"} Objections=${lead.objections_raised || "none"} Phase=${phase} DayNumber=${day_number} DayOfWeek=${day_of_week} TodayDate=${getNigeriaDate().toISOString().slice(0,10)}

${phase === "REMINDER" ? `Job: get them to Sunday 8PM Nigeria training.
TODAY IS ${day_of_week.toUpperCase()} ${getNigeriaDate().toISOString().slice(0,10)}.
${day_of_week === "Sunday"
  ? "THE TRAINING HAS NOT HAPPENED YET. It starts TONIGHT at 8PM Nigeria time. Write only about tonight. FORBIDDEN: 'last night', 'you missed it', 'what happened last night', 'yesterday'. The training is happening for the first time TONIGHT."
  : day_of_week === "Monday"
  ? "The training happened last Sunday night. They missed it. Paint what happened vividly — make them feel the loss. Tell them next Sunday at 8PM is their second chance."
  : day_of_week === "Tuesday"
  ? "Share one emotional student story that matches their country and pain point — make them see themselves in the result."
  : day_of_week === "Wednesday"
  ? "FOMO — people from their country are already setting up their systems while they wait. What is the cost of another week of delay?"
  : day_of_week === "Thursday"
  ? "3 days away — build anticipation, tease what AAM and SRE do without revealing everything."
  : day_of_week === "Friday"
  ? "2 days away — vivid contrast between their current pain point and life after EEM26."
  : "Today is Saturday. The training is TOMORROW Sunday at 8PM Nigeria time — NOT tonight. Build excitement for tomorrow evening. FORBIDDEN: 'tonight'."
}
Training link: https://t.me/+jX6QLzq04uQ3OGE0` : ""}
${phase === "FOLLOWUP" ? `Job: get them to download Tech Stack NOW.
Day1=recap a specific moment from training + cost of every day they delay. Day2=speak painfully to their exact pain point + how EEM26 solves it automatically. Day3=student story matching their country. Day4=destroy their specific objection with proof from a student who had the same one. Day5=scarcity — Coach Victor personally handles only 5 people on Day 4, slots are filling. Day6=direct offer — list everything they get and ask them to reply YES. Day7=final push — slot is gone after today, this is the last message.
Download: https://ecosystemexpantion.github.io/Tech_stack-premium-/` : ""}
${phase === "CONVICTION" ? `This lead is ${lead.interest_level} — they are interested but something is blocking them. They have been in follow-up for 7+ days without buying. Your job is to break through that block and convert them using every technique available.
Day1=Open with one direct honest question: "I noticed you've been paying attention but haven't moved yet. What's actually stopping you? Be honest with me." Make them tell you the real reason.
Day2=ROI attack — show what students made in their first month vs what the Tech Stack costs. Make the math impossible to argue with.
Day3=Nweze Ezekiel story — older man, did not understand tech at all, coaches set up everything for him, still made ₦277,468. If he can do it with zero tech knowledge, there is no excuse.
Day4=Pull their specific saved objection (${lead.objections_raised || "unknown block"}) and destroy it directly using a student who had the exact same concern and still succeeded.
Day5=Scarcity — Coach Victor personally handles only 5 people on Day 4. This batch is closing. After it closes, next batch date is unknown.
Day6=Final direct offer — list everything: AAM system, SRE system, 4 personal coaches, Day 4 with Coach Victor, live sales page in 3 days. Ask them to reply YES right now.
Day7=Last message — after today this batch closes. They either move now or lose their spot permanently. Make it final and direct.
Download: https://ecosystemexpantion.github.io/Tech_stack-premium-/` : ""}
${phase === "REENGAGE" ? `This lead went cold 30 days ago. They may have attended Sunday training or may have registered and never showed up. Either way they went silent. Send one powerful re-engagement message that works for both cases.
Open with a NEW student result from their country or matching their pain point — one they have not seen before. Then acknowledge that life gets busy and people lose momentum — make them feel understood, not chased. Then paint what they are still missing every single day they stay stuck. End with ONE clear call to action to download the Tech Stack now. Make it feel like a genuine personal check-in, not a sales blast.
Download: https://ecosystemexpantion.github.io/Tech_stack-premium-/` : ""}
${phase === "PENDING_CHECK" ? `This lead said they would download and get back but never returned. Send one short friendly check-up message. Remind them briefly about the premium link — it has extra packages not in the regular version including a new setup Coach Victor discovered that boosts sales in 2 days. Create light urgency — this offer won't always be available. Maximum 3 sentences. End with the download link.
Download: https://ecosystemexpantion.github.io/Tech_stack-premium-/` : ""}
${phase === "SETUP_INVITE" ? `Write ONE short direct message. You are telling this person you are personally going to do their setup for them TODAY. You are not asking if they want it — you are announcing it. Set a specific income goal in their country's currency (₦ Nigeria, GH₵ Ghana, KSh Kenya). End with a simple yes/no question: "Should I continue?" or "Want me to proceed?"
Exact energy to match: "[Name], I'm going to do that same setup for you today so that you'll start withdrawing like Coach Victor and the others. You need to make at least [₦500,000 / GH₵20,000 / KSh 100,000] before this month ends. Should I continue?"
Rules: First name only. 2-3 sentences maximum. No links. No emojis. No downloads. No hashtags. Sound like a person, not a bot.` : ""}
${phase === "TRUST_BUILDING" ? `This lead said: "${lead.objections_raised}". They don't fully understand what they're buying — that's the real problem. Your job is NOT to defend against their concern. Your job is to open their eyes to what ₦39,820 actually buys them. Use questions to make THEM arrive at the realization. Speak like a trusted friend giving them insider knowledge. Never lecture. Let them talk.

WHAT THEY GET (use this knowledge to craft each message):
- A landing page already built for them — EEM26 paid for it, normally costs ₦150,000+ to build
- A sales page already built for them — another ₦100,000+ value, they get it immediately
- An AI sales expert (Alex) who already knows the business, handles leads, converts sales 24/7 while they sleep
- Zero ad spend — leads come in automatically, no Facebook ads, no Google ads ever
- 10 free stacks every week from EEM26 — each stack worth close to ₦40,000 = ₦400,000 worth of tools weekly
- After downloading the tech stack: NO further payments until their complete setup is done

Day1=Start with a question about their pain point (struggling to get leads? running ads?). Then: "Can I show you something that eliminates that completely? One question — do you actually know what's inside the tech stack?"
Day2=The no-ads revelation. "Most people spend ₦50,000–₦200,000 every single month just to get leads. What if you never ran another ad? The tech stack automates your lead flow completely. How much would that save you every month?"
Day3=The pre-built assets reveal. "Here's what most people miss — EEM26 already built your landing page and your sales page. You don't touch anything technical. They absorbed that cost for you — a landing page alone normally runs ₦150,000 to build. When you download the tech stack, that is already yours and ready. Have you ever paid someone to build you a website before?"
Day4=The AI sales expert angle. "There is something inside the tech stack most people don't know until they're inside — an AI that already knows your business, handles your leads, and converts them while you sleep. It does not take breaks. It does not get tired. What would that be worth to you every month?"
Day5=The stack math. "EEM26 sends you 10 new stacks every single week. Each one is worth close to ₦40,000 if you built it yourself. That's ₦400,000 worth of tools landing in your hands every week — automatically. The tech stack is the key that unlocks all of it. Does that math make sense to you?"
Day6=The one-payment clarity. "One thing people always ask me — what about after the tech stack? Here is what most people never get told: after you download, there are zero other payments until your full setup is done. Coach Victor personally handles Day 4. You earn before you spend anything else. Why haven't more people been told this?"
Day7=The favor close. "I have walked you through this all week because I genuinely believe you are about to miss something real. Landing page. Sales page. AI that sells for you. Leads without ads. 10 stacks weekly. One payment, full setup. What is the one thing still holding you back — be honest with me."

Tech Stack link: https://ecosystemexpantion.github.io/Tech_stack-premium-/` : ""}

FORMAT: First line SUBJECT: then body. First name only. Max 6 sentences REMINDER, 8 sentences FOLLOWUP/CONVICTION/REENGAGE. Short punchy paragraphs. Single blank line between paragraphs. Max 2 emojis. Results on own line. No hashtags no JSON no bold markdown. Never mention Coach Victor in REMINDER. Use ₦ NGN GH₵ Ghana KSh Kenya CFA WestAfrica. If interest hot=direct+urgent. If cold=build trust first. If warm=balance urgency+story. NEVER reference previous messages or previous days — do not say "yesterday you saw" or "Friday you read" or any variation. Write every message as if it stands completely alone. No sign-off, no signature, no "Alex" at the bottom. CRITICAL DAY RULE: If DayOfWeek=Sunday — the training is TONIGHT, it has NOT happened yet. NEVER write "last night", "you missed it", "what happened last night" on Sunday — these are Monday phrases. If DayOfWeek=Saturday NEVER say "tonight". If DayOfWeek=Monday say "last night" or "missed Sunday".`;
}

Deno.serve(async (req) => {
  const dayOfWeek = getDayOfWeek();
  let messagesSent = 0;
  let hotLeadsToday = 0;
  let convictionLeadsToday = 0;
  let reengagedToday = 0;
  let isLastBatch = true;

  try {
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const trainingLive = body.training_live === true;
    const broadcastMsg = body.broadcast as string | undefined;
    const checkPending = !!body.check_pending;
    const testInviteChatId = body.test_invite_chat_id as string | undefined;
    const offset = (body.offset as number) || 0;
    const chainBatch = 50;

    // TEST MODE: send Wednesday setup invite to one specific lead by chat_id
    if (testInviteChatId) {
      const { data: testLead } = await sb.from("alex_leads").select("*").eq("telegram_chat_id", testInviteChatId).single();
      if (testLead?.name && testLead?.telegram_chat_id) {
        const res = await claude.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 450,
          system: buildCopyPrompt(testLead as Record<string, unknown>, "SETUP_INVITE", 1, "Wednesday"),
          messages: [{ role: "user", content: "Write the follow-up message now." }],
        });
        const fullText = (res.content[0] as { type: string; text: string }).text;
        const msgBody = cleanText(fullText.replace(/^SUBJECT:.+\n?/m, "").trim());
        await sendTelegram(testLead.telegram_chat_id as string, msgBody);
        sb.from("alex_conversations").insert({ lead_id: testLead.id, role: "assistant", message: msgBody }).then(null, () => {});
        await sendTelegram(ADMIN_CHAT_ID, `✅ Test setup invite sent to ${testLead.name}`);
      } else {
        await sendTelegram(ADMIN_CHAT_ID, `❌ No ATTENDED lead found with chat_id: ${testInviteChatId}`);
      }
      return new Response("ok");
    }

    // PENDING FOLLOW-UP CHECK MODE
    if (checkPending) {
      const now = new Date().toISOString();
      const { data: pendingLeads } = await sb
        .from("alex_leads")
        .select("*")
        .eq("status", "ATTENDED")
        .not("pending_followup_at", "is", null)
        .lt("pending_followup_at", now)
        .not("telegram_chat_id", "is", null);

      let checked = 0;
      for (const lead of pendingLeads || []) {
        if (!lead.name) continue;
        // Skip if they already messaged back after the pending was set
        if (lead.last_contacted_at && new Date(lead.last_contacted_at) > new Date(lead.pending_followup_at as string)) {
          await sb.from("alex_leads").update({ pending_followup_at: null }).eq("id", lead.id);
          continue;
        }
        try {
          const res = await claude.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 400,
            system: buildCopyPrompt(lead as Record<string, unknown>, "PENDING_CHECK", 1, getDayOfWeek()),
            messages: [{ role: "user", content: "Write the check-up message now." }],
          });
          const fullText = (res.content[0] as { type: string; text: string }).text;
          const msgBody = cleanText(fullText.replace(/^SUBJECT:.+\n?/m, "").trim());
          await sendTelegram(lead.telegram_chat_id as string, msgBody);
          if (lead.email) await sendEmail(lead.email as string, "Still thinking about it?", msgBody);
          const pendingVid = pickVideo("testimony");
          await sendVideo(lead.telegram_chat_id as string, pendingVid.fileId, pendingVid.caption);
          // Clear pending so it only fires once per "I'll get back"
          await sb.from("alex_leads").update({
            pending_followup_at: null,
            last_contacted_at: new Date().toISOString(),
          }).eq("id", lead.id);
          checked++;
        } catch (e) {
          console.error(`Pending followup failed for ${lead.id}:`, e);
        }
      }
      if (checked > 0) {
        await sendTelegram(ADMIN_CHAT_ID, `⏰ Pending check-up: ${checked} leads followed up.`);
      }
      return new Response("ok");
    }

    // BROADCAST MODE
    if (broadcastMsg) {
      const { data: leads } = await sb
        .from("alex_leads")
        .select("*")
        .in("status", ["REGISTERED", "ATTENDED"])
        .not("telegram_chat_id", "is", null);

      let sent = 0;
      for (const lead of leads || []) {
        if (!lead.name) continue;
        const msg = broadcastMsg.replace("{name}", lead.name || "");
        await sendTelegram(lead.telegram_chat_id as string, msg);
        if (lead.email) await sendEmail(lead.email as string, "Important update from Alex", msg);
        sent++;
      }
      await sendTelegram(ADMIN_CHAT_ID, `📢 Broadcast sent to ${sent} leads.`);
      return new Response("ok");
    }

    // TRAINING LIVE MODE
    if (trainingLive) {
      const { data: leads } = await sb
        .from("alex_leads")
        .select("*")
        .eq("status", "REGISTERED")
        .not("telegram_chat_id", "is", null);

      for (const lead of leads || []) {
        if (!lead.name) continue;
        await sendTelegram(
          lead.telegram_chat_id as string,
          `${lead.name} — training is happening RIGHT NOW 🔥 Students are making live withdrawals as we speak. Join immediately before it ends: https://t.me/+jX6QLzq04uQ3OGE0`
        );
      }
      return new Response("ok");
    }

    // MONDAY: upgrade REGISTERED leads who attended last Sunday → ATTENDED (first batch only)
    if (dayOfWeek === "Monday" && offset === 0) {
      const lastSunday = new Date(getNigeriaDate());
      lastSunday.setUTCDate(lastSunday.getUTCDate() - 1);
      lastSunday.setUTCHours(19, 0, 0, 0);
      const nowISO = new Date().toISOString();
      await sb.from("alex_leads")
        .update({ status: "ATTENDED", attended_at: nowISO, followup_started_at: nowISO })
        .eq("status", "REGISTERED")
        .lt("registered_at", lastSunday.toISOString());
    }

    // RE-ENGAGEMENT: COLD leads that went cold 30-60 days ago (first batch only)
    if (offset === 0) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString();
    const { data: coldLeads } = await sb
      .from("alex_leads")
      .select("*")
      .eq("status", "COLD")
      .lt("updated_at", thirtyDaysAgo)
      .gt("updated_at", sixtyDaysAgo)
      .not("telegram_chat_id", "is", null);

    for (const lead of coldLeads || []) {
      if (!lead.name) continue;
      try {
        const res = await claude.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 600,
          system: buildCopyPrompt(lead as Record<string, unknown>, "REENGAGE", 1, dayOfWeek),
          messages: [{ role: "user", content: "Write the re-engagement message now." }],
        });
        const fullText = (res.content[0] as { type: string; text: string }).text;
        const subjectMatch = fullText.match(/^SUBJECT:\s*(.+)/m);
        const subject = subjectMatch ? subjectMatch[1].trim() : "Checking in on you";
        const msgBody = cleanText(fullText.replace(/^SUBJECT:.+\n?/m, "").trim());

        await sendTelegram(lead.telegram_chat_id as string, msgBody);
        if (lead.email) await sendEmail(lead.email as string, subject, msgBody);
        const reengageVid = pickVideo("withdrawal");
        await sendVideo(lead.telegram_chat_id as string, reengageVid.fileId, reengageVid.caption);

        await sb.from("alex_leads")
          .update({ status: "ATTENDED", followup_started_at: new Date().toISOString(), last_contacted_at: new Date().toISOString() })
          .eq("id", lead.id);

        reengagedToday++;
        messagesSent++;
      } catch (e) {
        console.error(`Re-engage failed for ${lead.id}:`, e);
      }
    }
    } // end offset === 0 block

    // DAILY FOLLOW-UP: paginated — 100 leads per invocation, self-chains to next batch
    const { data: leads } = await sb
      .from("alex_leads")
      .select("*")
      .in("status", ["REGISTERED", "ATTENDED"])
      .not("telegram_chat_id", "is", null)
      .order("id")
      .range(offset, offset + chainBatch - 1);

    const processLead = async (lead: Record<string, unknown>) => {
      if (!lead.name || !lead.telegram_chat_id) return;
      const { phase, day_number } = getPhaseAndDay(lead, dayOfWeek);
      if (phase === "SKIP") return;
      if (lead.interest_level === "hot") hotLeadsToday++;
      if (phase === "CONVICTION") convictionLeadsToday++;

      try {
        const res = await claude.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 450,
          system: buildCopyPrompt(lead, phase, day_number, dayOfWeek),
          messages: [{ role: "user", content: "Write the follow-up message now." }],
        });

        const fullText = (res.content[0] as { type: string; text: string }).text;
        const subjectMatch = fullText.match(/^SUBJECT:\s*(.+)/m);
        const subject = subjectMatch ? subjectMatch[1].trim() : "A message from Alex";
        const msgBody = cleanText(fullText.replace(/^SUBJECT:.+\n?/m, "").trim());

        await sendTelegram(lead.telegram_chat_id as string, msgBody);
        sb.from("alex_conversations").insert({ lead_id: lead.id, role: "assistant", message: msgBody }).then(null, () => {});
        const daysInFollowup = daysSince((lead.followup_started_at || lead.attended_at) as string);
        const now = new Date().toISOString();
        if (daysInFollowup < 14) {
          sendEmail(lead.email as string, subject, msgBody)
            .then(() => sb.from("alex_leads").update({ last_email_sent_at: now }).eq("id", lead.id))
            .catch(() => {});
        }
        if (phase === "FOLLOWUP" || phase === "CONVICTION" || phase === "TRUST_BUILDING") {
          const category = (phase === "TRUST_BUILDING" || day_number % 2 === 1) ? "withdrawal" : "testimony";
          const vid = pickVideo(category);
          sendVideo(lead.telegram_chat_id as string, vid.fileId, vid.caption).catch(() => {});
        }
        await sb.from("alex_leads").update({ last_contacted_at: new Date().toISOString() }).eq("id", lead.id);
        messagesSent++;
      } catch (e) {
        console.error(`Failed lead ${lead.id}:`, e);
      }
    };

    const allLeads = (leads || []) as Record<string, unknown>[];
    isLastBatch = allLeads.length < chainBatch;

    const batchSize = 3;
    for (let i = 0; i < allLeads.length; i += batchSize) {
      await Promise.all(allLeads.slice(i, i + batchSize).map(processLead));
      await new Promise(r => setTimeout(r, 2000));
    }

    // Trigger next batch — await fetch just to log status, gateway responds 200 immediately
    if (!isLastBatch) {
      console.log(`[chain] Firing next batch at offset ${offset + chainBatch}`);
      const chainRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/alex-daily`, {
        method: "POST",
        headers: {
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplYml4YWx1aGh1aWR4bW5sZ2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMTA3MDAsImV4cCI6MjA5MDc4NjcwMH0.5e9f1H2aD9c50cY7JAL4pKnacbaEQk1JmlSHQECS1hs",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ offset: offset + chainBatch }),
      }).catch(e => { console.error("Chain trigger failed:", e); return null; });
      console.log(`[chain] Trigger response status: ${chainRes?.status ?? "error"}`);
      await new Promise(r => setTimeout(r, 2000));
      return new Response("ok");
    }

    // Mark cold/unknown interest ATTENDED leads as COLD after 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    await sb.from("alex_leads")
      .update({ status: "COLD" })
      .eq("status", "ATTENDED")
      .lt("followup_started_at", sevenDaysAgo)
      .or("interest_level.eq.cold,interest_level.is.null");

    // Mark hot/warm ATTENDED leads as COLD after 14 days (7 followup + 7 conviction)
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString();
    await sb.from("alex_leads")
      .update({ status: "COLD" })
      .eq("status", "ATTENDED")
      .lt("followup_started_at", fourteenDaysAgo)
      .in("interest_level", ["hot", "warm"]);

    // Cleanup old cold conversation history
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString();
    const { data: oldColdLeads } = await sb
      .from("alex_leads")
      .select("id")
      .eq("status", "COLD")
      .lt("updated_at", ninetyDaysAgo);
    for (const cl of oldColdLeads || []) {
      await sb.from("alex_conversations").delete().eq("lead_id", cl.id);
    }

  } catch (e) {
    console.error("alex-daily error:", e);
  }

  // Admin summary — only on last batch, queries DB for accurate cross-batch totals
  if (isLastBatch) {
  try {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    const [
      { count: todayCount },
      { count: activeCount },
    ] = await Promise.all([
      sb.from("alex_leads").select("*", { count: "exact", head: true }).gte("last_contacted_at", threeHoursAgo),
      sb.from("alex_leads").select("*", { count: "exact", head: true }).in("status", ["REGISTERED", "ATTENDED"]),
    ]);
    const summary = `📊 Alex Daily Summary — ${new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "short" })}

Messages sent today: ${todayCount || 0}
Total active leads: ${activeCount || 0}
Re-engaged cold leads: ${reengagedToday}

Alex is running. 🤖`;
    await sendTelegram(ADMIN_CHAT_ID, summary);

    // MONDAY: Weekly conversion report + objection dashboard
    if (dayOfWeek === "Monday") {
      const [
        { count: totalNew },
        { count: totalRegistered },
        { count: totalAttended },
        { count: totalPurchased },
        { count: totalCold },
      ] = await Promise.all([
        sb.from("alex_leads").select("*", { count: "exact", head: true }).eq("status", "NEW"),
        sb.from("alex_leads").select("*", { count: "exact", head: true }).eq("status", "REGISTERED"),
        sb.from("alex_leads").select("*", { count: "exact", head: true }).eq("status", "ATTENDED"),
        sb.from("alex_leads").select("*", { count: "exact", head: true }).eq("status", "PURCHASED"),
        sb.from("alex_leads").select("*", { count: "exact", head: true }).eq("status", "COLD"),
      ]);

      const total = (totalNew || 0) + (totalRegistered || 0) + (totalAttended || 0) + (totalPurchased || 0) + (totalCold || 0);
      const convRate = total > 0 ? (((totalPurchased || 0) / total) * 100).toFixed(1) : "0.0";

      const { data: objLeads } = await sb.from("alex_leads").select("objections_raised").not("objections_raised", "is", null);
      const objCount: Record<string, number> = {};
      for (const l of objLeads || []) {
        if (l.objections_raised) objCount[l.objections_raised] = (objCount[l.objections_raised] || 0) + 1;
      }
      const topObj = Object.entries(objCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([o, c], i) => `${i + 1}. "${o}" — ${c} leads`)
        .join("\n");

      const weeklyReport = `📈 Alex Weekly Report — ${new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "short" })}

CONVERSION FUNNEL:
New (not registered yet): ${totalNew || 0}
Registered (Sunday training): ${totalRegistered || 0}
Attended (in follow-up): ${totalAttended || 0}
Purchased (converted): ${totalPurchased || 0}
Cold (gave up): ${totalCold || 0}
Overall conversion rate: ${convRate}%

TOP OBJECTIONS:
${topObj || "No objections recorded yet"}

Alex is working. 🤖`;

      await sendTelegram(ADMIN_CHAT_ID, weeklyReport);
    }
  } catch (summaryErr) {
    console.error("Admin summary failed:", summaryErr);
  }
  } // end isLastBatch block

  return new Response("ok");
});
