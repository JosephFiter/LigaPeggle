import { useState, type FormEvent } from "react";
import { MASTERS } from "../../domain/masters";
import { PegButton } from "../../components/ui/ui";

export interface PlayerFormValues {
  name: string;
  masterId: string;
}

export function PlayerForm({ initial, submitLabel, takenNames, onSubmit, onCancel }: {
  initial?: PlayerFormValues;
  submitLabel: string;
  /** Nombres ya usados (en minúscula) para evitar duplicados. */
  takenNames: string[];
  onSubmit: (v: PlayerFormValues) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [masterId, setMasterId] = useState(initial?.masterId ?? MASTERS[0].id);

  const trimmed = name.trim();
  const duplicate = takenNames.includes(trimmed.toLowerCase());
  const valid = trimmed.length > 0 && !duplicate;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit({ name: trimmed, masterId });
    if (!initial) setName("");
  };

  return (
    <form className="player-form" onSubmit={submit}>
      <div className="player-form__row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del jugador"
          maxLength={24}
          aria-label="Nombre del jugador"
          aria-invalid={duplicate}
        />
        {onCancel && <PegButton type="button" variant="ghost" onClick={onCancel}>Cancelar</PegButton>}
        <PegButton type="submit" variant="green" disabled={!valid}>{submitLabel}</PegButton>
      </div>
      {duplicate && <p className="player-form__error">Ya hay un jugador con ese nombre.</p>}

      <fieldset className="master-picker">
        <legend className="muted">Elegí tu Peggle Master</legend>
        {MASTERS.map((m) => (
          <label
            key={m.id}
            className={`master-picker__item ${m.id === masterId ? "is-selected" : ""}`}
            style={{ "--peg-color": m.color } as React.CSSProperties}
            title={`${m.name} · ${m.power}`}
          >
            <input type="radio" name="master" value={m.id} checked={m.id === masterId} onChange={() => setMasterId(m.id)} />
            <span className="avatar avatar--md">{m.emoji}</span>
            <span className="master-picker__name">{m.name}</span>
          </label>
        ))}
      </fieldset>
    </form>
  );
}
