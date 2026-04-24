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

const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: Deno.env.get("GMAIL_USER"),
    pass: Deno.env.get("GMAIL_APP_PASSWORD"),
  },
});

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

function getPhaseAndDay(lead: Record<string, unknown>, dayOfWeek: string): { phase: string; day_number: number } {
  if (lead.status === "REGISTERED") {
    // Urgency engine — distinct message energy for each day of the week
    const dayMap: Record<string, number> = {
      "Sunday": 1,    // Training TODAY
      "Monday": 2,    // Just missed it — next Sunday coming
      "Tuesday": 3,   // Emotional student story
      "Wednesday": 4, // FOMO — others are moving
      "Thursday": 5,  // Countdown approaching — 3 days
      "Friday": 6,    // 2 days away — vivid contrast
      "Saturday": 7,  // Tomorrow is the day
    };
    return { phase: "REMINDER", day_number: dayMap[dayOfWeek] || 4 };
  }
  if (lead.status === "ATTENDED") {
    const days = daysSince((lead.followup_started_at || lead.attended_at) as string);
    // Hot/warm leads past day 7 enter CONVICTION phase instead of going cold
    if (days >= 7 && (lead.interest_level === "hot" || lead.interest_level === "warm")) {
      return { phase: "CONVICTION", day_number: Math.min(days - 6, 7) };
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

function cleanText(text: string): string {
  return text
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

LEAD: Name=${lead.name} Country=${lead.country} PainPoint=${lead.pain_point} InterestLevel=${lead.interest_level || "warm"} Objections=${lead.objections_raised || "none"} Phase=${phase} DayNumber=${day_number} DayOfWeek=${day_of_week}

${phase === "REMINDER" ? `Job: get them to Sunday 8PM Nigeria training.
Day1(Sun)=Training is TONIGHT — urgent final push, it starts in hours, do not miss this.
Day2(Mon)=They just missed Sunday — paint what happened in the training vividly, make them feel the loss, tell them next Sunday is their chance and to be ready this time.
Day3(Tue)=Emotional student story matching their country — make them see themselves in the result.
Day4(Wed)=FOMO — people from their country are already setting up their systems while they wait. What is the cost of another week of delay?
Day5(Thu)=3 days away — build anticipation, tease what AAM and SRE do without revealing everything.
Day6(Fri)=2 days away — vivid contrast between their current pain point and life after EEM26.
Day7(Sat)=Tomorrow is the day — excitement, send training link, tell them exactly what time and what to expect.
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

FORMAT: First line SUBJECT: then body. First name only. Max 6 sentences REMINDER, 8 sentences FOLLOWUP/CONVICTION/REENGAGE. Short punchy paragraphs. Single blank line between paragraphs. Max 2 emojis. Results on own line. No hashtags no JSON no bold markdown. Never mention Coach Victor in REMINDER. Use ₦ NGN GH₵ Ghana KSh Kenya CFA WestAfrica. If interest hot=direct+urgent. If cold=build trust first. If warm=balance urgency+story. NEVER reference previous messages or previous days — do not say "yesterday you saw" or "Friday you read" or any variation. Write every message as if it stands completely alone. No sign-off, no signature, no "Alex" at the bottom.`;
}

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const trainingLive = body.training_live === true;
    const broadcastMsg = body.broadcast as string | undefined;
    const checkPending = !!body.check_pending;
    const dayOfWeek = getDayOfWeek();

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

    // MONDAY: upgrade REGISTERED leads who attended last Sunday → ATTENDED
    if (dayOfWeek === "Monday") {
      const lastSunday = new Date(getNigeriaDate());
      lastSunday.setUTCDate(lastSunday.getUTCDate() - 1);
      lastSunday.setUTCHours(19, 0, 0, 0);
      const nowISO = new Date().toISOString();
      await sb.from("alex_leads")
        .update({ status: "ATTENDED", attended_at: nowISO, followup_started_at: nowISO })
        .eq("status", "REGISTERED")
        .lt("registered_at", lastSunday.toISOString());
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

    let messagesSent = 0;
    let hotLeadsToday = 0;
    let convictionLeadsToday = 0;
    let reengagedToday = 0;

    // RE-ENGAGEMENT: COLD leads that went cold 30-60 days ago
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

        await sb.from("alex_leads")
          .update({ status: "ATTENDED", followup_started_at: new Date().toISOString(), last_contacted_at: new Date().toISOString() })
          .eq("id", lead.id);

        reengagedToday++;
        messagesSent++;
      } catch (e) {
        console.error(`Re-engage failed for ${lead.id}:`, e);
      }
    }

    // DAILY FOLLOW-UP: all active leads
    const { data: leads } = await sb
      .from("alex_leads")
      .select("*")
      .in("status", ["REGISTERED", "ATTENDED"]);

    const totalActive = (leads || []).length;

    for (const lead of leads || []) {
      if (!lead.name) continue;
      const { phase, day_number } = getPhaseAndDay(lead as Record<string, unknown>, dayOfWeek);
      if (phase === "SKIP") continue;
      if (lead.interest_level === "hot") hotLeadsToday++;
      if (phase === "CONVICTION") convictionLeadsToday++;

      try {
        const res = await claude.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 800,
          system: buildCopyPrompt(lead as Record<string, unknown>, phase, day_number, dayOfWeek),
          messages: [{ role: "user", content: "Write the follow-up message now." }],
        });

        const fullText = (res.content[0] as { type: string; text: string }).text;
        const subjectMatch = fullText.match(/^SUBJECT:\s*(.+)/m);
        const subject = subjectMatch ? subjectMatch[1].trim() : "A message from Alex";
        const msgBody = cleanText(fullText.replace(/^SUBJECT:.+\n?/m, "").trim());

        await sendTelegram(lead.telegram_chat_id as string, msgBody);
        if (lead.email) await sendEmail(lead.email as string, subject, msgBody);
        if (phase === "FOLLOWUP" || phase === "CONVICTION") {
          const category = day_number % 2 === 1 ? "withdrawal" : "testimony";
          await sendVideo(lead.telegram_chat_id as string, pickVideo(category));
        }
        await sb.from("alex_leads").update({ last_contacted_at: new Date().toISOString() }).eq("id", lead.id);
        messagesSent++;
      } catch (e) {
        console.error(`Failed lead ${lead.id}:`, e);
      }
    }

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

    // ADMIN DAILY SUMMARY
    const summary = `📊 Alex Daily Summary — ${new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "short" })}

Messages sent today: ${messagesSent}
Total active leads: ${totalActive}
Hot leads in system: ${hotLeadsToday}
In conviction phase: ${convictionLeadsToday}
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

    return new Response("ok");
  } catch (e) {
    console.error("alex-daily error:", e);
    return new Response("error", { status: 500 });
  }
});
