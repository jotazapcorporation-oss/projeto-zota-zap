import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const COLORS = [
  { name: 'default', label: 'Padrão', class: 'border-primary bg-primary/5' },
  { name: 'rose', label: 'Rosa', class: 'border-rose-500 bg-rose-50 dark:bg-rose-950/30' },
  { name: 'pink', label: 'Pink', class: 'border-pink-500 bg-pink-50 dark:bg-pink-950/30' },
  { name: 'fuchsia', label: 'Fúcsia', class: 'border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-950/30' },
  { name: 'purple', label: 'Roxo', class: 'border-purple-500 bg-purple-50 dark:bg-purple-950/30' },
  { name: 'violet', label: 'Violeta', class: 'border-violet-500 bg-violet-50 dark:bg-violet-950/30' },
  { name: 'indigo', label: 'Índigo', class: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' },
  { name: 'blue', label: 'Azul', class: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' },
  { name: 'sky', label: 'Céu', class: 'border-sky-500 bg-sky-50 dark:bg-sky-950/30' },
  { name: 'cyan', label: 'Ciano', class: 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30' },
  { name: 'teal', label: 'Turquesa', class: 'border-teal-500 bg-teal-50 dark:bg-teal-950/30' },
  { name: 'emerald', label: 'Esmeralda', class: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
  { name: 'green', label: 'Verde', class: 'border-green-500 bg-green-50 dark:bg-green-950/30' },
  { name: 'lime', label: 'Lima', class: 'border-lime-500 bg-lime-50 dark:bg-lime-950/30' },
  { name: 'yellow', label: 'Amarelo', class: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30' },
  { name: 'amber', label: 'Âmbar', class: 'border-amber-500 bg-amber-50 dark:bg-amber-950/30' },
  { name: 'orange', label: 'Laranja', class: 'border-orange-500 bg-orange-50 dark:bg-orange-950/30' },
  { name: 'red', label: 'Vermelho', class: 'border-red-500 bg-red-50 dark:bg-red-950/30' },
  { name: 'slate', label: 'Ardósia', class: 'border-slate-500 bg-slate-50 dark:bg-slate-950/30' },
  { name: 'gray', label: 'Cinza', class: 'border-gray-500 bg-gray-50 dark:bg-gray-950/30' },
];

export const getColorClass = (color?: string) => {
  return COLORS.find(c => c.name === color)?.class || COLORS[0].class;
};

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label>Cor da Caixinha</Label>
      <div className="grid grid-cols-5 gap-2">
        {COLORS.map(({ name, label, class: colorClass }) => (
          <Button
            key={name}
            variant="outline"
            size="sm"
            className={cn(
              "h-12 relative",
              colorClass,
              value === name && "ring-2 ring-offset-2 ring-primary"
            )}
            onClick={() => onChange(name)}
            title={label}
          >
            {value === name && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
