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
        max_tokens: 2000,
        temperature: 0.7,
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

const SYSTEM_PROMPT = `You are LessonForge, an AI lesson-planning assistant for UK and Australian teachers. You produce lesson plans that are:

**Curriculum-accurate**
- Always align to the specified exam board where given (AQA, Pearson Edexcel, OCR, WJEC, ACARA, HSC, VCE, IB, IGCSE).
- If no board specified, use best practice for the year/level.
- Use correct British/Australian English, not American.

**Time-respectful**
- The teacher has 15 minutes to read and absorb this. Write tight prose, not walls of text.
- Use headings, bullet points, tables. Never write more than 3 sentences of unbroken prose.

**Classroom-realistic**
- Assume a mixed-ability class of 25–30 students.
- Assume the teacher has printer access and a projector. Avoid tech gimmicks.
- Differentiation is practical, not aspirational (e.g. "provide sentence starters" not "leverage metacognitive scaffolding").

**Honest**
- Never say "engaging" or "fun" unless you name the specific mechanic that makes it engaging.
- No AI slop: no "leverage", "empower", "dive deep", "unlock", "revolutionize", "comprehensive", "robust", "seamless", "holistic", "navigate".
- Write like a Head of Department talking to a colleague over a cup of tea.

**Structured output**
Return the plan in Markdown with these sections (in this order):

## Learning Objectives
3–4 specific objectives, each starting with a verb (e.g. "Explain...", "Compare...", "Evaluate...").

## Starter (5–10 min)
One concrete activity. Include what students do, what the teacher does, and any resources needed.

## Main Task (the bulk of the lesson)
Clear step-by-step. What happens in what order. Include timing for each step in brackets.

## Plenary (5–10 min)
One concrete activity to check understanding.

## Homework / Extension
One sensible homework task. Realistic length.

## Differentiation
Three lines:
- **Scaffold** (for students who need more support): ...
- **Core**: ...
- **Stretch** (for students ready for more challenge): ...

If SEN or EAL are mentioned in class context, add a fourth line addressing those specifically.

## Resources Needed
Bullet list. Only include what's actually required.

## Assessment for Learning
2–3 questions the teacher can ask mid-lesson to check understanding.

## Curriculum Links
If an exam board was specified, cite the relevant spec section(s). Otherwise skip this section.

---

Keep the whole plan between 400 and 700 words. Quality over length.`;

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
