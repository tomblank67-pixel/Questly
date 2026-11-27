import { useEffect, type ReactNode } from 'react';
import { PixelIcon } from './PixelIcon';
import { CATEGORIES, DIFFICULTY_LABEL, XP_BY_DIFFICULTY, categoryInfo } from '../data/categories';
import type { CategoryId, Difficulty } from '../types';

/** Bottom sheet with backdrop. Closes on backdrop tap. */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      <div className="fade-in absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        role="dialog"
        aria-label={title}
        className="slide-up pb-safe relative max-h-[88dvh] overflow-y-auto rounded-t-3xl border-t-2 border-night-600 bg-night-800 px-5 pt-3"
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-night-600" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-pixel text-2xl text-ember-300">{title}</h2>
          <button onClick={onClose} className="grid h-11 w-11 place-items-center rounded-xl bg-night-700 text-parchment-300" aria-label="Schließen">
            <PixelIcon name="close" size={16} />
          </button>
        </div>
        <div className="pb-4">{children}</div>
      </div>
    </div>
  );
}

export function ProgressBar({ value, color = '#ffb454', className = '' }: { value: number; color?: string; className?: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className={`h-4 overflow-hidden rounded-md border-2 border-black/40 bg-night-950 ${className}`}>
      <div
        className="h-full transition-[width] duration-700 ease-out"
        style={{
          width: `${pct}%`,
          background: `repeating-linear-gradient(90deg, ${color} 0 8px, ${color}dd 8px 10px)`,
          boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.25), inset 0 2px 0 rgba(255,255,255,0.3)',
        }}
      />
    </div>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-3 mt-6 flex items-end justify-between">
      <h2 className="font-pixel text-xl text-parchment-200">{children}</h2>
      {right}
    </div>
  );
}

export function Chip({ children, color, className = '' }: { children: ReactNode; color?: string; className?: string }) {
  return (
    <span
      className={`chip inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${className}`}
      style={color ? { background: `${color}26`, color } : undefined}
    >
      {children}
    </span>
  );
}

export function DifficultyChip({ difficulty }: { difficulty: Difficulty }) {
  const color = difficulty === 'episch' ? '#ff8fd0' : difficulty === 'mittel' ? '#ffc94a' : '#9fd58f';
  return (
    <Chip color={color}>
      {difficulty === 'episch' ? '★★★' : difficulty === 'mittel' ? '★★' : '★'} {DIFFICULTY_LABEL[difficulty]} · {XP_BY_DIFFICULTY[difficulty]} XP
    </Chip>
  );
}

export function CategoryBadge({ category, size = 48 }: { category: CategoryId; size?: number }) {
  const c = categoryInfo(category);
  return (
    <div
      className="grid shrink-0 place-items-center rounded-xl border-2"
      style={{ width: size, height: size, background: `${c.color}22`, borderColor: `${c.color}66`, fontSize: size * 0.48 }}
      aria-label={c.name}
    >
      {c.emoji}
    </div>
  );
}

/** Segmented selector used in forms/settings. */
export function Segmented<T extends string | number>({ value, options, onChange }: { value: T; options: { value: T; label: ReactNode }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={`min-h-[48px] flex-1 rounded-xl border-2 px-2 font-bold transition-colors ${
            o.value === value ? 'border-ember-400 bg-ember-500/20 text-ember-300' : 'border-night-600 bg-night-900 text-parchment-300'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function CategoryPicker({ value, onChange }: { value: CategoryId; onChange: (c: CategoryId) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {CATEGORIES.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onChange(c.id)}
          className="flex min-h-[56px] flex-col items-center justify-center rounded-xl border-2 text-sm font-bold"
          style={
            c.id === value
              ? { borderColor: c.color, background: `${c.color}26`, color: c.color }
              : { borderColor: 'rgb(var(--night-600))', background: 'rgb(var(--night-900))' }
          }
        >
          <span className="text-xl">{c.emoji}</span>
          {c.name}
        </button>
      ))}
    </div>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <div className="mb-2 mt-5 text-sm font-bold uppercase tracking-wide text-parchment-400">{children}</div>;
}

/** Small transient notification. */
export function Toast({ message, icon }: { message: string; icon?: ReactNode }) {
  return (
    <div className="pop-in pointer-events-none fixed inset-x-4 top-[max(env(safe-area-inset-top),12px)] z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border-2 border-ember-400 bg-night-800 px-4 py-3 shadow-pixel">
      {icon}
      <div className="font-bold">{message}</div>
    </div>
  );
}
