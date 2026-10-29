import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  icon: LucideIcon;
  title: string;
  /** Omit for effects that are always on. */
  enabled?: boolean;
  onToggle?: (on: boolean) => void;
  children: ReactNode;
}

export function EffectCard({ icon: Icon, title, enabled, onToggle, children }: Props) {
  const active = enabled ?? true;
  return (
    <article className={active ? "card effect on" : "card effect"}>
      <header className="effect-head">
        <span className="effect-icon">
          <Icon size={18} />
        </span>
        <h3>{title}</h3>
        {onToggle && (
          <label className="switch" aria-label={`Toggle ${title}`}>
            <input type="checkbox" checked={enabled} onChange={(e) => onToggle(e.currentTarget.checked)} />
            <span className="track" />
          </label>
        )}
      </header>
      <div className="effect-body">{children}</div>
    </article>
  );
}
