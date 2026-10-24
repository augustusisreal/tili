# Lavdesign Tilinpäätös & 6B-Apuri

Suomenkielinen SaaS-apuri osakeyhtiöiden tilinpäätökseen ja Verohallinnon **6B**-veroilmoitukseen (PMA / KPL).

## Käynnistys

```bash
npm install
npm run dev
```

Avaa [http://localhost:3000](http://localhost:3000).

## Ominaisuudet

- 13-vaiheinen wizard + tilakone (Zustand)
- Deterministinen TypeScript-laskentamoottori (ei LLM-lukuja)
- PRH Y-tunnus -haku (`/api/prh/[ytunnus]`)
- Tumma / vaalea Linear–Stripe-tyylinen UI
- 6B-kenttäkartoitus + kopiointi
- Tilinpäätös-PDF (`@react-pdf/renderer`: kansilehti, tulos, tase, allekirjoitukset)
- Drag & drop -tiedostolataus (pääkirja, tiliotteet, kuitit) selaimen muistiin
- AI-tiliotteen parsinta (`/api/parse-document`) — IBAN + 31.12. loppusaldo → pankkikentät

### AI-ympäristömuuttujat

Kopioi `.env.example` → `.env.local` ja aseta vähintään yksi:

- `OPENAI_API_KEY` (oletusmalli `gpt-4o-mini`)
- tai `GOOGLE_GENERATIVE_AI_API_KEY` / `GEMINI_API_KEY` (oletus `gemini-2.5-flash`)

## Skriptit

| Komento | Kuvaus |
|---------|--------|
| `npm run dev` | Kehityspalvelin |
| `npm run build` | Tuotantobuild |
| `npm run start` | Käynnistä build |
| `npm run lint` | ESLint |
