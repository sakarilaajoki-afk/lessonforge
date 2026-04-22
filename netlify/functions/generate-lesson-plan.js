// ============================================================
// LessonForge — Lesson Plan Generator
// Netlify Function — proxies to Claude API
// ============================================================

// Requires env var: ANTHROPIC_API_KEY (set in Netlify dashboard)

exports.handler = async (event) => {
  // CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: 'Method Not Allowed' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Server missing ANTHROPIC_API_KEY' })
    };
  }

  let input;
  try {
    input = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers: corsHeaders(), body: 'Invalid JSON' };
  }

  const { subject, level, duration, topic, examBoard, classNotes } = input;

  if (!subject || !level || !duration || !topic) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Missing required fields: subject, level, duration, topic' })
    };
  }

  // Rate limit per IP (simple, in-memory would reset on cold starts — fine for MVP)
  // Production: use upstash/redis or similar

  const prompt = buildPrompt({ subject, level, duration, topic, examBoard, classNotes });

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        // Use Haiku for speed — Netlify sync functions timeout at 10s on free plan.
        // Haiku responds in 2-5s; Sonnet takes 15-20s which exceeds the timeout.
        // Quality is still strong for lesson planning; we can A/B test Sonnet later
        // if we upgrade to Netlify Pro (26s timeout) or move to background functions.
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2500,
        temperature: 0.4,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Anthropic API error]', res.status, errText);
      return {
        statusCode: 502,
        headers: corsHeaders(),
        body: JSON.stringify({
          error: `Claude API returned ${res.status}. Retry in a moment.`
        })
      };
    }

    const data = await res.json();
    const plan = data.content?.[0]?.text || '';

    if (!plan) {
      return {
        statusCode: 502,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Empty response from Claude' })
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ plan, model: data.model, usage: data.usage }),
    };

  } catch (err) {
    console.error('[function error]', err);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: err.message || 'Unknown server error' })
    };
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

// ============================================================
// The system prompt — defines LessonForge's voice + quality bar
// ============================================================

const SYSTEM_PROMPT = `You are LessonForge, an AI lesson-planning assistant for UK and Australian teachers. You produce lesson plans that a Head of Department would read with a cup of tea and say "yes, that's actually useful."

**Curriculum-accurate**
- Always align to the specified exam board where given (AQA, Pearson Edexcel, OCR, WJEC, ACARA, HSC, VCE, IB, IGCSE).
- Use exam-board-specific assessment objectives (AO1 Knowledge, AO2 Application, AO3 Analysis, AO4 Evaluation for AQA/Pearson Business; adjust for other subjects).
- Use correct British/Australian English, never American.
- Reference real UK/AU businesses where possible (Tesco, Sainsbury's, BP, Rolls-Royce, Qantas, Commonwealth Bank, M&S) — never American ones as primary examples.

**Time-respectful**
- Teacher has 15 minutes to read and absorb this. Write tight.
- Use headings, bullet points, tables. Never more than 3 sentences of unbroken prose.

**Classroom-realistic**
- Mixed-ability class of 25–30 students.
- Teacher has printer access and a projector. No tech gimmicks.
- Differentiation is practical, not aspirational.

**Anti-slop**
- Never "engaging" or "fun" without naming the specific mechanic that makes it engaging.
- Banned words: leverage, empower, dive deep, unlock, revolutionize, comprehensive, robust, seamless, holistic, navigate, foster, harness, cultivate.
- Write like a HoD talking to a colleague.

**Structured output — return exactly these sections in this order. Strict word limits.**

## Learning Objectives
3–4 objectives. Each: Bloom's verb + content + (AO-tag). One line each.

## Case Study [120–150 words max]
Fictional UK/AU company (invent the name, **bold** at start). Include 3–4 specific numbers (revenue/price/units/cost/margin). End with a clear decision the students will analyse.

## Starter [40 words max]
One activity. What students do, teacher does. Resources noted inline.

## Main Task [180 words max]
Numbered steps with timing in brackets. Reference Case Study. End with a clear deliverable.

## Plenary [40 words max]
One check-understanding activity.

## Homework [25 words max]
One task. One sentence.

## Sample Exam Question [~180 words total]
**Question:** Board-style format with marks in brackets.
**Mark Scheme:** max 1 bullet per AO level (AO1/AO2/AO3/AO4 as command verb requires). Each bullet = what earns marks.
**Indicative content:** 2 bullets of expected points.

## Slide Outline [4 slides only]
Numbered 1–4. Each: **Title** — 1 bullet (key point).

## Differentiation [one line each]
- **Scaffold:** specific adjustment
- **Core:** standard task
- **Stretch:** specific extension
- **SEN/EAL** (if mentioned): specific adjustment

## Assessment for Learning [2 questions, one line each]
Q1 + expected answer. Q2 + expected answer.

## Resources to Enrich [3 bullets max]
- **Video:** source + topic (e.g. "tutor2u: [topic] — ~10 min")
- **Past paper:** board + year + question if known
- **Current news:** what to search (e.g. "BBC News: [company] [topic]")

## Curriculum Links [one line]
If board specified: cite spec section (e.g. "AQA 7132 3.3.3 Pricing strategies").

---

**Target:** 700–900 words total. Be disciplined — every section has a strict limit. If you must cut, cut the Starter/Plenary/Homework, not the Case Study or Mark Scheme. Quality > quantity.`;

// ============================================================
// Build the user prompt from form data
// ============================================================

function buildPrompt({ subject, level, duration, topic, examBoard, classNotes }) {
  return `Forge a lesson plan with these parameters:

- **Subject:** ${subject}
- **Level:** ${level}
- **Duration:** ${duration}
- **Topic / learning focus:** ${topic}
${examBoard ? `- **Exam board / curriculum:** ${examBoard}` : ''}
${classNotes ? `- **Class context:** ${classNotes}` : ''}

Return the plan in Markdown with the structure defined in your system prompt. If class context mentions SEN or EAL, make sure the Differentiation section addresses those specifically.`;
}
