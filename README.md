# 🔥 Questly

Eine spielerische Quest-App als Progressive Web App – mit deinem Begleiter **Funke**, einem kleinen Flammenwesen, das mit dir wächst.
Komplett offline, ohne Server, ohne Login. Alle Daten bleiben auf deinem Gerät (IndexedDB).

## Funktionen

- **Tagesquests** – jeden Tag (ab 5 Uhr, einstellbar) 3–5 Quests aus einem Pool von 90, möglichst aus verschiedenen Kategorien, keine Wiederholung der letzten 7 Tage, höchstens eine epische. 1× pro Tag neu würfeln.
- **Eigene Quests** – einmalig, täglich oder an bestimmten Wochentagen.
- **Fortschritt** – XP, Level (steigende Kurve), Tages-Serie, Statistik pro Kategorie, Aktivitäts-Kalender und Abenteuer-Tagebuch mit Notizen.
- **Funke** – Pixel-Art-Begleiter mit 4 Entwicklungsstufen, Stimmungen (fröhlich, stolz, schläfrig nach 2+ inaktiven Tagen – nie bestraft), 70+ Sprüchen und 15 freischaltbaren Accessoires.
- **Extras** – JSON-Backup (Export/Import), Tageswechsel-Uhrzeit, Anzahl Tagesquests, Kategorien an/aus, Dunkel/Hell.

## Entwicklung

```bash
npm install
npm run dev      # Entwicklungsserver
npm test         # Unit-Tests (Tageswechsel, Streak, Level, Ziehung, Datenbank, Backup …)
npm run build    # Produktions-Build nach dist/
npm run icons    # App-Icons aus dem Funke-SVG neu erzeugen (braucht Playwright)
```

### Projektstruktur

```
src/
  lib/          reine Logik (Datum/Tageswechsel, Level, Streak, Ziehung, Funke) + Tests
  data/         Quest-Pool, Kategorien, Sprüche, Accessoires
  db/           Dexie-Datenbank + Repository (alle Schreibzugriffe) + Tests
  state/        AppContext: Live-Daten, Funke-Reaktionen, Level-Ups
  components/   Funke (prozedurales Pixel-SVG), Quest-Karten, UI-Bausteine
  screens/      Heute · Meine Quests · Tagebuch · Funke · Einstellungen
```

## Deployment (GitHub Pages)

Die Action in `.github/workflows/deploy.yml` testet jeden Push und veröffentlicht den `main`-Branch automatisch auf GitHub Pages.
Einmalig nötig: **Repository → Settings → Pages → Source: „GitHub Actions“**.

## Aufs iPhone bringen

1. Seite in **Safari** öffnen: `https://<dein-github-name>.github.io/<repo-name>/`
2. Unten auf das **Teilen-Symbol** (Quadrat mit Pfeil) tippen.
3. **„Zum Home-Bildschirm“** wählen → „Hinzufügen“.
4. Questly über das neue Icon starten – es läuft im Vollbild und funktioniert offline.

> Hinweis: Auf dem iPhone hat die Home-Bildschirm-App einen eigenen Speicher, getrennt von Safari. Mach ab und zu ein Backup (Funke → ⚙️ → Daten exportieren → „In Dateien sichern“).
