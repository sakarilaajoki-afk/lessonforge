# LessonForge — Strategic Roadmap

**Kysymys johon kaikki vastaa:** *Miksi opettaja valitsisi LessonForge £9/kk:lla kun ChatGPT on ilmainen?*

Jos emme vastaa tähän kysymykseen selkeästi, **meillä ei ole bisnestä**. Jokainen feature, prompt, PDF, button tässä dokumentissa valitaan tukemaan tätä yhtä vastausta.

---

## 🎯 POSITIOINTI — Missä olemme ChatGPT:n, Magic Schoolin ja Diffitin suhteen

### ChatGPT (ilmainen)
**Mitä se osaa:** Geneerinen lesson plan, mikä tahansa kieli/aihe, ei curriculum-tietoa, opettaja copy-pastea tuloksen itse.
**Mitä se EI osaa:** UK curriculum-spesifisyys, linkit oikeisiin resursseihin, exam-board-tarkkuus, PDF-jako, taulukkoon tallennus.

### Magic School AI (USA, 3M opettajaa)
**Mitä se osaa:** 60+ työkalua, US common core, polished UI, big brand trust.
**Mitä se EI osaa:** UK/AU curriculum, AQA/Pearson exam-style, British English nyansseja, GDPR-strict data handling.

### Diffit (USA, 500k opettajaa)
**Mitä se osaa:** Differentiation (adapt any text to 5 reading levels), article → worksheet automation.
**Mitä se EI osaa:** Lesson plans, exam prep, UK curriculum, report comments.

### LessonForge — meidän **ainutlaatuinen** kulma:

```
"The only AI teacher tool built FROM the UK and Australian
 curriculum, not translated INTO it. Every output comes with
 real resources, not just text."
```

Kolme moattia:
1. **UK/AU curriculum-native** — AQA, Pearson, OCR, WJEC, ACARA, HSC, VCE spec-koodit ja exam-style tarkasti
2. **Resource-stitched outputs** — jokainen lesson plan tulee 3 YouTube-linkillä + 2 news-artikkelilla + 1 past paper -viitteellä + 1 vapaa download (kuratoidut)
3. **Teacher-first, school-last** — myymme opettajille suoraan (£9/kk), ei kouluhallinnolle — eri go-to-market kuin kilpailijat

---

## 🔥 KOLME "WAIT, THIS IS DIFFERENT" -OMINAISUUTTA

Tämä on se *miksi* opettaja avaa LessonForge:n ChatGPT:n sijaan. Ei pelkkä "ChatGPT wrapper with pretty UI".

### 💎 Killer Feature #1 — **Live Resource Stitching**

Jokainen lesson plan ei tule pelkkänä tekstinä. Se tulee:

- ✅ **3 curated YouTube-linkkiä** (tutor2u, Khan Academy, SaveMyExams) — tarkistettu laadulle
- ✅ **2 uutisartikkelia viime 7 päivältä** (BBC News, Guardian, FT) jotka kytkeytyvät aiheeseen
- ✅ **1 past paper -referenssi** (AQA/Pearson/OCR open resources)
- ✅ **1 ilmainen download** (TES free resource, infographic, printable worksheet)

**Mikä ChatGPT ei tee:** ChatGPT:n tietokanta on staattinen — se ei tiedä mitä uutisia on tullut tällä viikolla. Meillä on **live web-haku** + **kuratoidut resurssilistat**.

Toteutus: Web Search API + maintained resource index (`resources.json` repossa).

Käyttäjälle näkyy: laatikko lesson plan -output:n alla:
```
📚 RESOURCES TO ENRICH THIS LESSON:

🎬 Watch
  • tutor2u: Pricing Strategies Explained (8 min)
  • Khan Academy: Price Elasticity in 10 min
  • SaveMyExams: AQA Business Unit 3 Walkthrough

📰 Real-world links (this week)
  • Guardian (Apr 18): Tesla cuts prices 20% — penetration vs skimming debate
  • FT (Apr 20): M&S profit surges — premium pricing case study

📋 Practice past papers
  • AQA 7132 Paper 1 June 2024 Q2 (pricing strategy evaluation, 9 marks)

📄 Free download
  • TES: Pricing Strategies Worksheet (PDF, 4 pages, 247 downloads)
```

**Tämä yksin myy £9/kk.** Opettaja säästää 45 min per lesson search-työtä.

### 💎 Killer Feature #2 — **Exam Board Fingerprinting**

Ei geneeristä "exam question". Vaan:

- **AQA:** 9-marker with AO1 (3) + AO2 (3) + AO3 (3) structure — täsmälleen heidän styllinsä
- **Pearson Edexcel:** 12-marker with AO1/AO2/AO3/AO4 balance, command verb "assess" vs "evaluate"
- **OCR:** B-style short + long answer mix
- **Cambridge IGCSE:** Section A short + Section B extended

Generoi mark schemes jotka **oikeasti näyttävät** AQA:n mark schemeeltä (bullet-point structure, command word references).

**Mikä ChatGPT ei tee:** Se tuottaa "exam-style question" mutta AO-structure on lottoarpaamista. Meillä on **exam-board-specific prompts + validation rules**.

### 💎 Killer Feature #3 — **Scheme of Work Chain**

Ei vain yksi lesson plan. **6-viikon scheme of work** joka rakentuu opetustavoitteesta:

- Viikko 1: Intro → Basic definitions
- Viikko 2: Application → case study #1
- Viikko 3: Analysis → numerical work
- Viikko 4: Evaluation → synoptic practice
- Viikko 5: Exam practice → past paper
- Viikko 6: Assessment → end-of-unit test

Jokainen lesson seuraa Rosenshinen periaatteita:
- Retrieval practice edellisestä
- Interleaved practice
- Worked examples
- Guided practice
- Independent practice

Plus: jokaiseen viikkoon automaattinen **homework chain** ja **mid-unit quiz**.

**Mikä ChatGPT ei tee:** Ei pidä kontekstia yli yksittäisen vastauksen. Meillä on **"scheme of work"-tietokanta** tallennettuna.

**Tämä myy School-lisenssin (£349/v)** koska Head of Department haluaa scheme of work -arkiston.

---

## 📅 ROADMAP — 6 VIIKKOA, 3 FAASIA

### FAASI 1: QUALITY OVER QUANTITY (viikot 17–18, 22.4.–4.5.)

**Tavoite:** 3 työkalua jotka ovat **mittavaa parempia kuin ChatGPT**.

#### Viikko 1 (22.–28.4)

- **Day 2 (ti 22.4):** Lesson Plan v2 — lisää case study generation + AQA exam questions + slide outline. Prompt engineering tarkkana.
- **Day 3 (ke 23.4):** **Resource Stitching v1** — Web Search API + kuratoitu resource index. Jokainen lesson plan tulee resurssi-laatikolla.
- **Day 4 (to 24.4):** **Report Card Comments** — yksittäinen oppilaan versio (bulk v2:ssa). 3 tone × 3 pituus. PDF-export.
- **Day 5 (pe 25.4):** PDF-polish — Puppeteer-based A4 PDF, LessonForge-logolla, opettaja-ystävällinen formaatti.
- **Day 6 (la 26.4):** Testaa 20 lesson plania × 5 aineella → parantele promptteja laatupalautteen mukaan.
- **Day 7 (su 27.4):** Rest + plan.

#### Viikko 2 (29.4.–5.5)

- **Day 8 (ma 28.4):** Quiz Generator — AQA-style mark schemes, AO-tagging.
- **Day 9 (ti 29.4):** Worksheet Generator — student handout PDF (instructions + questions + answer key separate pages).
- **Day 10 (ke 30.4):** Differentiation Helper — scaffold/core/stretch + SEN + EAL.
- **Day 11 (to 1.5):** Bulk Report Comments (CSV upload → Excel output, 30 students 10 min).
- **Day 12 (pe 2.5):** Auth (Supabase magic link) + Stripe Payment Link freemium gate.
- **Day 13 (la 3.5):** SEO landing pages 10 aineelle (`/for/maths-teachers`, jne.).
- **Day 14 (su 4.5):** QA + bug hunt.

### FAASI 2: DIFFERENTIATORS (viikot 19–20, 5.–18.5)

**Tavoite:** 2 ainutlaatuista ominaisuutta jotka **ei ole missään muualla**.

#### Viikko 3 (5.–11.5)

- **Day 15–17:** Scheme of Work Builder (6-viikon chain, Rosenshine-aligned)
- **Day 18–19:** Resource Index expansion — 500+ curated links 10 subject × UK spec + AU
- **Day 20–21:** Admin dashboard (School-tier preview)

#### Viikko 4 (12.–18.5)

- **Day 22–24:** Current Events auto-tagger — weekly cron, fetches UK business/science news, maps to curriculum topics, teacher gets "hot topics this week" feed
- **Day 25–28:** Polish, mobile, accessibility audit, performance (<2s load)

### FAASI 3: LAUNCH (viikot 21–22, 19.5.–1.6)

**Tavoite:** 500 signups, 50 Pro-tilaajia, 5 School-pilot.

#### Viikko 5 (19.–25.5)

- **Day 29–30:** Beta-launch 50 Founding Teacher -listalle (Apollo + LinkedIn)
- **Day 31–33:** Iterate based on beta feedback
- **Day 34–35:** PR + LinkedIn launch + FB-ryhmät

#### Viikko 6 (26.5.–1.6)

- **Day 36–38:** Product Hunt launch, TES partnership tasaus
- **Day 39–42:** First 5 School-lisenssi -neuvottelut

---

## 🏆 SUCCESS METRICS — miten tiedämme voitimme

### Viikko 1 loppu (28.4):
- [ ] Lesson Plan v2 toimii UK curriculumilla, sisältää resource links
- [ ] Report Card Comments tuottaa "wow" -reaktion vähintään 3 pilot-opettajalta
- [ ] PDF näyttää aikuismaiselta resurssilta

### Viikko 4 loppu (18.5):
- [ ] Resource Index = 500+ curated linkit
- [ ] 5 toimivaa työkalua
- [ ] Beta-testaajilta palaute: "I'd pay £9/month for this" ≥ 7/10

### Viikko 6 loppu (1.6):
- [ ] 500 signups
- [ ] 50 Pro (£9/kk) = **£450/kk MRR**
- [ ] 5 Schools neuvottelussa (£349/v × 5 = £1,745/v pipeline)

### 3 kk (31.7):
- [ ] 2,000 signups
- [ ] 150 Pro = **£1,350/kk MRR**
- [ ] 3 allekirjoitettua School-lisenssiä

### 12 kk (30.4.2027):
- [ ] 10,000 signups
- [ ] 500 Pro = **£4,500/kk MRR** = Sakarin €4-5k/kk nettotavoite **ylitetty**
- [ ] 15 School-lisenssiä = **£5,235/v** lisää
- [ ] Yhdistettynä TBS-simin kanssa kokonaisraha-virta Sakarille > €7k/kk

---

## 🎯 KILPAILIJA-BATTLE CARDS

### vs ChatGPT

**Opettajan kysymys:** *"Miksi maksaisin £9/kk kun ChatGPT on ilmainen?"*

**LessonForge vastaus:**
1. ChatGPT ei tunne AQA-spec. LessonForge kyllä.
2. ChatGPT antaa sinulle tekstiä — sinun on googlattava resurssit erikseen (45 min). LessonForge antaa ne mukana.
3. ChatGPT:n exam questions eivät täytä exam board style -vaatimuksia. LessonForge:n kyllä.
4. ChatGPT ei säästä report card -aikaa. LessonForge tekee 30 oppilaan kommentit 10 minuutissa.
5. £9 = 2 pintaa kahvilassa. Ajassa säästät 15 h/kk.

### vs Magic School AI

**Opettajan kysymys:** *"Magic School:ssa on 60 työkalua, LessonForge:ssa 5 — miksi valitsisin pienemmän?"*

**LessonForge vastaus:**
1. Magic School on built on US Common Core. LessonForge on built on AQA/Pearson/OCR/WJEC.
2. Magic School:n exam questions eivät matchaa UK exam-board-style. LessonForge:n kyllä.
3. Magic School:n resource-libraries ovat US-linkkejä. LessonForge käyttää tutor2u, BBC Bitesize, SaveMyExams, TES.
4. Magic School on $7.50/month (US). LessonForge on £9/month (UK) — sama hinta, UK-curriculum.
5. Haluatko aurinkoasi amerikkalaiseksi käännettynä vai UK-alkuperäisenä?

### vs Diffit

**Opettajan kysymys:** *"Käytän Diffit:iä differentiointiin. Miksi vaihtaisin?"*

**LessonForge vastaus:**
1. Diffit tekee differentiation. LessonForge tekee lesson plan + quiz + worksheet + differentiation + report comments + scheme of work. Yksi työkalu vs viisi.
2. Diffit ei tiedä UK-spec. LessonForge tietää.
3. Diffit:n käyttö vaatii sinulta base-tekstin. LessonForge generoi koko lesson ground-upista.
4. Voit käyttää molempia — mutta yksi tilaus riittää.

---

## 💰 UNIT ECONOMICS — Milloin tämä on kannattavaa

**Kustannus per aktiivinen käyttäjä/kk:**
- Claude API: ~$0.15/kk (olettaen 15 generointia)
- Netlify: free-tier riittää 100k requestia/kk
- Supabase: free-tier riittää 50k rows
- Total: ~$0.15

**Tulo per Pro-käyttäjä:**
- £9/kk × 12 kk × 0.75 retention = £81/v

**LTV:CAC targets:**
- CAC (cost to acquire): £3 max via organic LinkedIn + FB
- LTV: £81
- **LTV/CAC = 27:1** → extreme outlier, healthy SaaS on 3:1

**Break-even:** 50 Pro-tilaajaa kattaa kaikki kulut
**Healthy:** 150 Pro-tilaajaa = €1,500/kk net profit

Näitä lukuja voidaan hakea 3 kk sisällä jos launch onnistuu.

---

## 🛠️ PÄIVITTÄINEN WORKFLOW — miten Claude (sinä) tekee tätä

### Aamu (Sakari avaa chatin)

> *"Hei Claude. Tänään on Day [X]. Tehdään [ROADMAP:sta kohta]. Tsekkaa ensin miten eilisen [palaute/testaus] meni."*

### Claude's todo (koodaus + push)

1. **Clone repo** — `git pull origin main`
2. **Lue ROADMAP.md** tarkistaaksesi päivän tehtävät
3. **Koodaa** — 1–3 h fokusoitua työtä
4. **Testaa paikallisesti** — varmista että ei riku
5. **Commit** — merkityksellinen viesti, esim. *"Day 3: add resource stitching to lesson plan output"*
6. **Push** — `git push origin main`
7. **Ilmoita Sakarille** — *"Day 3 pushed. Testaa tämä: [specific cases]. Kerro miten menee."*

### Ilta (Sakari testaa)

- Avaa `lessonforge.uk` (tai Netlify-URL)
- Testaa uusi ominaisuus
- Kerro Claude:lle WhatsApp / chat:
  - *"Toimi!"* → seuraavana päivänä Day X+1
  - *"Ei toimi: [bug]"* → Claude korjaa
  - *"Lesson plan tuntuu edelleen meh"* → iterate prompt

### Viikottain (lauantaisin)

- Sakari lukee Claude:n kuvan edistyksestä
- Päivitetään ROADMAP.md jos tarvitaan muutoksia
- Metrit: signups, Pro conversions, feedback-score

---

## 🔐 SECURITY & TRUST

Koska opettajat käsittelevät oppilaiden tietoja:

1. **Student names never stored** — Report Comments -bulk häviää 24 h jälkeen
2. **No training on user content** — Anthropic API default: `no-train` flag päällä
3. **GDPR-compliant** — EU/UK-based Netlify hosting, DPA template saatavilla
4. **Teacher verification** — Pro-tilaus vaatii school email (jossain vaiheessa)
5. **Clear privacy policy** — julkisesti saatavilla heti launchissa

Tämä erottaa meidät Magic School:sta (US-hosting, data-policy vähemmän strict UK-silmin).

---

## 📝 PÄIVÄKIRJA — mitä on tehty

**21.4 (Day 1):** MVP rakenne pystyyn. Landing page, Lesson Plan Generator v1, brand, Netlify deploy. Env var setup. Ensimmäinen lesson plan generoitu.

**[Seuraavat päivät lisätään tähän]**

---

*Tämä dokumentti on elävä. Päivitetään joka viikko. Jos joku kohta ei toimi, muutetaan suuntaa — mutta aina vastaten siihen ensimmäiseen kysymykseen: miksi opettaja valitsee tämän ChatGPT:n sijaan.*

**Viimeisin päivitys:** 21.4.2026
**Vastuu:** Sakari Laajoki (founder) + Claude (build)
**Seuraava checkpoint:** 28.4.2026 (Viikko 1 loppu)
