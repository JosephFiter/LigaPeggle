import { useEffect, type ButtonHTMLAttributes, type ReactNode } from "react";
import { masterById } from "../../domain/masters";
import type { Player } from "../../domain/types";
import "./ui.css";

type Variant = "orange" | "blue" | "green" | "ghost" | "danger";

export function PegButton({
  variant = "orange",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button {...props} className={`peg-btn peg-btn--${variant} ${className}`} />;
}

export function Panel({ title, actions, children, className = "" }: {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      {(title || actions) && (
        <header className="panel__header">
          {title && <h2 className="panel__title">{title}</h2>}
          {actions && <div className="panel__actions">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Avatar({ player, size = "md" }: { player: Player; size?: "sm" | "md" | "lg" }) {
  const master = masterById(player.masterId);
  return (
    <span
      className={`avatar avatar--${size}`}
      style={{ "--peg-color": master.color } as React.CSSProperties}
      title={master.name}
      aria-hidden
    >
      {master.emoji}
    </span>
  );
}

export function PlayerTag({ player, size }: { player: Player; size?: "sm" | "md" | "lg" }) {
  return (
    <span className="player-tag">
      <Avatar player={player} size={size} />
      <span className="player-tag__name">{player.name}</span>
    </span>
  );
}

/** Barra de progreso estilo medidor de Fever. */
export function FeverMeter({ value, total, label }: { value: number; total: number; label?: string }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  const complete = total > 0 && value >= total;
  return (
    <div className={`fever ${complete ? "fever--extreme" : ""}`}>
      <div className="fever__track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="fever__fill" style={{ width: `${pct}%` }} />
        {[25, 50, 75].map((m) => (
          <span key={m} className="fever__mark" style={{ left: `${m}%` }} />
        ))}
      </div>
      <div className="fever__label">
        {complete ? "EXTREME FEVER!" : label ?? `${value} / ${total}`}
        <span className="fever__pct">{pct}%</span>
      </div>
    </div>
  );
}

export function EmptyState({ emoji = "🦄", title, children }: { emoji?: string; title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty__emoji">{emoji}</div>
      <h3>{title}</h3>
      {children && <div className="empty__body">{children}</div>}
    </div>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal panel" role="dialog" aria-modal aria-label={title}>
        <header className="panel__header">
          <h2 className="panel__title">{title}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Cerrar">✕</button>
        </header>
        {children}
      </div>
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="segmented" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={o.value === value}
          className={o.value === value ? "is-active" : ""}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const formatScore = (n: number) => n.toLocaleString("es-AR");
