import { repo } from '../db/repo';

/**
 * Saves the backup as a JSON file. On iOS the share sheet ("In Dateien sichern")
 * is the most reliable way; elsewhere a classic download is used.
 */
export async function downloadBackup(): Promise<void> {
  const data = await repo.exportData();
  const name = `questly-backup-${data.exportedAt.slice(0, 10)}.json`;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const file = new File([blob], name, { type: 'application/json' });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Questly-Backup' });
      return;
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return; // user cancelled
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export async function importBackupFile(file: File): Promise<void> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error('Die Datei ist kein gültiges JSON.');
  }
  await repo.importData(parsed);
}
