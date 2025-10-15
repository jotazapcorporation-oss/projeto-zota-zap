import { 
  PiggyBank, Target, Home, Car, Plane, GraduationCap, 
  Heart, Gift, Sparkles, Trophy, Star, Crown,
  ShoppingBag, Camera, Music, Gamepad2, Coffee, Pizza,
  Dumbbell, Book, Briefcase, Rocket, Palmtree, Mountain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

const ICONS = [
  { name: 'piggy-bank', Icon: PiggyBank, label: 'Cofre' },
  { name: 'target', Icon: Target, label: 'Meta' },
  { name: 'home', Icon: Home, label: 'Casa' },
  { name: 'car', Icon: Car, label: 'Carro' },
  { name: 'plane', Icon: Plane, label: 'Viagem' },
  { name: 'graduation-cap', Icon: GraduationCap, label: 'Estudo' },
  { name: 'heart', Icon: Heart, label: 'Saúde' },
  { name: 'gift', Icon: Gift, label: 'Presente' },
  { name: 'sparkles', Icon: Sparkles, label: 'Especial' },
  { name: 'trophy', Icon: Trophy, label: 'Troféu' },
  { name: 'star', Icon: Star, label: 'Estrela' },
  { name: 'crown', Icon: Crown, label: 'Premium' },
  { name: 'shopping-bag', Icon: ShoppingBag, label: 'Compras' },
  { name: 'camera', Icon: Camera, label: 'Câmera' },
  { name: 'music', Icon: Music, label: 'Música' },
  { name: 'game', Icon: Gamepad2, label: 'Game' },
  { name: 'coffee', Icon: Coffee, label: 'Café' },
  { name: 'pizza', Icon: Pizza, label: 'Pizza' },
  { name: 'dumbbell', Icon: Dumbbell, label: 'Fitness' },
  { name: 'book', Icon: Book, label: 'Livro' },
  { name: 'briefcase', Icon: Briefcase, label: 'Trabalho' },
  { name: 'rocket', Icon: Rocket, label: 'Foguete' },
  { name: 'palmtree', Icon: Palmtree, label: 'Praia' },
  { name: 'mountain', Icon: Mountain, label: 'Aventura' },
];

export const getIconComponent = (iconName?: string) => {
  const icon = ICONS.find(i => i.name === iconName);
  return icon?.Icon || PiggyBank;
};

interface IconPickerProps {
  value?: string;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const SelectedIcon = getIconComponent(value);

  return (
    <div className="space-y-2">
      <Label>Ícone da Caixinha</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start gap-2">
            <SelectedIcon className="h-5 w-5" />
            <span>{ICONS.find(i => i.name === value)?.label || 'Escolher ícone'}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid grid-cols-4 gap-2">
            {ICONS.map(({ name, Icon, label }) => (
              <Button
                key={name}
                variant={value === name ? "default" : "outline"}
                size="sm"
                className="h-16 flex-col gap-1"
                onClick={() => onChange(name)}
                title={label}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
