# LessonForge — Launch Package

**Sakari Laajoki · TBS Education Ltd Oy (3614159-3)** · 21.4.2026

Tämä dokumentti sisältää: brand brief, Day 2–9 build plan, beta-kutsu, Sakarin TODO ennen launchia.

---

## 🎨 OSA 1 — BRAND BRIEF

### Nimi ja positiointi

**Nimi:** LessonForge
**Parent:** TBS Education Ltd Oy (3614159-3)
**Sisarprodukti:** The Business School (thebusiness.school)

**One-liner:** *"Forge better lessons, faster. For every subject, every level."*

**Positiointi suhteessa kilpailijoihin:**
- Magic School AI (US) → LessonForge on **UK/AU-curriculum-native** alternative
- ChatGPT EDU → LessonForge on **GDPR-compliant, EU-based**, opettaja-ensisijainen
- tutor2u → LessonForge on **AI-tehoinen, ei staattinen**

### Brändi-arvot

1. **Teacher-first** — myymme opettajille, ei kouluille (eri kuin Magic School)
2. **Curriculum-accurate** — AQA, Pearson, OCR, WJEC, ACARA, HSC, VCE, IB, IGCSE
3. **Privacy-respecting** — GDPR, ei student-data-tallennusta, ei datan käyttöä malleissa
4. **Time-saving** — 30 sek työkaluille, ei 30 min
5. **Premium quality** — PDF:t näyttävät aikuisen tuotteelta, ei prototyypiltä

### Visuaalinen kieli

**Palette (käytössä styles.css:ssä):**
- Ink `#1a1f36` — pääsävy, otsikot
- Ember `#d84315` — primary action (forge-metafora: kuuma rauta)
- Ember soft `#ffe5d9` — tausta-accentit
- Anvil `#3a3f51` — muted-teksti
- Paper `#faf6f0` — sivun tausta (paperi-tunnelma)
- Chalk `#ffffff` — kortit
- Forged green `#059669` — onnistumiset

**Typografia:**
- Display: **Fraunces** (akateeminen, tyylikäs serif — eroaa SaaS-neonkilpailijoista)
- Body: **Inter** (puhdas, luettava)

**Logo:** Alasin + kirja + kipinä. Minimal, ei ihmishahmoja eikä stock-kuvia.

**Metafora:** *"Forge"* — sepän paja. Työkaluja valmistetaan. Ei "AI magic". Oikeaa käsityötä.

### Ääni (voice)

**Hyviä lauseita:**
- "Your lesson is forged."
- "Made for teachers tired of starting from blank pages at 9 pm."
- "Built for Year 12 AQA Business teachers."
- "Free for five lessons a month. No credit card. No sales call."

**Huonoja lauseita (älä koskaan):**
- "We empower educators." ❌
- "Leverage AI to unlock student potential." ❌
- "Our innovative platform revolutionises lesson planning." ❌
- "Excited to share this game-changing tool!" ❌

**Sävy:** Aikuinen opettaja puhuu toiselle aikuiselle opettajalle iltapäiväkahvilla. Ei koskaan myyntipuhetta ensisijaisena.

### Copy-säännöt

- British English oletus (colour, organise, behaviour)
- Australian English kun AU-markkinaa (sama käytännössä)
- Ei American English (color, organize, behavior) koskaan
- Numerot sanoina alle kymmenen (*"five lessons"*), numeroina yli (*"30 students"*)
- Hinnoissa aina £-symboli ennen numeroa, ei "GBP"

---

## 📅 OSA 2 — DAY 2–9 BUILD PLAN

**Day 1 (21.4) ✅ VALMIS:**
- Kansiorakenne
- Landing page `index.html`
- Lesson Plan Generator `app.html` + Netlify-funktio
- Brand CSS + logo SVG
- `netlify.toml`, `package.json`, `README.md`
- Launch package -dokumentti

### Day 2 (ke 22.4) — Quiz & Exam Builder

**Output:** `/quiz` sivu + funktio `generate-quiz.js`

Rakennetaan sama rakenne kuin lesson planissa mutta:
- Input: subject + level + topic + question type (MCQ / short / essay) + count (5/10/20)
- Output: kysymykset + model answers + markschemes
- PDF: teacher version (with answers) + student version (no answers)

Prompt-systeemi korostaa:
- AQA/Pearson mark scheme syntax (A01, A02, A03)
- Correct exam-style language
- Differentiated difficulty

Arvio: 3–4 h Claude Code.

### Day 3 (to 23.4) — Worksheet Generator

**Output:** `/worksheet` sivu + funktio `generate-worksheet.js`

- Input: topic + level + aktiviteetin tyyppi (practice / investigation / revision)
- Output: student-facing handout (intro, worked examples, 10 practice questions, extension)
- PDF: clean, printable, logolla alareunassa

Arvio: 3 h.

### Day 4 (pe 24.4) — Differentiation Helper

**Output:** `/differentiation` sivu + funktio `generate-differentiation.js`

- Input: base task or resource
- Output: kolme versiota (scaffold / core / stretch) + SEN-muokkaukset + EAL-muokkaukset

Tämä on **opettajien #1 pyyntö** kaikkialla UK:ssa.

Arvio: 3 h.

### Day 5 (la 25.4) — Report Card Comments (killer feature)

**Output:** `/reports` sivu + funktio `generate-reports.js`

- Input: oppilaan nimi + avainsanat (esim. "great effort, weak on essays, helpful in class")
- Output: 3 kommenttia eri pituudella (1 lause, 2 lausetta, 3 lausetta) + tone-valinta (formal/warm/encouraging)
- Bulk-mode: CSV-upload 30 oppilaalle → Excel takaisin

**Tämä MYY Pro-tilauksen yksin.** Opettaja käyttää 15 h/termi tähän.

Arvio: 6 h (bulk-käsittely monimutkaisempi).

### Day 6 (su 26.4) — Auth + Stripe freemium

**Output:** Rekisteröityminen + kirjautuminen + paid tiers

Tech:
- **Supabase** email magic-link auth (ilmainen tier riittää)
- **Stripe** Payment Links (Pro £9/kk, £79/v)
- Usage tracking Supabase-tietokannassa (5/kk free → unlimited Pro)

Arvio: 6 h.

### Day 7 (ma 27.4) — SEO-sivut + onboarding

**Output:** 10 ydinaineen landing-sivut + beta-onboarding-flow

SEO-sivut:
- `/for/business-teachers`
- `/for/maths-teachers`
- `/for/english-teachers`
- ... jne. 10 kpl

Jokainen: H1 + 3 käyttötapaus + 1 example output + CTA.

Onboarding-flow rekisteröitymisen jälkeen:
- 3-stepin tutoriaali
- Ensimmäinen "Forge my first plan" autopilot

Arvio: 4 h.

### Day 8 (ti 28.4) — Polish + mobile + performance

**Output:** Viimeistely

- Mobile CSS (jo alussa, mutta hiottu)
- Lighthouse score > 95
- OG-tags, Twitter cards
- Favicon, Apple touch icon
- 404-sivu, privacy policy, terms

Arvio: 3 h.

### Day 9 (ke 29.4) — Launch

**Output:** Julkinen launch + beta-teachers

- LinkedIn-postaus (valmis alla)
- FB-ryhmäpostaus (Business Studies Teachers UK, HSC Business, VCE jne.)
- TES-forum postaus
- Reddit r/TeachingUK
- 50 "Founding Teachers" -sähköpostia (Apollo-listalta)
- Product Hunt launch (valinnainen, korkeampi kuuluvuus)

Arvio: 4 h kokonaisia.

---

## 🎓 OSA 3 — "FOUNDING TEACHERS" -BETA-KUTSU

### LinkedIn-postaus (launch-päivänä 29.4)

> Building something new alongside The Business School.
>
> It's called **LessonForge** — AI-assisted lesson plans, quizzes, worksheets and report comments for any subject, Year 1 to university.
>
> Why build this when Magic School AI already exists? Because they're built on US common core. LessonForge is built on UK AQA, Pearson, OCR, WJEC, Scottish CfE and Australian ACARA, HSC, VCE. Different specs, different exam language, different pedagogy.
>
> Looking for 50 **Founding Teachers** to test it free for 6 months. In exchange:
> - 15 min feedback call after 2 weeks of use
> - Permission to quote you anonymously in launch materials
> - Your input shapes what we build next
>
> If you teach Primary, Secondary, Sixth Form or university-level business — comment "forge" or DM me. First 50 only.
>
> Link: lessonforge.uk
>
> — Sakari, TBS Education Ltd Oy (3614159-3)

### Sähköposti "Founding Teachers" -listalle

**Subject:** 50 Founding Teachers — free 6 months of LessonForge

> Hi [First name],
>
> Built a new thing alongside The Business School. It's called **LessonForge** — AI lesson plans, quizzes, worksheets and report card comments. Any subject, Year 1 to university. UK/AU curriculum first.
>
> 50 Founding Teacher spots: free 6 months of Pro (£54 value). In exchange, 15 minutes of feedback after two weeks.
>
> If you teach [subject] at [school] and want in:
>
> **lessonforge.uk/founding**
>
> Sakari
> Founder · TBS Education Ltd Oy · company number 3614159-3

### Facebook-ryhmäpostaus

> Quick share — just launched **LessonForge**, AI tool for lesson planning, quizzes and report comments. UK AQA/Pearson/OCR + AU HSC/VCE built in.
>
> 50 free Founding Teacher spots for six months. Comment "forge" if interested.
>
> Not selling hard — happy to answer questions below. Sakari, TBS Education Ltd Oy.

---

## ✅ OSA 4 — SAKARIN TODO ENNEN LAUNCHIA

Tehtävä järjestys on tärkeä. Tee ylhäältä alas.

### Day 1–2 (21.–22.4, välittömästi)

1. **Osta domain** — `lessonforge.uk` porkbun.com:sta. £8/v. Jos varattu, varavaihtoehto `lessonforge.com` tai `getlessonforge.com`.

2. **Avaa Anthropic API -tili** — console.anthropic.com → luo avain → lisää $10 krediittejä.

3. **Avaa Netlify-tili** (jos ei jo) — netlify.com. Ilmainen. Käytä samaa tunnusta kuin tbs-demo-tbs.

4. **Avaa Stripe-tili** (TBS Education Ltd Oy) — stripe.com/gb. 1–2 päivää käsittelyä. Aloita heti.

5. **Avaa Supabase-tili** — supabase.com. Ilmainen tier riittää.

### Day 3–4

6. **Ensimmäinen deploy** — raahaa `lessonforge/`-kansio Netlifyyn (ei zip). Aseta `ANTHROPIC_API_KEY` env-variksi.

7. **Testaa Lesson Plan Generator** — kokeile 5 eri aineella (Business, Maths, English, Science, History).

8. **Kytke domain** — Netlify Domain Settings → lisää lessonforge.uk. Päivitä DNS porkbunilla. HTTPS aktivoituu itsestään.

### Day 5–8

9. **Seuraa Claude Code -build-progressia** — joka päivä 1 uusi työkalu julkaistaan.

10. **Valmistele 50 Founding Teacher -listaa** — Apollo-haku: UK Primary/Secondary teachers, kaikki aineet, täytyy olla 2+ LinkedIn-yhteys. Tavoite: 200 lähetettävää sähköpostia = 50 sign-upia (25% conversion realistinen).

### Day 9 (launch 29.4)

11. **Aja launch-checklista:**
    - [ ] LinkedIn-postaus klo 19:00 Suomen aikaa
    - [ ] FB-ryhmät 3 kpl (ei enempää, spam-riski)
    - [ ] TES-forum postaus
    - [ ] Reddit r/TeachingUK
    - [ ] 50 sähköpostia Founding Teachers -listalle
    - [ ] WhatsApp Muhammadille: "LessonForge live"
    - [ ] Lisää LessonForge-linkki `thebusiness.school` -alareunaan

12. **Tarkista joka tunti:** Netlify analytics, Stripe dashboard, Supabase auth events. Korjaa 15 min sisällä jos joku ei toimi.

---

## 📊 OSA 5 — ODOTETUT METRIIKAT (realistiset)

### Launch-viikko (29.4–5.5)

| Mittari | Tavoite | Stretch |
|---------|---------|---------|
| Sivun katsojia | 500 | 1,500 |
| Rekisteröityneitä | 50 | 120 |
| Pro-tilauksia (£9) | 2 | 5 |
| Founding Teacher -hyväksyntöjä | 20 | 40 |

### Kuukausi 1 (toukokuu)

| Mittari | Tavoite |
|---------|---------|
| Rekisteröityneitä yhteensä | 300 |
| Aktiivisia 7+ päivää | 120 |
| Pro-tilauksia | 15–25 |
| MRR | £135–225 |
| TBS-sim conversions (cross-sell) | 2–5 |

### 3 kuukautta (heinäkuu 2026)

| Mittari | Tavoite |
|---------|---------|
| Kaikki rekisteröityneet | 1,500 |
| Pro-tilauksia | 80–120 |
| MRR | £720–1,080 |
| Ensimmäinen School-lisenssi (£349) | 1–2 |
| TBS-sim conversions LessonForge:sta | 10–20 |

### Vuosi 1 (huhtikuu 2027)

| Mittari | Tavoite |
|---------|---------|
| Rekisteröityneitä | 8,000 |
| Pro-tilauksia | 400–500 |
| MRR | £3,600–4,500 |
| School-lisenssejä | 10–15 × £349 |
| **Kokonais-ARR** | **£55,000–70,000** |

Yhdessä TBS-simin kanssa (Q1 2027 ARR arvio £50k): **£105–120k ARR** = ~€9–10k/kk = **Sakarin €4–5k/kk nettotavoite ylitetty merkittävästi**.

---

## 🎯 OSA 6 — MITKÄ METRIIKAT SEURATAAN PÄIVITTÄIN

Pidä Google Sheetissä "LessonForge Daily":

| Kohta | Mitattu |
|-------|---------|
| **Uusia rekisteröityjä** | Supabase auth events |
| **Aktiivisia käyttäjiä (DAU)** | Lesson plan generointien määrä / päivä |
| **Funnel-conversio** | Käynyt landing → registered → used once → paid |
| **Churn** | Pro → Free downgrade tai cancelled |
| **Tärkeimmät käyttötapaukset** | Mitä työkaluja käytetään eniten (Lesson Plan vs Reports) |
| **Quality metric** | Kuinka moni Forge-klikkaus tuottaa "Copy" tai "Print" toimenpidettä (= opettaja käytti oikeasti) |
| **Error rate** | Funktion 500-virheet / päivä |
| **API-kustannus** | Päivittäinen Anthropic-ruutu |

Jos jokin metriikka on jumissa → iteratii pelaamallaviikon aikana.

---

## 🚨 OSA 7 — RISKIT

### Riski 1: Magic School AI / Diffit iskee UK-markkinaan

**Mitigaatio:** Rakenna curriculum-data-syvyys niin tarkaksi että kopiointi on 6+ kk työ. AQA-spec-mapping 500 topicille on paras moat.

### Riski 2: Anthropic API hinnat nousevat

**Mitigaatio:** Prompt-engineering niin että kustannus pysyy < $0.02/plan. Käyttö > 500 plan/pv → siirrytään Sonnet 4.5 → Haiku halvempiin pyyntöihin.

### Riski 3: Opettajat eivät uskalla luottaa AI:hin

**Mitigaatio:** Jokainen PDF-lähtö: *"AI-generated draft — always review before using in class."* Myy opettajan kontrolli, ei AI-maagia.

### Riski 4: Ristiriidat TBS-brändin kanssa

**Mitigaatio:** Selkeä brändi-hierarkia. TBS Education Ltd Oy = parent. The Business School = peli. LessonForge = työkalut. Kumpikin tukee toista.

### Riski 5: Sakari burnout

**Mitigaatio:** Päivän kohtainen to-do on maksimi 3 h per päivä seuraavan 9 päivän ajan. Jos joku osa venyy, siirretään Day 10+. Pilot on ensisijainen.

---

## 🤝 OSA 8 — LESSONFORGE × TBS CROSS-FUNNEL

LessonForgen oikea arvo TBS:lle ei ole pelkkä oma tulo — vaan että se tuo TBS-piloteille opettajia.

### Cross-funnel-mekaniikka

1. **LessonForge-käyttäjä** generoi Business-lesson planin.
2. PDF:n alareunassa: *"Want a live 60-min classroom sim for this topic? Try TBS free → thebusiness.school/founding"*
3. Opettaja klikkaa → lähtökyselyssä näkee että LessonForge-käyttäjät saavat **10% alennuksen** Founding Lifetime -paketista (£179 vs £199).
4. 10% LessonForge-Business-käyttäjistä kokeilee TBS-pilottia = merkittävä lead-lisäys.

### Samoin toiseen suuntaan

1. **TBS-pilot-opettaja** session jälkeen näkee Welcome-sähköpostissa: *"You get 3 months of LessonForge Pro free as a Founding School."*
2. 60% kokeilee. 30% jää maksajaksi.
3. Tämä **laskee TBS-simin net-CAC:ia** ja luo toisen stickiness-kerroksen.

Yhdessä ne ovat **kaksi tuotetta, yksi ekosysteemi**. Opettaja ostaa tai ei osta tuotteen, mutta päätyy TBS:n asiakkaaksi kumpaakin kautta.

---

## 🎬 VALMIS ALOITUS — AJA NÄMÄ KOMENNOT TÄNÄÄN

Kopioi ja liitä — 15 minuutin työ.

**1. Tarkista domain:**
Mene porkbun.com → hae `lessonforge.uk` → osta jos vapaa (£8/v).

**2. Hanki Claude-avain:**
console.anthropic.com → Get API Keys → Create Key → nimi "lessonforge-prod" → kopioi → lisää $10 krediittejä.

**3. Deploy ensimmäinen versio:**
Netlify.com → "Add new site" → "Deploy manually" → raahaa **koko `lessonforge/`-kansio** (EI zip) → odota 30 s → valmis.
Site settings → Environment variables → `ANTHROPIC_API_KEY` = (äskeinen avain) → Deploys → Trigger deploy.

**4. Testaa:**
Avaa uusi site-url → klikkaa "Forge a lesson plan →" → täytä form → odota 30 s → tuloksen pitäisi ilmestyä.

Jos toimii → LinkedIn-teaser: *"Been building something on the side. More on Monday."*

Jos ei toimi → WhatsApp minulle (tai Claude-istunto) → debugataan.

---

**Sakari, tämä on lähtölaukaus. Onnea 9 päivän matkalle.**

*— LessonForge Day 1 MVP package · 21.4.2026*
