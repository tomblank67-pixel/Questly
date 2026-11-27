import { useRef, useState } from 'react';
import { Label, Segmented, Sheet } from '../components/ui';
import { useApp } from '../state/AppContext';
import { CATEGORIES } from '../data/categories';
import { downloadBackup, importBackupFile } from '../lib/backup';
import { repo } from '../db/repo';
import type { CategoryId } from '../types';

export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings, updateSettings, showToast } = useApp();
  const fileInput = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = (id: CategoryId) => {
    const on = settings.enabledCategories.includes(id);
    if (on && settings.enabledCategories.length === 1) return showToast('Mindestens eine Kategorie muss aktiv bleiben.');
    void updateSettings({ enabledCategories: on ? settings.enabledCategories.filter((c) => c !== id) : [...settings.enabledCategories, id] });
  };

  const onImport = async (file?: File) => {
    if (!file) return;
    setError(null);
    try {
      await importBackupFile(file);
      showToast('Backup wiederhergestellt! 🎉');
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Einstellungen">
      <Label>Tageswechsel</Label>
      <p className="-mt-1 mb-2 text-sm text-parchment-400">Ab dieser Uhrzeit gibt es neue Tagesquests. Alles davor zählt noch zum Vortag.</p>
      <select
        className="field"
        value={settings.rolloverHour}
        onChange={(e) => void updateSettings({ rolloverHour: Number(e.target.value) })}
      >
        {Array.from({ length: 13 }, (_, h) => (
          <option key={h} value={h}>
            {String(h).padStart(2, '0')}:00 Uhr
          </option>
        ))}
      </select>

      <Label>Anzahl Tagesquests</Label>
      <Segmented<number>
        value={settings.dailyCount}
        onChange={(dailyCount) => void updateSettings({ dailyCount })}
        options={[3, 4, 5].map((n) => ({ value: n, label: String(n) }))}
      />

      <Label>Kategorien</Label>
      <div className="grid grid-cols-2 gap-2">
        {CATEGORIES.map((c) => {
          const on = settings.enabledCategories.includes(c.id);
          return (
            <button
              key={c.id}
              onClick={() => toggleCategory(c.id)}
              className="flex min-h-[52px] items-center gap-2 rounded-xl border-2 px-3 font-bold"
              style={on ? { borderColor: c.color, background: `${c.color}22` } : { borderColor: 'rgb(var(--night-600))', opacity: 0.55 }}
            >
              <span className="text-xl">{c.emoji}</span>
              <span className="flex-1 text-left">{c.name}</span>
              <span>{on ? '✔' : '–'}</span>
            </button>
          );
        })}
      </div>

      <Label>Design</Label>
      <Segmented
        value={settings.theme}
        onChange={(theme) => void updateSettings({ theme })}
        options={[
          { value: 'dark', label: '🌙 Dunkel' },
          { value: 'light', label: '☀️ Hell' },
        ]}
      />

      <Label>Daten & Backup</Label>
      <p className="-mt-1 mb-3 text-sm text-parchment-400">
        Alles wird nur auf diesem Gerät gespeichert. Mach ab und zu ein Backup – z. B. in die Dateien-App oder iCloud Drive.
      </p>
      <div className="flex flex-col gap-3">
        <button className="pixel-btn-ghost w-full" onClick={() => downloadBackup().catch((e) => setError(String(e)))}>
          ⬇ Daten exportieren (JSON)
        </button>
        <button className="pixel-btn-ghost w-full" onClick={() => fileInput.current?.click()}>
          ⬆ Backup importieren
        </button>
        <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onImport(e.target.files?.[0])} />
        {error && <div className="rounded-lg bg-red-900/40 px-3 py-2 text-sm text-red-200">{error}</div>}
        <p className="text-xs text-parchment-400">Achtung: Ein Import ersetzt alle aktuellen Daten.</p>
        <button
          className={`pixel-btn w-full ${confirmReset ? 'bg-red-600 text-white' : 'bg-night-700 text-red-300'}`}
          onClick={async () => {
            if (!confirmReset) return setConfirmReset(true);
            await repo.resetAll();
            setConfirmReset(false);
            showToast('Alles zurückgesetzt – ein neues Abenteuer beginnt!');
            onClose();
          }}
        >
          {confirmReset ? 'Sicher? Alles wird gelöscht – nochmal tippen' : 'Alle Daten löschen'}
        </button>
      </div>

      <p className="mt-8 text-center text-xs text-parchment-400">Questly v{__APP_VERSION__} · mit 🔥 gemacht</p>
    </Sheet>
  );
}
