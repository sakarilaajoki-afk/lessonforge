// ============================================================
// LessonForge — Quiz & Exam Builder
// Netlify Function — proxies to Claude API
// ============================================================
// Generates questions + model answers + mark scheme for a subject/topic.
// Supports: MCQ, short-answer, essay. Board-specific AO tagging.

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: 'Method Not Allowed' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json({ error: 'Server missing ANTHROPIC_API_KEY' }, 500);
  }

  let input;
  try { input = JSON.parse(event.body || '{}'); }
  catch (e) { return json({ error: 'Invalid JSON' }, 400); }

  const {
    subject,       // "A-Level Business"
    level,         // "Year 12"
    topic,         // "Price elasticity of demand"
    examBoard,     // "AQA"
    questionTypes, // ["mcq", "short", "essay"] or subset
    questionCount, // 5 | 10 | 15 | 20
    difficulty,    // "standard" | "challenging" | "exam-stretch"
  } = input;

  if (!subject || !level || !topic || !questionTypes || !questionCount) {
    return json({ error: 'Missing required: subject, level, topic, questionTypes, questionCount' }, 400);
  }

  const prompt = buildPrompt({ subject, level, topic, examBoard, questionTypes, questionCount, difficulty });

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2500,
        temperature: 0.5,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Anthropic API error]', res.status, errText);
      return json({ error: `Claude API returned ${res.status}` }, 502);
    }

    const data = await res.json();
    const raw = data.content?.[0]?.text || '';
    if (!raw) return json({ error: 'Empty response from Claude' }, 502);

    return json({ quiz: raw, usage: data.usage });
  } catch (err) {
    console.error('[function error]', err);
    return json({ error: err.message || 'Unknown server error' }, 500);
  }
};

function json(obj, status = 200) {
  return { statusCode: status, headers: corsHeaders(), body: JSON.stringify(obj) };
}
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

// ============================================================
// System prompt — defines quiz quality + format
// ============================================================
const SYSTEM_PROMPT = `You are LessonForge, an AI quiz builder for UK and Australian teachers.

Your output becomes a print-ready quiz that a teacher hands to students tomorrow morning. Every question must be usable as-is — no filler, no vague prompts.

**Curriculum-accurate:**
- Match the specified exam board's house style (AQA, Pearson Edexcel, OCR, WJEC, ACARA, HSC, VCE, IB, IGCSE).
- AO-tag every question: AO1 (Knowledge), AO2 (Application), AO3 (Analysis), AO4 (Evaluation).
- Use the board's command verbs correctly. AQA: Explain/Analyse/Evaluate/Calculate. Pearson: Assess/Discuss/Evaluate.
- British English only.

**Honest:**
- MCQs must have **one clearly correct answer** + 3 plausible distractors (common student errors).
- Short-answer questions must be answerable in 2–5 minutes each.
- Essay questions must have a specific command verb and clear scope.
- No trick questions. No "which of these is best" without evidence.

**Anti-slop:**
- Never use: leverage, empower, comprehensive, robust, seamless, holistic, foster, cultivate, delve, unlock.
- No emojis in questions or answers.

**OUTPUT FORMAT (strict):**

Return Markdown with these sections IN THIS ORDER:

# [Subject] — [Topic] Quiz
*[Level] | [Board if specified] | [Count] questions*

## Questions

For each question, format exactly:

**Question [N]** [MCQ / Short / Essay] — [marks] marks — [AO-tags e.g. AO1, AO2]

[The question text]

*(For MCQs, add options A-D on separate lines, no answer marked)*

---

## Mark Scheme (Teacher Version)

For each question, format:

**Question [N] — Mark Scheme**

[For MCQ: state correct answer with one-line explanation why correct + why distractors wrong]

[For short-answer: model answer (3-5 lines) + bullet list of what earns marks (AO1: X; AO2: Y; AO3: Z)]

[For essay: indicative content (5-8 bullet points) + how marks are awarded across AO levels]

---

## Quiz Summary

- Total marks: [X]
- Estimated time: [X minutes]
- AO distribution: AO1 X% / AO2 X% / AO3 X% / AO4 X%
- Topic coverage: [2-3 sentences summarising what this quiz tests]

---

**Hard rules:**
- Stay under 2200 words total. Be tight.
- If questionTypes includes "mcq" and count is 5+, make 40-60% MCQs.
- If "essay" included, include ONE essay question at the end (not more for 60-min quiz).
- Always end with the Quiz Summary section.`;

function buildPrompt({ subject, level, topic, examBoard, questionTypes, questionCount, difficulty }) {
  const typesList = questionTypes.map(t => {
    if (t === 'mcq') return 'MCQ (multiple choice, 4 options A–D)';
    if (t === 'short') return 'short-answer (2–10 marks)';
    if (t === 'essay') return 'essay (9/12/16 marker style)';
    return t;
  }).join(', ');

  return `Build a quiz with these parameters:

- Subject: ${subject}
- Level: ${level}
- Topic / learning focus: ${topic}
${examBoard ? `- Exam board / curriculum: ${examBoard}` : ''}
- Question types to include: ${typesList}
- Number of questions: ${questionCount}
- Difficulty: ${difficulty || 'standard (on-level)'}

Return the quiz in the format defined in your system prompt — Questions section first, then Mark Scheme, then Quiz Summary.`;
}
