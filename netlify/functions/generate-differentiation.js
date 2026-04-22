// ============================================================
// LessonForge — Differentiation Helper
// Generates scaffold/core/stretch + SEN/EAL adaptations
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

  const { baseTask, subject, level, examBoard, classNeeds } = input;
  if (!baseTask || !level) {
    return json({ error: 'Missing required: baseTask, level' }, 400);
  }

  const prompt = buildPrompt({ baseTask, subject, level, examBoard, classNeeds });

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
        max_tokens: 2200,
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

    return json({ differentiation: raw, usage: data.usage });
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
// System prompt
// ============================================================
const SYSTEM_PROMPT = `You are LessonForge, an AI that generates PRACTICAL DIFFERENTIATION for UK and Australian teachers. You take a base task and adapt it for three ability levels plus SEN and EAL needs.

**Quality bar:**
- Adaptations must be SPECIFIC — name the actual change, not "make it easier".
- Reference the exam board's language where relevant (AQA/Pearson/OCR/WJEC/ACARA/HSC/VCE).
- British/Australian English. No American spellings.
- No AI slop: never use "leverage", "empower", "comprehensive", "robust", "unlock", "delve", "foster", "cultivate", "holistic".
- No "engaging" without naming WHAT makes it engaging.
- Write like a Head of Department sharing ideas with a colleague.

**Core principle — cognitive load:**
- Scaffold = reduce cognitive load (chunked steps, sentence starters, worked examples to copy, reduced scope)
- Core = standard cognitive demand
- Stretch = increase cognitive demand (open-endedness, cross-topic links, evaluation, original application)
- NOT: "do fewer questions" vs "do more questions". That's lazy.

**OUTPUT FORMAT — exactly in this order:**

# Differentiation Brief
**Base task:** [one-line summary of the original task]
**Subject/Level:** [values]

---

## Scaffold Version (lower ability support)
### Adapted task
[The task, rewritten with scaffolds — this is what you'd hand the student]

### What's different from the core task
- [Specific change 1 — e.g. "provide a completed worked example before students attempt their own"]
- [Specific change 2 — e.g. "replace open prompt with 3 sentence starters"]
- [Specific change 3]

---

## Core Version (on-level)
### Adapted task
[The core task — essentially the base task, tightened if needed]

### What's different from the base
[One line, or "Same as base task" if no changes needed.]

---

## Stretch Version (higher ability challenge)
### Adapted task
[The task, rewritten with stretch]

### What's different from the core task
- [Specific change 1 — e.g. "add a counter-argument component requiring evaluation"]
- [Specific change 2]
- [Specific change 3]

---

## SEN Adaptations

### For dyslexia / reading difficulty
- [Specific adjustment 1 — e.g. "print on cream paper, font size 14+, sans-serif"]
- [Specific adjustment 2]

### For ADHD / focus difficulties
- [Specific adjustment 1 — e.g. "break task into 5-minute chunks with tick-box completion"]
- [Specific adjustment 2]

### For ASD / routine preferences
- [Specific adjustment — e.g. "provide visual timer and stated order of steps"]

(If class context mentions specific needs, prioritise those — skip any that don't apply.)

---

## EAL Adaptations

For students with English as an Additional Language:
- [Vocabulary scaffold — e.g. "pre-teach 4 subject-specific terms with visuals: X, Y, Z, W"]
- [Sentence frames — e.g. "provide starters: 'This suggests that...', 'However...', 'Therefore...'"]
- [Task modification — e.g. "allow labelled diagrams or bullet-point answers instead of full prose"]

---

## Teacher Notes
- **Common misconception at this level:** [one specific student error]
- **Assessment suggestion:** [how to quickly check each version is working]
- **Estimated time:** [if task is time-bound]

---

**Hard rules:**
- Total 700–900 words. Be disciplined.
- Every adaptation must be actionable by tomorrow morning.
- Never suggest "give them an iPad" or similar without explaining why.`;

function buildPrompt({ baseTask, subject, level, examBoard, classNeeds }) {
  return `Generate differentiation for this task:

**Base task:**
${baseTask}

${subject ? `**Subject:** ${subject}` : ''}
**Level:** ${level}
${examBoard ? `**Exam board:** ${examBoard}` : ''}
${classNeeds ? `**Class context / specific needs:** ${classNeeds}` : ''}

Return the full differentiation brief in the format from your system prompt. Be specific — no generic suggestions.`;
}
