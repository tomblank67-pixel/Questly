/**
 * Light haptic feedback.
 *
 * - Android/Chrome: navigator.vibrate
 * - iOS Safari (18+) has no Vibration API, but toggling a native
 *   `<input type="checkbox" switch>` via its label produces a system haptic tick.
 *   We use a hidden one as a best-effort fallback; on older iOS it simply does nothing.
 */
let label: HTMLLabelElement | null = null;

function iosTick() {
  if (!label) {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', '');
    input.id = 'questly-haptic';
    input.style.display = 'none';
    label = document.createElement('label');
    label.htmlFor = input.id;
    label.style.display = 'none';
    label.appendChild(input);
    document.body.appendChild(label);
  }
  label.click();
}

export function haptic(pattern: 'light' | 'success' = 'light') {
  try {
    if (typeof navigator.vibrate === 'function' && navigator.vibrate(pattern === 'success' ? [12, 60, 24] : 10)) return;
    iosTick();
    if (pattern === 'success') setTimeout(iosTick, 120);
  } catch {
    /* haptics are a nice-to-have */
  }
}
