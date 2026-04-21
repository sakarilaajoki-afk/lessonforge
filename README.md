# LessonForge

**AI-työkalupakki opettajille.** Lesson plan, quiz, worksheet, differentiation, report comments — mikä tahansa aine, Primary → University.

Parent-yhtiö: **TBS Education Ltd Oy** (company number 3614159-3). Brändi- ja funnel-osa TBS-strategiassa.

---

## 🏗️ Mitä tässä on (Day 1 MVP)

- `index.html` — landing page (hero, features, pricing, CTA)
- `app.html` — Lesson Plan Generator (toimiva)
- `styles.css` — täysi LessonForge-brändi (Fraunces display + Inter body, ember-palette)
- `brand/logo.svg` — logo (anvil + book + ember)
- `netlify/functions/generate-lesson-plan.js` — Claude-API-proxy (API-key pysyy serverissä)
- `netlify.toml` — deploy-konfiguraatio
- `package.json` — node metadata

Tyyliltään valmis tuote. Toimiva Lesson Plan Generator kun Claude API -avain asetettu.

---

## 🚀 Miten deployaat Netlifyyn (15 min työtä)

### 1. Osta domain (jos et jo) — 5 min
Mene **porkbun.com** → tarkista ja osta **lessonforge.uk** (tai .com). Sakarille.

### 2. Hanki Anthropic API -avain — 5 min
- Mene [console.anthropic.com](https://console.anthropic.com)
- "Get API keys" → luo uusi avain nimellä "lessonforge-prod"
- Kopioi avain (alkaa `sk-ant-api03-...`)
- Lisää **$10 krediittejä** (kestää kauan — lesson planin hinta ~$0.01 per generointi)

### 3. Deploy Netlifyyn — 5 min
- Mene [app.netlify.com/drop](https://app.netlify.com/drop)
- Raahaa KOKO `lessonforge/` -kansio (**ei zip**) pudotuslaatikkoon
- Netlify luo uuden siten
- Avaa site settings → **Change site name** → `lessonforge`
- **Site settings → Environment variables → Add**:
  - Nimi: `ANTHROPIC_API_KEY`
  - Arvo: (liitä äsken kopioitu avain)
- Deploy → **Deploys-välilehti → Trigger deploy** (jotta funktio saa env-varin)

### 4. Kytke oma domain (kun ostettu) — 5 min
- Netlify → **Domain settings → Add custom domain**
- Kirjoita `lessonforge.uk`
- Netlify antaa DNS-ohjeet (yleensä CNAME)
- Mene porkbun.com → DNS-asetuksiin → lisää CNAME Netlifyn ohjeiden mukaan
- Odota 10–30 min → HTTPS aktivoituu automaattisesti

Valmis. Sivu on elossa `https://lessonforge.uk`.

---

## 🧪 Miten testaat ennen deployta (paikallisesti)

Asenna Netlify CLI kerran:
```
npm install -g netlify-cli
```

Kansiossa `lessonforge/`:
```
netlify login
netlify link  (tai: netlify init)
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
netlify dev
```

Avaa `http://localhost:8888`. Landing page + app.html toimivat paikallisesti.

---

## 🗂️ Tiedostolista

```
lessonforge/
├── index.html                      Landing page
├── app.html                        Lesson Plan Generator
├── styles.css                      Brand CSS (Fraunces + Inter + ember palette)
├── netlify.toml                    Netlify build + redirects + headers
├── package.json                    Node metadata
├── README.md                       Tämä tiedosto
├── brand/
│   └── logo.svg                    Logo (anvil + spark)
└── netlify/
    └── functions/
        └── generate-lesson-plan.js Claude API proxy
```

---

## 🛠️ Mitä tulee seuraavaksi (Days 2–9)

Tämä on Day 1 MVP. Jäljellä:

**Day 2–3:** Quiz & Exam Builder (uusi Netlify-funktio + UI)
**Day 4:** Worksheet Generator
**Day 5:** Differentiation Helper
**Day 6:** Report Card Comments (killer feature — 30 oppilaan kommentit 10 min:ssä)
**Day 7:** Auth (Supabase magic link) + Stripe freemium (5 free → £9/kk)
**Day 8:** SEO-sivut TOP 10 aineelle + onboarding tour
**Day 9:** Launch — LinkedIn post + FB-ryhmät + TES + 50 "Founding Teachers" -beta-kutsu

Kaikki nämä päivitetään tähän kansioon. Netlifyn auto-deploy (jos GitHub-yhteys) tai käsin-drop riittää.

---

## 💰 Kustannukset

| Erä | Summa |
|-----|-------|
| Domain (lessonforge.uk) | £8/v |
| Netlify | £0 (free tier riittää) |
| Anthropic API | ~$5–15/kk (riippuu käyttäjämäärästä) |
| Stripe | 1.4% + 20p per transaction (ei kuukausimaksua) |
| **Yhteensä kk alussa** | **~£15** |

Kustannus kasvaa vain jos käyttäjiä tulee — ja joka käyttäjä maksaa takaisin kk-hinnan.

---

## 🎯 Hinnoittelu

| Tier | Hinta | Rajoitus |
|------|-------|----------|
| Free | £0 | 5 lesson planeja/kk, LessonForge-footer PDF:ssä |
| Pro | £9/kk tai £79/v | Unlimited, ei footeria |
| School | £349/v | Kaikki opettajat, admin dashboard |
| MAT | £249/koulu/v (5+) | Multi-school |
| University | £699/v per osasto | Custom |

---

## 📬 Kontakti

Sakari Laajoki · TBS Education Ltd Oy · company number 3614159-3
hello@lessonforge.uk (kun domain aktivoituu)
thebusiness.school (TBS-sim — LessonForge:in sisarprodukti)

---

## 🎓 Liittymä TBS:ään

LessonForge ja The Business School ovat **sisaruotteita** saman brändin alla:
- **Lesson Plan Generator** → opettaja löytää LessonForge:n → näkee Business-aihepiirissä *"Want a live sim for this?"* → linkki `thebusiness.school/founding`
- **TBS pilot** → opettaja saa demon → näkee ylätunnisteessa *"Powered by LessonForge"* → kokeilee muutkin työkaluja

Kahden tuotteen välinen funnel compound eliminoi jokaisen yksittäisen tuotteen CAC:n.
