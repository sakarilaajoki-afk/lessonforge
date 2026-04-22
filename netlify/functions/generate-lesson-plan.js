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
        max_tokens: 3500,
        temperature: 0.5,
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

**Structured output — return exactly these sections in this order**:

## Learning Objectives
3–4 objectives, each starting with a Bloom's verb (Explain, Analyse, Evaluate, Apply, Calculate, Compare). Map each to an AO level at the end in brackets, e.g. "(AO1)", "(AO2)", "(AO3)".

## Case Study
A ready-to-use case study for the Main Task. 120–180 words. Must include:
- Fictional but realistic UK/AU company (invent the name)
- 3–4 specific numbers (revenue, price, unit sales, cost)
- A clear decision point for students to analyse
Company name **bold** at start, then narrative. Tight — no filler.

## Starter (5–10 min)
One concrete activity. What students do, what teacher does, resources.

## Main Task (the bulk of the lesson)
Step-by-step. Timing in brackets. Reference the Case Study. End with "students produce X by end". Keep total under 200 words.

## Plenary (5–10 min)
One concrete activity. Check understanding.

## Homework / Extension
Realistic-length homework task. Link to the exam spec if possible.

## Sample Exam Question (board-specific style)
ONE exam-style question, matching the specified board's house style. Include:
- **Question:** with marks in brackets
- **Mark Scheme:** by AO level — max 2 bullet points per AO (AO1/AO2/AO3/AO4 as the command verb requires). Each bullet = what earns marks.
- **Indicative content:** 2–3 bullets of expected answer points.
Be tight — this is a guide, not a full examiner report.

## Slide Outline (6 slides)
Numbered list. Each slide: **Title** — 2 bullets. Maps to Main Task timing.

## Differentiation
- **Scaffold** (support): specific adjustment
- **Core**: the standard task
- **Stretch** (challenge): specific extension
If SEN or EAL mentioned in class context, add a fourth line with specific adjustment.

## Assessment for Learning
2–3 questions teacher asks mid-lesson to check understanding. Include expected answer in one line.

## Resources to Enrich This Lesson
Suggest THREE types of external resources by name (the teacher will find them):
- **Video:** Name a specific video source + topic (e.g. "tutor2u: Price Elasticity of Demand — 10 min walkthrough")
- **Past paper:** Specify board + paper + question number if you know a topical match (e.g. "AQA 7132 Paper 1, June 2023, Q3")
- **Current news:** Name a topic/business to search for this week (e.g. "search BBC News for 'Tesco price cuts 2026'")
Don't invent specific URLs — just name the resource type and what to search for.

## Curriculum Links
If exam board specified, cite relevant spec sections precisely (e.g. "AQA 7132 3.3.3 Pricing strategies"). Skip if no board.

---

**Target length:** 700–1100 words total. Every section must be useful — no filler. The Case Study and Mark Scheme save the teacher 30–60 min of prep each; that justifies their length.`;

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
