import { ArrowDownToLine, Bot, Mic, Mountain, Orbit, Radio, Skull, Squirrel, type LucideIcon } from "lucide-react";
import { PRESETS, type PresetIcon } from "../presets";

const ICONS: Record<PresetIcon, LucideIcon> = {
  mic: Mic,
  robot: Bot,
  squirrel: Squirrel,
  deep: ArrowDownToLine,
  radio: Radio,
  cave: Mountain,
  demon: Skull,
  alien: Orbit,
};

interface Props {
  active: string;
  onSelect: (name: string) => void;
}

export function PresetGrid({ active, onSelect }: Props) {
  return (
    <div className="presets">
      {PRESETS.map((p) => {
        const Icon = ICONS[p.icon];
        return (
          <button
            key={p.name}
            className={p.name === active ? "preset active" : "preset"}
            onClick={() => onSelect(p.name)}
          >
            <span className="preset-icon">
              <Icon size={26} />
            </span>
            {p.name}
          </button>
        );
      })}
    </div>
  );
}
