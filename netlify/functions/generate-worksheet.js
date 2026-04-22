// ============================================================
// LessonForge — Worksheet Generator
// Netlify Function — student-facing printable handout + answer key
// ============================================================

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: 'Method Not Allowed' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return json({ error: 'Server missing ANTHROPIC_API_KEY' }, 500);

  let input;
  try { input = JSON.parse(event.body || '{}'); }
  catch (e) { return json({ error: 'Invalid JSON' }, 400); }

  const {
    subject, level, topic,
    examBoard,
    activityType,   // "practice" | "investigation" | "revision" | "homework"
    length,         // "short" (30 min) | "standard" (45 min) | "extended" (60+ min)
  } = input;

  if (!subject || !level || !topic || !activityType) {
    return json({ error: 'Missing required: subject, level, topic, activityType' }, 400);
  }

  const prompt = buildPrompt({ subject, level, topic, examBoard, activityType, length: length || 'standard' });

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

    return json({ worksheet: raw, usage: data.usage });
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
// System prompt — produces student-facing worksheet + answer key
// ============================================================
const SYSTEM_PROMPT = `You are LessonForge, an AI that generates print-ready STUDENT WORKSHEETS for UK and Australian teachers.

The worksheet goes straight to a photocopier. Students write on it. A separate answer key follows for the teacher.

**Student voice (not teacher voice):**
- Write TO the student, not ABOUT the student.
- Use "you" where natural. Clear, plain instructions.
- British/Australian English only.
- If a task says "In pairs, discuss...", write it that way — instruction directly to students.

**Curriculum-accurate:**
- Match specified exam board (AQA, Pearson, OCR, WJEC, ACARA, HSC, VCE, IB, IGCSE).
- Use British companies as examples (Tesco, M&S, BP, Rolls-Royce, Vodafone) — not Walmart or Target.
- AO-tag questions where applicable.

**Anti-slop:** never use "leverage", "empower", "comprehensive", "robust", "unlock", "delve", "foster", "cultivate". No emojis in worksheet.

**OUTPUT FORMAT — strict, in this order:**

# [Topic] Worksheet
**Subject:** [Subject] **Level:** [Level] **Board:** [Board or blank]
**Name:** _____________________  **Date:** _____________

---

## Learning Outcomes
By the end of this worksheet you will be able to:
- [Outcome 1 starting with verb: Calculate, Explain, Analyse, etc.]
- [Outcome 2]
- [Outcome 3]

## Key Terms
Quick definitions the student needs:
- **Term 1:** one-sentence definition
- **Term 2:** one-sentence definition
(3–5 terms)

## Worked Example
**Scenario:** [Brief UK-context scenario with specific numbers]
**Question:** [Worked question]
**Step-by-step solution:**
1. [First step with reasoning]
2. [Second step]
3. [Third step with answer clearly stated]

## Practice Questions
Numbered 1–N (6–10 questions depending on length):

1. [Question — spacing for student to write/calculate answer]
   *(Space for working)*

2. [Question]
   *(Space for working)*

…

Each question should:
- Vary in difficulty (easy → medium → stretch in sequence)
- Include 1–2 questions with UK-context numbers (e.g. "Tesco's revenue was £x...")
- Include 1 evaluation/analysis question for AO3/AO4 practice

## Extension Challenge ★
One optional stretch question for students who finish early. Harder, open-ended, or numerical puzzle.

---

## Answer Key (Teacher Use Only)

For each Practice Question, provide:

**Q1.** [Answer]
*Working/marking note:* [one line explaining how to check/mark]

**Q2.** [Answer]
*Working/marking note:* [...]

…

**Extension ★:** [Answer + notes]

---

## Teacher Notes
- **Estimated time:** [X minutes]
- **Differentiation:**
  - Scaffold: [one specific adjustment for lower ability]
  - Stretch: [one specific adjustment for higher ability]
- **Common misconception:** [one specific mistake students often make + how to address]
- **Curriculum link:** [if board specified, cite spec code]

---

**Hard rules:**
- Total length: 700–1000 words.
- The Practice Questions section must leave visible space for student writing (indicate with *(Space for working)* or blank lines).
- Answer Key section must be CLEARLY SEPARATED from the student portion with a horizontal rule.
- Do not exceed 2200 words. Be tight.`;

function buildPrompt({ subject, level, topic, examBoard, activityType, length }) {
  const lengthMap = {
    short: '30 minutes — 4–6 practice questions',
    standard: '45 minutes — 6–8 practice questions',
    extended: '60+ minutes — 8–10 practice questions',
  };
  const typeMap = {
    practice: 'practice questions to consolidate understanding after a taught lesson',
    investigation: 'an investigation/inquiry activity where students explore a concept',
    revision: 'revision for upcoming assessment — varied question types',
    homework: 'independent homework — manageable without teacher support',
  };

  return `Generate a worksheet with these parameters:

- Subject: ${subject}
- Level: ${level}
- Topic: ${topic}
${examBoard ? `- Exam board: ${examBoard}` : ''}
- Activity type: ${activityType} — ${typeMap[activityType] || activityType}
- Length: ${length} (${lengthMap[length] || lengthMap.standard})

Return the worksheet in the format from your system prompt. Student portion first, then Answer Key clearly separated, then Teacher Notes at the end.`;
}
